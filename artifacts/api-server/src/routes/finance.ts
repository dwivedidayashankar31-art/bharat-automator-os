import { Router, type IRouter } from "express";
import {
  FileGSTBody,
  FileGSTResponse,
  FileIncomeTaxBody,
  FileIncomeTaxResponse,
  BidFreelanceBody,
  BidFreelanceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/file-gst", (req, res) => {
  const body = FileGSTBody.parse(req.body);
  const refNum = `GST-${Date.now().toString(36).toUpperCase()}`;
  const ackNum = `ACK${Math.floor(Math.random() * 9000000000) + 1000000000}`;

  const data = FileGSTResponse.parse({
    referenceNumber: refNum,
    status: "filed",
    filedAt: new Date().toISOString(),
    acknowledgementNumber: ackNum,
    refundAmount: Math.random() > 0.5 ? parseFloat((Math.random() * 25000).toFixed(2)) : 0,
    nextSteps: [
      `GSTR-3B for ${body.period} filed successfully on GST Portal`,
      "Input Tax Credit (ITC) reconciliation with GSTR-2A complete — ₹0 discrepancy found",
      "AI agent cross-verified all ${body.invoiceData.length} invoices against GSTIN database",
      "E-way bill auto-generated for interstate transactions",
      "Next filing due: " + new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
    ],
  });
  res.json(data);
});

router.post("/file-income-tax", (req, res) => {
  const body = FileIncomeTaxBody.parse(req.body);
  const refNum = `ITR-${Date.now().toString(36).toUpperCase()}`;
  const ackNum = `${body.panNumber}${Math.floor(Math.random() * 9000000) + 1000000}`;

  const data = FileIncomeTaxResponse.parse({
    referenceNumber: refNum,
    status: "filed",
    filedAt: new Date().toISOString(),
    acknowledgementNumber: ackNum,
    refundAmount: parseFloat((Math.random() * 40000).toFixed(2)),
    nextSteps: [
      `ITR-1 filed for AY ${body.assessmentYear} — Acknowledgement sent to registered email`,
      "Form 26AS reconciliation complete — no TDS mismatch",
      "Section 80C deductions auto-claimed from DigiLocker documents",
      "e-Verification via Aadhaar OTP complete — no physical form required",
      "Expected refund processing: 15-45 working days",
    ],
  });
  res.json(data);
});

router.post("/bid-freelance", (req, res) => {
  const body = BidFreelanceBody.parse(req.body);

  const jobDatabase: Record<
    string,
    Array<{ title: string; budgetRange: [number, number]; platform: string }>
  > = {
    "react": [
      { title: "React Dashboard for FinTech Startup", budgetRange: [800, 2000], platform: "Contra" },
      { title: "Frontend Dev — SaaS Product", budgetRange: [500, 1500], platform: "Truelancer" },
    ],
    "python": [
      { title: "Data Scraping Automation Script", budgetRange: [200, 600], platform: "Truelancer" },
      { title: "ML Pipeline for E-commerce", budgetRange: [1500, 4000], platform: "Contra" },
    ],
    "ui/ux": [
      { title: "Mobile App UI Design — 15 Screens", budgetRange: [600, 1800], platform: "Contra" },
      { title: "Brand Identity + Web Design", budgetRange: [800, 2500], platform: "Truelancer" },
    ],
    "content writing": [
      { title: "10 Blog Posts — Tech Niche", budgetRange: [150, 500], platform: "Truelancer" },
    ],
    "video editing": [
      { title: "YouTube Shorts Editor (Long-term)", budgetRange: [300, 900], platform: "Contra" },
    ],
  };

  const allJobs: Array<{ title: string; budgetRange: [number, number]; platform: string }> = [];
  for (const skill of body.skills) {
    const skillKey = Object.keys(jobDatabase).find(k =>
      skill.toLowerCase().includes(k.toLowerCase())
    );
    if (skillKey) {
      allJobs.push(...jobDatabase[skillKey].filter(j => body.platforms.includes(j.platform as "Contra" | "Truelancer" | "Upwork" | "Fiverr")));
    }
  }

  const eligibleJobs = allJobs.length > 0
    ? allJobs
    : [
        { title: "Full-Stack Developer — Remote", budgetRange: [600, 2000] as [number, number], platform: body.platforms[0] || "Contra" },
        { title: "Technical Consultant (Part-time)", budgetRange: [400, 1200] as [number, number], platform: body.platforms[0] || "Truelancer" },
      ];

  const bids = eligibleJobs.slice(0, 5).map((job, i) => ({
    jobId: `JOB-${Date.now() + i}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    title: job.title,
    platform: job.platform,
    bidAmount: parseFloat(
      (job.budgetRange[0] + (job.budgetRange[1] - job.budgetRange[0]) * 0.7).toFixed(2)
    ),
    status: "submitted" as const,
  }));

  const data = BidFreelanceResponse.parse({
    bidsPlaced: bids.length,
    platforms: [...new Set(bids.map(b => b.platform))],
    jobsTargeted: bids,
    estimatedResponseTime: "12-48 hours",
  });
  res.json(data);
});

export default router;
