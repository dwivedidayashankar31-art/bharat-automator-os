import { Router, type IRouter } from "express";

const router: IRouter = Router();

function randomBetween(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function generateLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]!);
  }
  return days;
}

router.get("/overview", (_req, res) => {
  const days = generateLast7Days();

  res.json({
    summary: {
      totalTransactions: randomBetween(850, 2400),
      revenue: randomBetween(125000, 890000),
      activeAgents: randomBetween(12, 28),
      tasksCompleted: randomBetween(3400, 8900),
      avgResponseTime: randomBetween(18, 65),
      uptime: (99 + Math.random() * 0.99).toFixed(2),
    },
    revenueChart: days.map((day) => ({
      date: day,
      revenue: randomBetween(15000, 120000),
      transactions: randomBetween(40, 350),
    })),
    agentActivity: [
      { name: "KrishiBot", tasks: randomBetween(200, 800), success: randomBetween(85, 99) },
      { name: "TaxBot", tasks: randomBetween(300, 1200), success: randomBetween(90, 99) },
      { name: "ArogyaBot", tasks: randomBetween(150, 600), success: randomBetween(88, 99) },
      { name: "SarkarBot", tasks: randomBetween(250, 900), success: randomBetween(82, 98) },
    ],
    sectorDistribution: [
      { sector: "Agriculture", value: randomBetween(15, 30) },
      { sector: "Finance", value: randomBetween(25, 40) },
      { sector: "Healthcare", value: randomBetween(10, 25) },
      { sector: "Governance", value: randomBetween(10, 20) },
      { sector: "Payments", value: randomBetween(5, 15) },
    ],
    hourlyTraffic: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, "0")}:00`,
      requests: randomBetween(i >= 9 && i <= 21 ? 100 : 10, i >= 9 && i <= 21 ? 500 : 80),
    })),
  });
});

export default router;
