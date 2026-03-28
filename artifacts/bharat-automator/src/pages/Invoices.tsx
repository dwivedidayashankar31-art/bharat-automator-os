import { useState } from "react";
import { FileText, Plus, Trash2, Download, Loader2, IndianRupee, Building2, User, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  gstPercent: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  seller: { name: string; gstin: string; address: string; state: string; stateCode: string };
  buyer: { name: string; gstin: string; address: string; state: string; stateCode: string };
  items: (InvoiceItem & { taxableAmount: number; cgst: number; sgst: number; igst: number; total: number })[];
  isSameState: boolean;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  amountInWords: string;
  notes: string;
}

const INDIAN_STATES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
  "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh",
  "24": "Gujarat", "27": "Maharashtra", "29": "Karnataka", "32": "Kerala",
  "33": "Tamil Nadu", "36": "Telangana", "37": "Andhra Pradesh",
};

const emptyItem = (): InvoiceItem => ({ description: "", hsn: "", qty: 1, rate: 0, gstPercent: 18 });

function generatePDF(data: InvoiceData) {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, w, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${data.invoiceNumber}`, 14, 28);
  doc.text(`Date: ${data.invoiceDate}  |  Due: ${data.dueDate}`, 14, 34);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("From:", 14, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(data.seller.name, 14, 58);
  doc.text(`GSTIN: ${data.seller.gstin}`, 14, 63);
  doc.text(data.seller.address, 14, 68);
  doc.text(`${data.seller.state} (${data.seller.stateCode})`, 14, 73);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Bill To:", 120, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(data.buyer.name, 120, 58);
  if (data.buyer.gstin) doc.text(`GSTIN: ${data.buyer.gstin}`, 120, 63);
  doc.text(data.buyer.address, 120, 68);
  doc.text(`${data.buyer.state} (${data.buyer.stateCode})`, 120, 73);

  const taxCols = data.isSameState ? ["CGST", "SGST"] : ["IGST"];
  const headers = ["#", "Description", "HSN", "Qty", "Rate", "Taxable", ...taxCols, "Total"];

  const rows = data.items.map((item, i) => {
    const base = [
      (i + 1).toString(),
      item.description,
      item.hsn,
      item.qty.toString(),
      `${item.rate.toFixed(2)}`,
      `${item.taxableAmount.toFixed(2)}`,
    ];
    if (data.isSameState) {
      base.push(`${item.cgst.toFixed(2)}`, `${item.sgst.toFixed(2)}`);
    } else {
      base.push(`${item.igst.toFixed(2)}`);
    }
    base.push(`${item.total.toFixed(2)}`);
    return base;
  });

  autoTable(doc, {
    startY: 80,
    head: [headers],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: [99, 102, 241], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 3 },
  });

  const finalY = (doc as unknown as Record<string, number>)["lastAutoTable"]?.["finalY"] ?? 160;
  const summaryY = finalY + 10;

  doc.setFontSize(9);
  doc.text(`Subtotal:`, 130, summaryY);
  doc.text(`${data.subtotal.toFixed(2)}`, 185, summaryY, { align: "right" });

  if (data.isSameState) {
    doc.text(`CGST:`, 130, summaryY + 6);
    doc.text(`${data.cgst.toFixed(2)}`, 185, summaryY + 6, { align: "right" });
    doc.text(`SGST:`, 130, summaryY + 12);
    doc.text(`${data.sgst.toFixed(2)}`, 185, summaryY + 12, { align: "right" });
  } else {
    doc.text(`IGST:`, 130, summaryY + 6);
    doc.text(`${data.igst.toFixed(2)}`, 185, summaryY + 6, { align: "right" });
  }

  const totalOffset = data.isSameState ? 20 : 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setFillColor(240, 240, 255);
  doc.rect(128, summaryY + totalOffset - 5, 70, 10, "F");
  doc.text(`Grand Total:`, 130, summaryY + totalOffset + 1);
  doc.text(`INR ${data.grandTotal.toFixed(2)}`, 185, summaryY + totalOffset + 1, { align: "right" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(`Amount in words: ${data.amountInWords}`, 14, summaryY + totalOffset + 1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(data.notes, 14, summaryY + totalOffset + 14);
  doc.text("Generated by Bharat-Automator OS", 14, doc.internal.pageSize.getHeight() - 10);

  doc.save(`${data.invoiceNumber}.pdf`);
}

export default function Invoices() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceData | null>(null);

  const [sellerName, setSellerName] = useState("Bharat Technologies Pvt Ltd");
  const [sellerGstin, setSellerGstin] = useState("07AABCT1234A1Z5");
  const [sellerAddress, setSellerAddress] = useState("123 Connaught Place, New Delhi");
  const [sellerState, setSellerState] = useState("07");

  const [buyerName, setBuyerName] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerState, setBuyerState] = useState("07");

  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [notes, setNotes] = useState("Thank you for your business!");

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    (updated[i] as Record<string, string | number>)[field] = value;
    setItems(updated);
  };

  const subtotal = items.reduce((s, item) => s + item.qty * item.rate, 0);

  const handleGenerate = async () => {
    if (!buyerName.trim()) {
      toast({ title: "Buyer name is required", variant: "destructive" });
      return;
    }
    if (items.some(item => !item.description.trim() || item.rate <= 0)) {
      toast({ title: "Fill all item details with valid rates", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/invoices/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller: { name: sellerName, gstin: sellerGstin, address: sellerAddress, state: INDIAN_STATES[sellerState] ?? "Delhi", stateCode: sellerState },
          buyer: { name: buyerName, gstin: buyerGstin, address: buyerAddress, state: INDIAN_STATES[buyerState] ?? "Delhi", stateCode: buyerState },
          items,
          notes,
        }),
      });
      const data = await res.json() as InvoiceData;
      if (!res.ok) throw new Error((data as unknown as { error: string }).error);
      setGeneratedInvoice(data);
      toast({ title: "Invoice Generated!", description: `Invoice #${data.invoiceNumber}` });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to generate", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <PageHeader
        icon={FileText}
        title="Invoice Generator"
        description="Create GST-compliant tax invoices with automatic CGST/SGST/IGST calculation"
        badge="GST Ready"
        badgeVariant="default"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Building2 size={14} className="text-primary" /> Seller Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-[11px] text-muted-foreground">Business Name</Label>
              <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">GSTIN</Label>
              <Input value={sellerGstin} onChange={(e) => setSellerGstin(e.target.value)} placeholder="07AABCT1234A1Z5" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Address</Label>
              <Input value={sellerAddress} onChange={(e) => setSellerAddress(e.target.value)} />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">State</Label>
              <select value={sellerState} onChange={(e) => setSellerState(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                {Object.entries(INDIAN_STATES).map(([code, name]) => (
                  <option key={code} value={code}>{code} - {name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><User size={14} className="text-primary" /> Buyer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-[11px] text-muted-foreground">Customer Name *</Label>
              <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Enter customer name" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">GSTIN (optional)</Label>
              <Input value={buyerGstin} onChange={(e) => setBuyerGstin(e.target.value)} placeholder="If B2B transaction" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Address</Label>
              <Input value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} placeholder="Enter address" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">State</Label>
              <select value={buyerState} onChange={(e) => setBuyerState(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm">
                {Object.entries(INDIAN_STATES).map(([code, name]) => (
                  <option key={code} value={code}>{code} - {name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Receipt size={14} className="text-primary" /> Line Items</CardTitle>
            <Button size="sm" variant="outline" onClick={addItem} className="text-xs">
              <Plus size={12} className="mr-1" /> Add Item
            </Button>
          </div>
          <CardDescription className="text-[11px]">
            {sellerState === buyerState ? (
              <Badge className="text-[9px] bg-blue-500/15 text-blue-400 border-blue-500/30">Intra-State (CGST + SGST)</Badge>
            ) : (
              <Badge className="text-[9px] bg-orange-500/15 text-orange-400 border-orange-500/30">Inter-State (IGST)</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  {i === 0 && <Label className="text-[10px] text-muted-foreground">Description</Label>}
                  <Input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Item name" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-[10px] text-muted-foreground">HSN Code</Label>}
                  <Input value={item.hsn} onChange={(e) => updateItem(i, "hsn", e.target.value)} placeholder="9983" />
                </div>
                <div className="col-span-1">
                  {i === 0 && <Label className="text-[10px] text-muted-foreground">Qty</Label>}
                  <Input type="number" value={item.qty} onChange={(e) => updateItem(i, "qty", parseInt(e.target.value) || 0)} min="1" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-[10px] text-muted-foreground">Rate (₹)</Label>}
                  <Input type="number" value={item.rate} onChange={(e) => updateItem(i, "rate", parseFloat(e.target.value) || 0)} min="0" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <Label className="text-[10px] text-muted-foreground">GST %</Label>}
                  <select value={item.gstPercent} onChange={(e) => updateItem(i, "gstPercent", parseInt(e.target.value))}
                    className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm">
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
                <div className="col-span-1 flex justify-center">
                  {items.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 w-9 p-0">
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
            <div>
              <Label className="text-[11px] text-muted-foreground">Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, etc." className="mt-1 w-72" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Subtotal</p>
              <p className="text-lg font-bold text-white flex items-center gap-1">
                <IndianRupee size={14} /> {subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleGenerate} disabled={loading} className="flex-1 h-11">
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <FileText size={16} className="mr-2" />}
          Generate Invoice
        </Button>
      </div>

      {generatedInvoice && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-emerald-400 flex items-center gap-2">
                  <FileText size={16} /> {generatedInvoice.invoiceNumber}
                </CardTitle>
                <Button size="sm" onClick={() => generatePDF(generatedInvoice)}
                  className="bg-emerald-600 hover:bg-emerald-700">
                  <Download size={14} className="mr-2" /> Download PDF
                </Button>
              </div>
              <CardDescription className="text-[11px]">
                {generatedInvoice.invoiceDate} | Due: {generatedInvoice.dueDate} | {generatedInvoice.isSameState ? "CGST + SGST" : "IGST"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] text-muted-foreground border-b border-white/10">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Item</th>
                      <th className="pb-2">HSN</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Rate</th>
                      <th className="pb-2 text-right">Taxable</th>
                      {generatedInvoice.isSameState ? (
                        <><th className="pb-2 text-right">CGST</th><th className="pb-2 text-right">SGST</th></>
                      ) : (
                        <th className="pb-2 text-right">IGST</th>
                      )}
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedInvoice.items.map((item, i) => (
                      <tr key={i} className="border-b border-white/5 text-[12px]">
                        <td className="py-2">{i + 1}</td>
                        <td>{item.description}</td>
                        <td className="text-muted-foreground">{item.hsn}</td>
                        <td className="text-right">{item.qty}</td>
                        <td className="text-right">₹{item.rate.toFixed(2)}</td>
                        <td className="text-right">₹{item.taxableAmount.toFixed(2)}</td>
                        {generatedInvoice.isSameState ? (
                          <><td className="text-right">₹{item.cgst.toFixed(2)}</td><td className="text-right">₹{item.sgst.toFixed(2)}</td></>
                        ) : (
                          <td className="text-right">₹{item.igst.toFixed(2)}</td>
                        )}
                        <td className="text-right font-semibold">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-end">
                <p className="text-[11px] text-muted-foreground italic max-w-sm">{generatedInvoice.amountInWords}</p>
                <div className="text-right space-y-1">
                  <p className="text-xs text-muted-foreground">Subtotal: ₹{generatedInvoice.subtotal.toFixed(2)}</p>
                  {generatedInvoice.isSameState ? (
                    <>
                      <p className="text-xs text-muted-foreground">CGST: ₹{generatedInvoice.cgst.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">SGST: ₹{generatedInvoice.sgst.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">IGST: ₹{generatedInvoice.igst.toFixed(2)}</p>
                  )}
                  <p className="text-lg font-bold text-emerald-400">₹{generatedInvoice.grandTotal.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
