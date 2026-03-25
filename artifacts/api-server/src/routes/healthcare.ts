import { Router, type IRouter } from "express";
import {
  GetPatientHistoryQueryParams,
  GetPatientHistoryResponse,
  BookEmergencyServiceBody,
  BookEmergencyServiceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/patient-history", (req, res) => {
  const { abhaId } = GetPatientHistoryQueryParams.parse(req.query);

  const data = GetPatientHistoryResponse.parse({
    abhaId,
    name: "Ramesh Kumar Singh",
    bloodGroup: "B+",
    allergies: ["Penicillin", "Sulfonamides"],
    conditions: ["Type 2 Diabetes (diagnosed 2019)", "Hypertension Grade 1"],
    medications: [
      "Metformin 500mg (twice daily)",
      "Amlodipine 5mg (once daily)",
      "Aspirin 75mg (once daily)",
    ],
    recentVisits: [
      {
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        hospital: "AIIMS Delhi",
        doctor: "Dr. Priya Sharma (Endocrinologist)",
        diagnosis: "HbA1c: 7.2% — Diabetes under moderate control",
        prescription: "Metformin 500mg continued. Add Januvia 100mg if HbA1c >7.5 at next visit",
      },
      {
        date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        hospital: "Apollo Hospital Noida",
        doctor: "Dr. Rahul Mehta (Cardiologist)",
        diagnosis: "ECG normal. BP 138/88 — borderline. Continue medication.",
        prescription: "Amlodipine 5mg continued. Lifestyle modification advised.",
      },
    ],
    vaccinations: [
      "COVID-19 — Covishield (2 doses + booster)",
      "Hepatitis B (complete series)",
      "Influenza 2024",
      "Tetanus-Diphtheria booster 2022",
    ],
  });
  res.json(data);
});

router.post("/book-emergency", (req, res) => {
  const body = BookEmergencyServiceBody.parse(req.body);

  const ambulanceTypes: Record<string, string> = {
    cardiac: "Advanced Life Support (ALS) with Cardiac Monitor",
    accident: "Basic Life Support (BLS) with Trauma Kit",
    stroke: "Advanced Life Support (ALS) with Thrombolysis Kit",
    maternity: "Maternity Ambulance with Midwife",
    other: "Basic Life Support (BLS)",
  };

  const hospitals: Record<string, string[]> = {
    cardiac: ["AIIMS Emergency", "Fortis Cardiac ICU", "Max Super Speciality Hospital"],
    accident: ["Safdarjung Hospital Trauma Centre", "AIIMS Trauma Centre", "RML Hospital"],
    stroke: ["AIIMS Neurology Emergency", "BLK Super Speciality Hospital", "Artemis Hospital"],
    maternity: ["Lok Nayak Hospital Maternity Wing", "Safdarjung Hospital", "AIIMS Obstetrics"],
    other: ["Nearest Government Hospital", "District Hospital"],
  };

  const hospitalList = hospitals[body.emergencyType] || hospitals["other"];
  const hospital = hospitalList[0];
  const eta = body.severity === "critical" ? 5 + Math.floor(Math.random() * 5) : 8 + Math.floor(Math.random() * 10);
  const bookingId = `EMG-${Date.now().toString(36).toUpperCase()}`;

  const data = BookEmergencyServiceResponse.parse({
    bookingId,
    ambulanceId: `AMB-${Math.floor(Math.random() * 9000) + 1000}`,
    ambulanceType: ambulanceTypes[body.emergencyType] || "BLS Ambulance",
    eta,
    driverName: "Suresh Yadav",
    driverPhone: "+91-98110-" + Math.floor(Math.random() * 90000 + 10000),
    hospitalAssigned: hospital,
    hospitalPhone: "+91-11-" + Math.floor(Math.random() * 90000000 + 10000000),
    patientHistoryShared: true,
    trackingUrl: `https://bharat-health.in/track/${bookingId}`,
  });
  res.json(data);
});

export default router;
