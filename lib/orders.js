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
