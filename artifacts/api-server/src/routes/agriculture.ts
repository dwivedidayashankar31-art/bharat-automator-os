import { Router, type IRouter } from "express";
import {
  PredictYieldBody,
  PredictYieldResponse,
  ExecuteTradeBody,
  ExecuteTradeResponse,
  GetMarketIntelligenceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/predict-yield", (req, res) => {
  const body = PredictYieldBody.parse(req.body);

  const baseYield: Record<string, number> = {
    wheat: 3.8,
    rice: 4.5,
    sugarcane: 65,
    cotton: 1.8,
    maize: 5.2,
    soybean: 2.1,
    groundnut: 2.4,
  };

  const cropKey = body.cropType.toLowerCase();
  const base = baseYield[cropKey] || 3.0;

  const moistureFactor = Math.min(1.2, Math.max(0.7, body.soilMoisture / 60));
  const tempFactor = body.temperature >= 20 && body.temperature <= 35 ? 1.1 : 0.85;
  const rainfallFactor = body.rainfall > 50 ? 1.15 : body.rainfall > 20 ? 1.05 : 0.9;
  const ndviFactor = body.ndviIndex ? Math.min(1.25, 0.5 + body.ndviIndex) : 1.0;

  const predicted = parseFloat(
    (base * body.fieldArea * moistureFactor * tempFactor * rainfallFactor * ndviFactor).toFixed(2)
  );
  const confidence = Math.round(82 + Math.random() * 12);

  const actions: string[] = [];
  if (body.soilMoisture < 40) actions.push("Activate drip irrigation — soil moisture critically low");
  if (body.temperature > 38) actions.push("Deploy shade nets — heat stress risk detected");
  if (body.rainfall < 20) actions.push("Schedule supplementary irrigation within 48 hours");
  if (actions.length === 0) actions.push("Conditions optimal — maintain current practices");
  actions.push("Apply micro-nutrient spray — NPK deficiency pattern detected via satellite");
  actions.push("Scout for fall armyworm — regional IoT sensors indicate infestation risk");

  const prices: Record<string, number> = {
    wheat: 2150,
    rice: 2183,
    sugarcane: 315,
    cotton: 6620,
    maize: 1962,
    soybean: 4892,
    groundnut: 5850,
  };
  const currentPrice = prices[cropKey] || 2000;
  const optimalDate = new Date(Date.now() + (7 + Math.floor(Math.random() * 14)) * 24 * 60 * 60 * 1000);

  const data = PredictYieldResponse.parse({
    farmerId: body.farmerId,
    cropType: body.cropType,
    predictedYield: predicted,
    unit: "tonnes",
    confidence,
    recommendedActions: actions,
    tradeRecommendation: `Execute on e-NAM at ₹${currentPrice}/quintal — 12% above Agmarknet MSP. Projected revenue: ₹${Math.round(predicted * 10 * currentPrice).toLocaleString("en-IN")}`,
    optimalSellDate: optimalDate.toISOString().split("T")[0],
  });
  res.json(data);
});

router.post("/execute-trade", (req, res) => {
  const body = ExecuteTradeBody.parse(req.body);

  const marketPrices: Record<string, number> = {
    wheat: 2150,
    rice: 2183,
    cotton: 6620,
    maize: 1962,
    soybean: 4892,
  };
  const basePrice = marketPrices[body.cropType.toLowerCase()] || 2000;
  const finalPrice = Math.max(body.minimumPrice, basePrice + Math.floor(Math.random() * 100));
  const totalAmount = parseFloat((body.quantity * finalPrice / 100).toFixed(2));

  const buyers = [
    "Reliance Retail Commodities",
    "ITC Agri Business Division",
    "NCDEX Empowered Buyer",
    "State Trading Corporation",
    "BigBasket Wholesale",
  ];
  const buyer = buyers[Math.floor(Math.random() * buyers.length)];
  const tradeId = `TRD-${Date.now().toString(36).toUpperCase()}-${body.platform === "ONDC" ? "ONDC" : "ENAM"}`;

  const data = ExecuteTradeResponse.parse({
    tradeId,
    status: "executed",
    platform: body.platform === "both" ? "ONDC+eNAM" : body.platform,
    buyer,
    finalPrice,
    totalAmount,
    paymentStatus: "UPI transfer initiated",
    estimatedTransfer: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  res.json(data);
});

router.get("/market-intelligence", (_req, res) => {
  const data = GetMarketIntelligenceResponse.parse({
    timestamp: new Date().toISOString(),
    crops: [
      {
        crop: "Wheat",
        currentPrice: 2150,
        predictedPriceNext7Days: 2210,
        trend: "rising",
        mandis: ["Azadpur (Delhi)", "Khanna (Punjab)", "Hapur (UP)"],
        recommendation: "Hold for 5-7 days. International wheat futures up 3.2%. Export demand from Bangladesh rising.",
      },
      {
        crop: "Rice (Basmati)",
        currentPrice: 5800,
        predictedPriceNext7Days: 5650,
        trend: "falling",
        mandis: ["Karnal", "Amritsar", "Patna"],
        recommendation: "Sell within 48 hours. New harvest from Myanmar suppressing export prices.",
      },
      {
        crop: "Cotton",
        currentPrice: 6620,
        predictedPriceNext7Days: 6750,
        trend: "rising",
        mandis: ["Rajkot", "Surendranagar", "Yavatmal"],
        recommendation: "Strong buy signal. Global cotton prices at 18-month high due to US drought.",
      },
      {
        crop: "Soybean",
        currentPrice: 4892,
        predictedPriceNext7Days: 4892,
        trend: "stable",
        mandis: ["Indore", "Ujjain", "Latur"],
        recommendation: "Stable outlook. Wait for MSP procurement window opening next week.",
      },
      {
        crop: "Maize",
        currentPrice: 1962,
        predictedPriceNext7Days: 2050,
        trend: "rising",
        mandis: ["Davangere", "Gulbarga", "Nizamabad"],
        recommendation: "Poultry feed demand surge. Execute ONDC trade in next 3 days for optimal returns.",
      },
    ],
  });
  res.json(data);
});

export default router;
