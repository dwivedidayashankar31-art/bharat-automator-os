import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface InvoiceItem {
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  gstPercent: number;
}

interface InvoiceRequest {
  seller: {
    name: string;
    gstin: string;
    address: string;
    state: string;
    stateCode: string;
  };
  buyer: {
    name: string;
    gstin?: string;
    address: string;
    state: string;
    stateCode: string;
  };
  items: InvoiceItem[];
  invoiceDate?: string;
  dueDate?: string;
  notes?: string;
}

let invoiceCounter = Date.now() % 100000;

function validateItem(item: InvoiceItem, index: number): string | null {
  if (!item.description || typeof item.description !== "string" || item.description.trim().length === 0)
    return `Item ${index + 1}: description is required`;
  if (typeof item.qty !== "number" || !Number.isFinite(item.qty) || item.qty < 1 || item.qty > 999999)
    return `Item ${index + 1}: qty must be between 1 and 999999`;
  if (typeof item.rate !== "number" || !Number.isFinite(item.rate) || item.rate < 0 || item.rate > 99999999)
    return `Item ${index + 1}: rate must be between 0 and 99999999`;
  if (typeof item.gstPercent !== "number" || ![0, 5, 12, 18, 28].includes(item.gstPercent))
    return `Item ${index + 1}: gstPercent must be 0, 5, 12, 18, or 28`;
  return null;
}

router.post("/generate", (req, res) => {
  try {
    const body = req.body as InvoiceRequest;

    if (!body.seller?.name?.trim() || !body.seller?.stateCode?.trim()) {
      res.status(400).json({ error: "Seller name and state code are required." });
      return;
    }
    if (!body.buyer?.name?.trim() || !body.buyer?.stateCode?.trim()) {
      res.status(400).json({ error: "Buyer name and state code are required." });
      return;
    }
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
      res.status(400).json({ error: "Between 1 and 100 items are required." });
      return;
    }
    for (let i = 0; i < body.items.length; i++) {
      const err = validateItem(body.items[i]!, i);
      if (err) { res.status(400).json({ error: err }); return; }
    }

    invoiceCounter++;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${invoiceCounter.toString().padStart(5, "0")}`;
    const invoiceDate = body.invoiceDate ?? new Date().toISOString().split("T")[0];
    const dueDate = body.dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const isSameState = body.seller.stateCode === body.buyer.stateCode;

    const computedItems = body.items.map((item) => {
      const taxableAmount = item.qty * item.rate;
      const gstAmount = (taxableAmount * item.gstPercent) / 100;
      return {
        ...item,
        taxableAmount,
        cgst: isSameState ? gstAmount / 2 : 0,
        sgst: isSameState ? gstAmount / 2 : 0,
        igst: isSameState ? 0 : gstAmount,
        total: taxableAmount + gstAmount,
      };
    });

    const subtotal = computedItems.reduce((s, i) => s + i.taxableAmount, 0);
    const totalCgst = computedItems.reduce((s, i) => s + i.cgst, 0);
    const totalSgst = computedItems.reduce((s, i) => s + i.sgst, 0);
    const totalIgst = computedItems.reduce((s, i) => s + i.igst, 0);
    const grandTotal = computedItems.reduce((s, i) => s + i.total, 0);

    res.json({
      invoiceNumber,
      invoiceDate,
      dueDate,
      seller: body.seller,
      buyer: body.buyer,
      items: computedItems,
      isSameState,
      subtotal: Math.round(subtotal * 100) / 100,
      cgst: Math.round(totalCgst * 100) / 100,
      sgst: Math.round(totalSgst * 100) / 100,
      igst: Math.round(totalIgst * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      amountInWords: numberToWords(Math.round(grandTotal)),
      notes: body.notes ?? "Thank you for your business!",
    });
  } catch (err) {
    console.error("Invoice generation error:", err);
    res.status(500).json({ error: "Failed to generate invoice. Please try again." });
  }
});

function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n: number): string {
    if (n < 20) return ones[n]!;
    if (n < 100) return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
    if (n < 1000) return `${ones[Math.floor(n / 100)]} Hundred ${convert(n % 100)}`.trim();
    if (n < 100000) return `${convert(Math.floor(n / 1000))} Thousand ${convert(n % 1000)}`.trim();
    if (n < 10000000) return `${convert(Math.floor(n / 100000))} Lakh ${convert(n % 100000)}`.trim();
    return `${convert(Math.floor(n / 10000000))} Crore ${convert(n % 10000000)}`.trim();
  }

  return `${convert(num)} Rupees Only`;
}

export default router;
