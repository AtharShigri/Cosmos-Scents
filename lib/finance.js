import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function getFinanceData() {
  await dbConnect();

  const orders = await Order.find().sort({ createdAt: -1 }).lean();

  let grossRevenue = 0;
  let settledCash = 0;
  let inTransitCash = 0;
  let codTotal = 0;
  let codCount = 0;
  let bankTotal = 0;
  let bankCount = 0;

  const transactions = orders.map((o) => {
    const isCancelled = o.status === "cancelled" || o.status === "returned";
    const isSettled = o.status === "delivered";
    const isInTransit = o.status === "shipped" || o.status === "processing" || o.status === "confirmed" || o.status === "pending";

    if (!isCancelled) {
      grossRevenue += o.total || 0;
      if (isSettled) {
        settledCash += o.total || 0;
      } else if (isInTransit) {
        inTransitCash += o.total || 0;
      }

      if (o.paymentMethod === "cod") {
        codTotal += o.total || 0;
        codCount++;
      } else {
        bankTotal += o.total || 0;
        bankCount++;
      }
    }

    let financialStatus = "in_transit";
    if (isSettled) financialStatus = "settled";
    else if (isCancelled) financialStatus = "cancelled";
    else if (o.paymentMethod === "bank_transfer" && o.status === "pending") financialStatus = "verification_required";

    return {
      txnId: `TXN-${String(o._id).slice(-6).toUpperCase()}`,
      orderId: String(o._id),
      customerName: o.customer.name,
      customerCity: o.customer.city,
      customerPhone: o.customer.phone,
      paymentMethod: o.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer",
      paymentMethodRaw: o.paymentMethod,
      total: o.total,
      orderStatus: o.status,
      financialStatus,
      createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
      itemCount: (o.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0),
    };
  });

  const aov = orders.length > 0 ? Math.round(grossRevenue / Math.max(1, orders.length - orders.filter(o => o.status === 'cancelled').length)) : 0;

  return {
    metrics: {
      grossRevenue,
      settledCash,
      inTransitCash,
      totalTransactions: transactions.length,
      aov,
      codTotal,
      codCount,
      bankTotal,
      bankCount,
    },
    transactions,
  };
}

