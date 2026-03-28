import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";

const router: IRouter = Router();

// Scrub sensitive values from any error message before sending to the client.
// This ensures that even if an internal error accidentally contains a key value,
// it will never be visible in the API response.
function sanitizeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "An unexpected error occurred";
  const keyId = process.env["RAZORPAY_KEY_ID"] ?? "";
  const keySecret = process.env["RAZORPAY_KEY_SECRET"] ?? "";

  let safe = raw;
  if (keyId && safe.includes(keyId)) safe = safe.replaceAll(keyId, "[REDACTED]");
  if (keySecret && safe.includes(keySecret)) safe = safe.replaceAll(keySecret, "[REDACTED]");

  // Also strip any env-var-shaped tokens (rzp_live_*, rzp_test_*)
  safe = safe.replace(/rzp_(test|live)_[A-Za-z0-9]+/g, "[REDACTED]");

  return safe;
}

function getRazorpayClient(): Razorpay {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) {
    throw new Error("Payment gateway is not configured on the server.");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// POST /api/payments/create-order
// Creates a Razorpay order and returns the public key ID + order details.
// The KEY SECRET is NEVER included in this response.
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes } = req.body as {
      amount: number;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string>;
    };

    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ error: "Valid amount in paise is required." });
      return;
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt: receipt ?? `rcpt_${Date.now()}`,
      notes: notes ?? {},
    });

    // Only the PUBLIC key ID goes to the client — never the secret.
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      keyId: process.env["RAZORPAY_KEY_ID"],
    });
  } catch (err) {
    res.status(500).json({ error: sanitizeError(err) });
  }
});

// POST /api/payments/verify
// Verifies the Razorpay payment signature using HMAC-SHA256.
// Uses timing-safe comparison to prevent timing attacks.
// The KEY SECRET is used only for hashing — never returned in any response.
router.post("/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing payment verification fields." });
      return;
    }

    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) {
      res.status(500).json({ error: "Payment gateway is not configured on the server." });
      return;
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    // Timing-safe comparison: prevents attackers from guessing the signature
    // byte-by-byte by measuring response time differences.
    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(razorpay_signature, "hex");

    const isValid =
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received);

    if (!isValid) {
      res.status(400).json({ success: false, error: "Payment signature is invalid." });
      return;
    }

    res.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      message: "Payment verified successfully.",
    });
  } catch (err) {
    res.status(500).json({ error: sanitizeError(err) });
  }
});

// GET /api/payments/config
// Returns only the PUBLIC key ID — safe to expose to the browser.
router.get("/config", (_req, res) => {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  if (!keyId) {
    res.status(500).json({ error: "Payment gateway is not configured." });
    return;
  }
  res.json({ keyId });
});

export default router;
