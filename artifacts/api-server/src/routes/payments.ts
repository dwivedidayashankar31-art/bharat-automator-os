import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { db } from "@workspace/db";
import { paymentsTable, activitiesTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

function sanitizeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "An unexpected error occurred";
  const keyId = process.env["RAZORPAY_KEY_ID"] ?? "";
  const keySecret = process.env["RAZORPAY_KEY_SECRET"] ?? "";

  let safe = raw;
  if (keyId && safe.includes(keyId)) safe = safe.replaceAll(keyId, "[REDACTED]");
  if (keySecret && safe.includes(keySecret)) safe = safe.replaceAll(keySecret, "[REDACTED]");
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

router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes, plan, email, userId } = req.body as {
      amount: number;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string>;
      plan?: string;
      email?: string;
      userId?: string;
    };

    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ error: "Valid amount is required." });
      return;
    }

    const razorpay = getRazorpayClient();
    const receiptId = receipt ?? `rcpt_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt: receiptId,
      notes: notes ?? {},
    });

    await db.insert(paymentsTable).values({
      orderId: order.id,
      userId: userId || null,
      email: email || null,
      amount: Math.round(amount),
      currency,
      status: "created",
      plan: plan || null,
      receipt: receiptId,
      notes: notes || null,
    });

    await db.insert(activitiesTable).values({
      userId: userId || null,
      action: "payment_initiated",
      sector: "Payments",
      details: { orderId: order.id, amount, currency, plan },
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || null,
      userAgent: req.headers["user-agent"] || null,
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
    res.status(500).json({ error: sanitizeError(err) });
  }
});

router.post("/verify", async (req, res) => {
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

    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(razorpay_signature, "hex");

    const isValid =
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received);

    if (!isValid) {
      await db.update(paymentsTable)
        .set({ status: "failed" })
        .where(eq(paymentsTable.orderId, razorpay_order_id));

      res.status(400).json({ success: false, error: "Payment signature is invalid." });
      return;
    }

    await db.update(paymentsTable)
      .set({
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "verified",
        verifiedAt: new Date(),
      })
      .where(eq(paymentsTable.orderId, razorpay_order_id));

    await db.insert(activitiesTable).values({
      action: "payment_verified",
      sector: "Payments",
      details: { orderId: razorpay_order_id, paymentId: razorpay_payment_id },
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });

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

router.get("/config", (_req, res) => {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  if (!keyId) {
    res.status(500).json({ error: "Payment gateway is not configured." });
    return;
  }
  res.json({ keyId });
});

router.get("/history", async (_req, res) => {
  try {
    const payments = await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt)).limit(100);
    const stats = await db.select({
      totalPayments: sql<number>`count(*)`,
      totalRevenue: sql<number>`coalesce(sum(${paymentsTable.amount}), 0)`,
      verifiedPayments: sql<number>`count(*) filter (where ${paymentsTable.status} = 'verified')`,
      verifiedRevenue: sql<number>`coalesce(sum(${paymentsTable.amount}) filter (where ${paymentsTable.status} = 'verified'), 0)`,
    }).from(paymentsTable);

    res.json({
      payments,
      stats: stats[0] || { totalPayments: 0, totalRevenue: 0, verifiedPayments: 0, verifiedRevenue: 0 },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment history." });
  }
});

export default router;
