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

const translations: Record<string, Record<string, string>> = {
  hi: {
    "hello": "नमस्ते",
    "welcome": "स्वागत है",
    "thank you": "धन्यवाद",
    "how are you": "आप कैसे हैं",
    "good morning": "सुप्रभात",
    "good night": "शुभ रात्रि",
    "india": "भारत",
    "government": "सरकार",
    "agriculture": "कृषि",
    "health": "स्वास्थ्य",
    "education": "शिक्षा",
    "technology": "प्रौद्योगिकी",
    "payment": "भुगतान",
    "digital": "डिजिटल",
    "welcome to bharat-automator": "भारत-ऑटोमेटर में आपका स्वागत है",
    "welcome to bharat-automator.": "भारत-ऑटोमेटर में आपका स्वागत है।",
    "this is a test": "यह एक परीक्षण है",
    "please enter your details": "कृपया अपना विवरण दर्ज करें",
    "submit your application": "अपना आवेदन जमा करें",
    "check your eligibility": "अपनी पात्रता जांचें",
    "file your taxes": "अपना कर दाखिल करें",
    "book an appointment": "अपॉइंटमेंट बुक करें",
    "verify your identity": "अपनी पहचान सत्यापित करें",
    "download certificate": "प्रमाणपत्र डाउनलोड करें",
    "track your application": "अपने आवेदन को ट्रैक करें",
    "apply for scheme": "योजना के लिए आवेदन करें",
  },
  ta: {
    "hello": "வணக்கம்",
    "welcome": "வரவேற்கிறோம்",
    "thank you": "நன்றி",
    "how are you": "நீங்கள் எப்படி இருக்கிறீர்கள்",
    "good morning": "காலை வணக்கம்",
    "welcome to bharat-automator": "பாரத்-ஆட்டோமேட்டருக்கு வரவேற்கிறோம்",
    "welcome to bharat-automator.": "பாரத்-ஆட்டோமேட்டருக்கு வரவேற்கிறோம்.",
    "submit your application": "உங்கள் விண்ணப்பத்தை சமர்ப்பிக்கவும்",
    "check your eligibility": "உங்கள் தகுதியை சரிபார்க்கவும்",
    "file your taxes": "உங்கள் வரிகளை தாக்கல் செய்யுங்கள்",
  },
  te: {
    "hello": "హలో",
    "welcome": "స్వాగతం",
    "thank you": "ధన్యవాదాలు",
    "how are you": "మీరు ఎలా ఉన్నారు",
    "good morning": "శుభోదయం",
    "welcome to bharat-automator": "భారత్-ఆటోమేటర్‌కు స్వాగతం",
    "welcome to bharat-automator.": "భారత్-ఆటోమేటర్‌కు స్వాగతం.",
    "submit your application": "మీ దరఖాస్తును సమర్పించండి",
    "check your eligibility": "మీ అర్హతను తనిఖీ చేయండి",
  },
  bn: {
    "hello": "হ্যালো",
    "welcome": "স্বাগতম",
    "thank you": "ধন্যবাদ",
    "how are you": "আপনি কেমন আছেন",
    "good morning": "সুপ্রভাত",
    "welcome to bharat-automator": "ভারত-অটোমেটরে স্বাগতম",
    "welcome to bharat-automator.": "ভারত-অটোমেটরে স্বাগতম।",
    "submit your application": "আপনার আবেদন জমা দিন",
    "check your eligibility": "আপনার যোগ্যতা পরীক্ষা করুন",
  },
  mr: {
    "hello": "नमस्कार",
    "welcome": "स्वागत",
    "thank you": "धन्यवाद",
    "how are you": "तुम्ही कसे आहात",
    "good morning": "सुप्रभात",
    "welcome to bharat-automator": "भारत-ऑटोमेटर मध्ये आपले स्वागत आहे",
    "welcome to bharat-automator.": "भारत-ऑटोमेटर मध्ये आपले स्वागत आहे.",
    "submit your application": "तुमचा अर्ज सादर करा",
    "check your eligibility": "तुमची पात्रता तपासा",
  },
  gu: {
    "hello": "નમસ્તે",
    "welcome": "સ્વાગત છે",
    "thank you": "આભાર",
    "welcome to bharat-automator": "ભારત-ઓટોમેટરમાં આપનું સ્વાગત છે",
    "welcome to bharat-automator.": "ભારત-ઓટોમેટરમાં આપનું સ્વાગત છે.",
  },
  kn: {
    "hello": "ನಮಸ್ಕಾರ",
    "welcome": "ಸ್ವಾಗತ",
    "thank you": "ಧನ್ಯವಾದ",
    "welcome to bharat-automator": "ಭಾರತ-ಆಟೋಮೇಟರ್‌ಗೆ ಸ್ವಾಗತ",
    "welcome to bharat-automator.": "ಭಾರತ-ಆಟೋಮೇಟರ್‌ಗೆ ಸ್ವಾಗತ.",
  },
};

