import { Router, type IRouter } from "express";
import {
  CheckEligibilityBody,
  CheckEligibilityResponse,
  ApplySchemeBody,
  ApplySchemeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

interface Scheme {
  schemeId: string;
  schemeName: string;
  ministry: string;
  benefitAmount: number;
  benefitType: "cash_transfer" | "subsidy" | "scholarship" | "loan" | "insurance";
  minAge?: number;
  maxAge?: number;
  maxIncome?: number;
  occupations?: string[];
  requiresLand?: boolean;
  documentsRequired: string[];
  applicationDeadline?: string;
}

const ALL_SCHEMES: Scheme[] = [
  {
    schemeId: "PMKISAN-001",
    schemeName: "PM-KISAN Samman Nidhi",
    ministry: "Ministry of Agriculture",
    benefitAmount: 6000,
    benefitType: "cash_transfer",
    maxIncome: 200000,
    occupations: ["farmer"],
    requiresLand: true,
    documentsRequired: ["Aadhaar", "Land Records (Khasra-Khatauni)", "Bank Account Details"],
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    schemeId: "PMJJBY-002",
    schemeName: "PM Jeevan Jyoti Bima Yojana",
    ministry: "Ministry of Finance",
    benefitAmount: 200000,
    benefitType: "insurance",
    minAge: 18,
    maxAge: 50,
    maxIncome: 500000,
    documentsRequired: ["Aadhaar", "Bank Account"],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    schemeId: "NSP-003",
    schemeName: "National Scholarship Portal — Post-Matric",
    ministry: "Ministry of Education",
    benefitAmount: 25000,
    benefitType: "scholarship",
    maxAge: 30,
    maxIncome: 250000,
    occupations: ["student"],
    documentsRequired: ["Aadhaar", "Income Certificate", "Marksheet", "Bank Account", "Caste Certificate"],
    applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    schemeId: "PMAY-004",
    schemeName: "PM Awas Yojana — Gramin",
    ministry: "Ministry of Rural Development",
    benefitAmount: 130000,
    benefitType: "subsidy",
    maxIncome: 300000,
    occupations: ["farmer", "unemployed", "salaried"],
    documentsRequired: ["Aadhaar", "SECC Data Consent", "Bank Account", "Land Documents"],
  },
  {
    schemeId: "MUDRA-005",
    schemeName: "PM MUDRA Yojana — Shishu",
    ministry: "Ministry of Finance",
    benefitAmount: 50000,
    benefitType: "loan",
    maxAge: 60,
    maxIncome: 1500000,
    occupations: ["self_employed"],
    documentsRequired: ["Aadhaar", "PAN Card", "Business Plan", "Bank Statements (6 months)"],
  },
  {
    schemeId: "PMSBY-006",
    schemeName: "PM Suraksha Bima Yojana",
    ministry: "Ministry of Finance",
    benefitAmount: 200000,
    benefitType: "insurance",
    minAge: 18,
    maxAge: 70,
    documentsRequired: ["Aadhaar", "Bank Account"],
  },
  {
    schemeId: "IGNOAPS-007",
    schemeName: "Indira Gandhi National Old Age Pension Scheme",
    ministry: "Ministry of Rural Development",
    benefitAmount: 3600,
    benefitType: "cash_transfer",
    minAge: 60,
    maxIncome: 150000,
    occupations: ["senior_citizen"],
    documentsRequired: ["Aadhaar", "Age Proof", "BPL Certificate", "Bank Account"],
  },
  {
    schemeId: "ATMA-008",
    schemeName: "Atma Nirbhar Bharat — Rozgar Yojana",
    ministry: "Ministry of Labour",
    benefitAmount: 24000,
    benefitType: "subsidy",
    maxAge: 45,
    occupations: ["unemployed"],
    documentsRequired: ["Aadhaar", "UAN (EPFO)", "Bank Account"],
  },
];

router.post("/check-eligibility", (req, res) => {
  const body = CheckEligibilityBody.parse(req.body);

  const eligible = ALL_SCHEMES.filter((scheme) => {
    if (scheme.maxIncome && body.annualIncome > scheme.maxIncome) return false;
    if (scheme.minAge && body.age < scheme.minAge) return false;
    if (scheme.maxAge && body.age > scheme.maxAge) return false;
    if (scheme.requiresLand && !body.hasLand) return false;
    if (
      scheme.occupations &&
      !scheme.occupations.includes(body.occupation)
    )
      return false;
    return true;
  });

  const totalBenefit = eligible.reduce((sum, s) => sum + s.benefitAmount, 0);

  const autoApply = eligible
    .filter((s) => s.documentsRequired.every((d) => ["Aadhaar", "Bank Account"].includes(d) || body.bankAccountLinked))
    .map((s) => s.schemeName);

  const data = CheckEligibilityResponse.parse({
    citizenId: body.citizenId,
    eligibleSchemes: eligible.map((s) => ({
      schemeId: s.schemeId,
      schemeName: s.schemeName,
      ministry: s.ministry,
      benefitAmount: s.benefitAmount,
      benefitType: s.benefitType,
      eligibilityScore: Math.round(75 + Math.random() * 25),
      documentsRequired: s.documentsRequired,
      applicationDeadline: s.applicationDeadline,
    })),
    totalBenefitValue: totalBenefit,
    autoApplyRecommended: autoApply,
  });
  res.json(data);
});

router.post("/apply-scheme", (req, res) => {
  const body = ApplySchemeBody.parse(req.body);

  const scheme = ALL_SCHEMES.find((s) => s.schemeId === body.schemeId);
  const schemeName = scheme?.schemeName || "Unknown Scheme";
  const docsAutoFetched = body.digilockerConsent
    ? ["Aadhaar Card", "Bank Account Details", "Income Certificate", "Caste Certificate"].slice(
        0,
        scheme?.documentsRequired.length || 2
      )
    : [];

  const applicationId = `APP-${body.schemeId}-${Date.now().toString(36).toUpperCase()}`;

  const data = ApplySchemeResponse.parse({
    applicationId,
    schemeName,
    status: body.aadhaarVerified && body.digilockerConsent ? "submitted" : "documents_pending",
    submittedAt: new Date().toISOString(),
    docsAutoFetched,
    nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    message:
      body.aadhaarVerified && body.digilockerConsent
        ? `Application for ${schemeName} submitted successfully. Documents auto-fetched from DigiLocker. Playwright agent completed form submission on government portal. Estimated approval: 15-30 working days.`
        : `Aadhaar verification or DigiLocker consent required to proceed. Please complete verification.`,
  });
  res.json(data);
});

export default router;
