import { Router, type IRouter } from "express";
import {
  AuthenticateAadhaarBody,
  AuthenticateAadhaarResponse,
  InitiateUpiPaymentBody,
  InitiateUpiPaymentResponse,
  FetchDigilockerDocsQueryParams,
  FetchDigilockerDocsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth-aadhaar", (req, res) => {
  const body = AuthenticateAadhaarBody.parse(req.body);

  const isValid = body.otp === "123456" || body.otp?.length === 6;

  const data = AuthenticateAadhaarResponse.parse({
    authenticated: isValid,
    citizenId: isValid ? `CIT-${body.aadhaarNumber.slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}` : undefined,
    tokenExpiry: isValid ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : undefined,
    permissionsGranted: isValid
      ? [
          "identity:read",
          "demographics:read",
          `purpose:${body.purpose}`,
          "digilocker:access",
          "e-sign:enabled",
        ]
      : [],
  });
  res.json(data);
});

router.post("/upi-payment", (req, res) => {
  const body = InitiateUpiPaymentBody.parse(req.body);

  const txnId = `BHARAT${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const utr = `UTR${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 10000)}`;

  const data = InitiateUpiPaymentResponse.parse({
    transactionId: txnId,
    status: "success",
    amount: body.amount,
    timestamp: new Date().toISOString(),
    utrNumber: utr,
  });
  res.json(data);
});

router.get("/digilocker-docs", (req, res) => {
  const { citizenId } = FetchDigilockerDocsQueryParams.parse(req.query);

  const data = FetchDigilockerDocsResponse.parse({
    citizenId,
    documents: [
      {
        docId: "DL-AADHAAR-001",
        docType: "Aadhaar Card",
        issuedBy: "Unique Identification Authority of India (UIDAI)",
        issueDate: "2015-03-14",
        verificationStatus: "verified",
      },
      {
        docId: "DL-PAN-002",
        docType: "PAN Card",
        issuedBy: "Income Tax Department",
        issueDate: "2012-08-22",
        verificationStatus: "verified",
      },
      {
        docId: "DL-DL-003",
        docType: "Driving License",
        issuedBy: "Transport Department, UP",
        issueDate: "2018-11-05",
        verificationStatus: "verified",
      },
      {
        docId: "DL-MARKSHEET-004",
        docType: "Class XII Marksheet",
        issuedBy: "CBSE Board",
        issueDate: "2010-06-15",
        verificationStatus: "verified",
      },
      {
        docId: "DL-INCOME-005",
        docType: "Income Certificate",
        issuedBy: "District Magistrate Office",
        issueDate: "2024-01-10",
        verificationStatus: "pending",
      },
      {
        docId: "DL-LAND-006",
        docType: "Land Records (RoR)",
        issuedBy: "Revenue Department, UP",
        issueDate: "2023-09-01",
        verificationStatus: "verified",
      },
    ],
  });
  res.json(data);
});

export default router;
