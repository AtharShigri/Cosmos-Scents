import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

export class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Builds and saves an order from a cart payload. Prices and stock are
 * always re-read from the database here -- the client's cart state is
 * display-only and never trusted for money or inventory.
 */
export async function createOrder({ customer, items, paymentMethod, notes }) {
  if (!customer?.name || !customer?.phone || !customer?.address || !customer?.city) {
    throw new OrderError("Missing required customer details.");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError("Cart is empty.");
  }
  if (!["cod", "bank_transfer"].includes(paymentMethod)) {
    throw new OrderError("Invalid payment method.");
  }

  await dbConnect();

  const orderItems = [];
  let total = 0;

  for (const { productId, quantity } of items) {
    const qty = Number(quantity);
    if (!productId || !Number.isInteger(qty) || qty <= 0) {
      throw new OrderError("Invalid cart item.");
    }

    const product = await Product.findOne({ _id: productId, active: true });
    if (!product) {
      throw new OrderError(`A product in your cart is no longer available.`);
    }
    if (product.stock < qty) {
      throw new OrderError(
        `Only ${product.stock} left of "${product.name}" -- please update your cart.`
      );
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: qty,
    });
    total += product.price * qty;
  }

  // Decrement stock per item. Not wrapped in a multi-document transaction
  // (Atlas free-tier replica sets support them, but at this scale a plain
  // sequential decrement is simple and good enough).
  for (const item of orderItems) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
  }

  const order = await Order.create({
    customer,
    items: orderItems,
    total,
    paymentMethod,
    notes: notes || "",
  });

  return { orderId: String(order._id) };
}

export async function getOrderById(id) {
  await dbConnect();
  const order = await Order.findById(id).lean();
  if (!order) return null;
  return {
    ...order,
    _id: String(order._id),
    items: order.items.map((item) => ({ ...item, product: String(item.product) })),
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
  };
}

// Admin-only listing -- every order, newest first. `status` optionally
// filters to one status (see components/StatusSelect.js / models/Order.js
// for the full list); omit it (or pass "all") for everything.
export async function getAllOrders(status) {
  await dbConnect();
  const filter = status && status !== "all" ? { status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return orders.map((order) => ({
    ...order,
    _id: String(order._id),
    items: order.items.map((item) => ({ ...item, product: String(item.product) })),
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
  }));
}

export async function getDashboardStats() {
  await dbConnect();

  const [orderCount, pendingCount, revenueAgg, productCount, lowStock, recentOrders] =
    await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "returned"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Product.countDocuments({ active: true }),
      Product.find({ active: true, stock: { $lte: 5 } })
        .select("name stock")
        .sort({ stock: 1 })
        .lean(),
      // A handful of recent orders for the dashboard's "details, not
      // just numbers" view -- the full list with filtering lives at
      // /admin/orders.
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  return {
    orderCount,
    pendingCount,
    revenue: revenueAgg[0]?.total ?? 0,
    productCount,
    lowStock: lowStock.map((p) => ({ _id: String(p._id), name: p.name, stock: p.stock })),
    recentOrders: recentOrders.map((o) => ({
      _id: String(o._id),
      customerName: o.customer.name,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt?.toISOString(),
    })),
  };
}