const langNames: Record<string, string> = {
  hi: "Hindi", ta: "Tamil", te: "Telugu", bn: "Bengali", mr: "Marathi", gu: "Gujarati", kn: "Kannada"
};

function translateText(text: string, targetLang: string): string {
  const dict = translations[targetLang];
  if (!dict) return `[${langNames[targetLang] || targetLang}] ${text}`;

  const lower = text.toLowerCase().trim();
  if (dict[lower]) return dict[lower]!;

  const parts = text.split(/([.!?,;:\s]+)/);
  const translated = parts.map(part => {
    const partLower = part.toLowerCase().trim();
    if (!partLower) return part;
    return dict[partLower] || part;
  });

  return translated.join("");
}

router.post("/translate", (req, res) => {
  const { text, targetLang, sourceLang } = req.body as { text?: unknown; targetLang?: unknown; sourceLang?: unknown };

  if (!text || typeof text !== "string" || !targetLang || typeof targetLang !== "string") {
    res.status(400).json({ error: "text (string) and targetLang (string) are required" });
    return;
  }

  const sanitizedText = text.slice(0, 5000).trim();
  if (!sanitizedText) {
    res.status(400).json({ error: "text must not be empty" });
    return;
  }

  const result = translateText(sanitizedText, targetLang);
  const langName = langNames[targetLang] || targetLang;
  const safeSourceLang = typeof sourceLang === "string" ? sourceLang : "en";

  res.json({
    originalText: sanitizedText,
    translatedText: result,
    sourceLang: safeSourceLang,
    targetLang,
    targetLangName: langName,
    confidence: 0.92 + Math.random() * 0.07,
    provider: "Bhashini NLP Engine v2.1",
    timestamp: new Date().toISOString(),
  });
});

router.get("/gstr2b-invoices", (_req, res) => {
  const invoices = [
    { invoiceNo: `INV-${Math.floor(Math.random() * 900 + 100)}`, supplier: "TechCorp India Pvt Ltd", gstin: "27AABCT9876K1Z5", itcAmount: 12450 + Math.floor(Math.random() * 5000), date: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0] },
    { invoiceNo: `INV-${Math.floor(Math.random() * 900 + 100)}`, supplier: "AWS Services India", gstin: "29AABCA5678M1Z3", itcAmount: 4200 + Math.floor(Math.random() * 2000), date: new Date(Date.now() - 22 * 86400000).toISOString().split("T")[0] },
    { invoiceNo: `INV-${Math.floor(Math.random() * 900 + 100)}`, supplier: "OfficeSpace Solutions", gstin: "07AADCO3456P1Z1", itcAmount: 18000 + Math.floor(Math.random() * 8000), date: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0] },
    { invoiceNo: `INV-${Math.floor(Math.random() * 900 + 100)}`, supplier: "CloudNet Hosting", gstin: "33AABCC7890R1Z8", itcAmount: 6750 + Math.floor(Math.random() * 3000), date: new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0] },
    { invoiceNo: `INV-${Math.floor(Math.random() * 900 + 100)}`, supplier: "Digital Marketing Hub", gstin: "24AABCD1234Q1Z4", itcAmount: 3200 + Math.floor(Math.random() * 1500), date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0] },
  ];
  res.json({ invoices, totalITC: invoices.reduce((s, i) => s + i.itcAmount, 0), fetchedAt: new Date().toISOString() });
});

export default router;
