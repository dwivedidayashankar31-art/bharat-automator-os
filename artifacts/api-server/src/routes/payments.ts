import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";

const router: IRouter = Router();

function getRazorpayClient() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body as {
      amount: number;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string>;
    };

    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ error: "Valid amount (in paise) is required" });
      return;
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt: receipt ?? `rcpt_${Date.now()}`,
      notes: notes ?? {},
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      keyId: process.env["RAZORPAY_KEY_ID"],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    res.status(500).json({ error: message });
  }
});

router.post("/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing payment verification fields" });
      return;
    }

    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) {
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ success: false, error: "Invalid payment signature" });
      return;
    }

    res.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      message: "Payment verified successfully",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    res.status(500).json({ error: message });
  }
});

router.get("/config", (_req, res) => {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  if (!keyId) {
    res.status(500).json({ error: "Razorpay not configured" });
    return;
  }
  res.json({ keyId });
});

export default router;
