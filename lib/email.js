import { Resend } from "resend";

/**
 * Order-status emails to the customer, when they gave one -- there's no
 * customer-account system, so `order.customer.email` (optional on the
 * Order model) is the only way to reach them. Sending is always
 * best-effort: a missing key, a Resend error, or no email on the order
 * at all should never block the actual status update (see
 * lib/actions/orders.js) -- this is a "nice to have" on top of the real
 * mutation, not a requirement for it.
 */

const STATUS_COPY = {
  pending: "We've received your order and it's waiting to be confirmed.",
  confirmed: "Your order has been confirmed and is being prepared.",
  processing: "Your order is being packed.",
  shipped: "Your order is on its way.",
  delivered: "Your order has been delivered. We hope you love it!",
  cancelled: "Your order has been cancelled.",
  returned: "Your order has been marked as returned.",
};

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendOrderStatusEmail(order, status) {
  const to = order.customer?.email;
  if (!to) return; // No email on this order -- nothing to send, not an error.

  const resend = getClient();
  if (!resend) {
    console.warn("RESEND_API_KEY is not set -- skipping order status email.");
    return;
  }

  const summary = STATUS_COPY[status] || `Your order status is now "${status}".`;
  const orderNumber = String(order._id).slice(-6).toUpperCase();

  try {
    await resend.emails.send({
      // resend.dev's shared test address works without verifying a
      // domain -- swap this for a verified "orders@cosmosscents.com" (or
      // similar) once Jamil adds his own domain in the Resend dashboard.
      from: process.env.RESEND_FROM_EMAIL || "Cosmos Scents <onboarding@resend.dev>",
      to,
      subject: `Order #${orderNumber} -- ${status}`,
      text: `Hi ${order.customer.name},\n\n${summary}\n\nOrder #${orderNumber}, Rs ${order.total.toLocaleString()}.\n\n-- Cosmos Scents`,
    });
  } catch (err) {
    // Best-effort -- log it, but never throw from here (see the comment
    // at the top of this file).
    console.error("Order status email failed:", err);
  }
}
