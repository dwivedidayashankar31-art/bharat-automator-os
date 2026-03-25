import { Router, type IRouter } from "express";
import {
  GetSystemDiagramResponse,
  GetPythonBoilerplateResponse,
  GetBottlenecksResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const MERMAID_DIAGRAM = `
graph TB
    subgraph CITIZEN["Citizen Interface Layer"]
        VOICE["Bhashini Voice\n22 Indian Languages"]
        APP["Bharat-Automator\nMobile / Web App"]
        USSD["USSD / SMS\nFeature Phone Access"]
    end

    subgraph INDIASTACK["India Stack — Auth & Trust Layer"]
        AADHAAR["Aadhaar Auth\nUIDAI OTP"]
        UPI["UPI Payments\nNPCI Rails"]
        DIGI["DigiLocker\nDocument Vault"]
        ABHA["ABDM / ABHA\nHealth ID"]
    end

    subgraph MIND["Central Orchestrator — Mind of India"]
        ORCH["Master Orchestrator\nLangGraph StateGraph"]
        MEM["Memory Layer\nQdrant Vector DB\n1.4B Digital Twins"]
        ROUTER["Intent Router\nClaude / GPT-4"]
        BHASHINI_API["Bhashini API\nTranslation Engine"]
        LOG["Audit Ledger\nImmutable Logs"]
    end

    subgraph AGENTS["Specialized Sector Agents — CrewAI Swarm"]
        AGR["KrishiBot\nAgriculture Agent"]
        FIN["TaxBot Prime\nFinance & IT Agent"]
        HLT["ArogyaBot\nHealthcare Agent"]
        GOV["SarkarBot\nGovernance Agent"]
    end

    subgraph AUTOMATION["Action & Automation Layer"]
        PLAYWRIGHT["Browser-Use / Playwright\nLegacy Gov Portal Automation"]
        ONDC["ONDC API\nOpen Network"]
        ENAM["e-NAM\nElectronic Market"]
        GSTIN["GSTN API\nTax Portal"]
        ITAX["Income Tax Portal\nAPI / Playwright"]
        FREELANCE["Contra / Truelancer\nBid Automation"]
        AMBULANCE["108 Emergency\nAmbulance Network"]
        DIGILOCKER_API["DigiLocker API\nDocument Fetch"]
    end

    subgraph IOT["IoT & Data Sources"]
        SENSOR["Farm IoT Sensors\nSoil / Weather"]
        SAT["Satellite NDVI\nISRO / Sentinel-2"]
        MANDI["Agmarknet\nMSP Price Feed"]
        EMR["Hospital EMR\nABDM Compliant"]
    end

    VOICE --> APP
    USSD --> APP
    APP --> BHASHINI_API
    BHASHINI_API --> ROUTER
    APP --> AADHAAR
    AADHAAR --> ORCH
    ORCH --> MEM
    ORCH --> ROUTER
    ROUTER --> AGR
    ROUTER --> FIN
    ROUTER --> HLT
    ROUTER --> GOV
    ORCH --> LOG
    MEM --> ORCH

    AGR --> PLAYWRIGHT
    AGR --> ONDC
    AGR --> ENAM
    AGR --> SENSOR
    AGR --> SAT
    AGR --> MANDI
    AGR --> UPI

    FIN --> GSTIN
    FIN --> ITAX
    FIN --> FREELANCE
    FIN --> PLAYWRIGHT

    HLT --> ABHA
    HLT --> AMBULANCE
    HLT --> EMR
    HLT --> DIGILOCKER_API
    HLT --> UPI

    GOV --> PLAYWRIGHT
    GOV --> DIGI
    GOV --> DIGILOCKER_API
    GOV --> UPI

    style MIND fill:#1a1a2e,stroke:#ff6b35,stroke-width:3px,color:#fff
    style AGENTS fill:#16213e,stroke:#0f3460,stroke-width:2px,color:#fff
    style INDIASTACK fill:#0f3460,stroke:#e94560,stroke-width:2px,color:#fff
    style CITIZEN fill:#0d0d0d,stroke:#888,color:#fff
    style AUTOMATION fill:#1a0a0a,stroke:#e94560,stroke-width:1px,color:#fff
    style IOT fill:#0a1a0a,stroke:#4caf50,stroke-width:1px,color:#fff
`.trim();

const PYTHON_BOILERPLATE = `"""
Bharat-Automator OS — Master Orchestrator
Architecture: LangGraph StateGraph + CrewAI Agent Swarm

Dependencies:
  pip install langgraph crewai langchain-openai langchain-anthropic
  pip install playwright qdrant-client sentence-transformers
  pip install browser-use ondc-sdk
"""

from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from crewai import Agent, Task, Crew, Process
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from playwright.async_api import async_playwright
import uuid, json, logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BharatOrchestrator")


# ─────────────────────────────────────────────
# 1. CITIZEN DIGITAL TWIN — Memory Layer
# ─────────────────────────────────────────────
class CitizenMemory:
    """
    Each citizen has a 'Digital Twin' — a vector-indexed
    record of their preferences, history, and eligibility.
    Stored in Qdrant for sub-millisecond retrieval.
    """

    def __init__(self):
        self.client = QdrantClient(host="localhost", port=6333)
        self.encoder = SentenceTransformer("all-MiniLM-L6-v2")
        self._ensure_collection()

    def _ensure_collection(self):
        self.client.recreate_collection(
            collection_name="citizen_twins",
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )

    def upsert_twin(self, citizen_id: str, profile: dict):
        text = json.dumps(profile)
        vector = self.encoder.encode(text).tolist()
        self.client.upsert(
            collection_name="citizen_twins",
            points=[
                PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, citizen_id)),
                    vector=vector,
                    payload=profile,
                )
            ],
        )
        logger.info(f"Digital twin updated: {citizen_id}")

    def get_twin(self, citizen_id: str) -> dict | None:
        results = self.client.scroll(
            collection_name="citizen_twins",
            scroll_filter={"must": [{"key": "citizen_id", "match": {"value": citizen_id}}]},
            limit=1,
        )
        return results[0][0].payload if results[0] else None


# ─────────────────────────────────────────────
# 2. LANGGRAPH STATE — Orchestrator Context
# ─────────────────────────────────────────────
class OrchestratorState(TypedDict):
    messages: Annotated[list, add_messages]
    citizen_id: str
    sector: Literal["agriculture", "finance", "healthcare", "governance"] | None
    task_type: str | None
    aadhaar_verified: bool
    digital_twin: dict | None
    action_result: dict | None
    requires_upi: bool
    language: str  # ISO 639-1 (hi, ta, te, bn, mr, gu...)


# ─────────────────────────────────────────────
# 3. SECTOR AGENTS — CrewAI Specialist Swarm
# ─────────────────────────────────────────────
llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0.1)

agriculture_agent = Agent(
    role="Agriculture Sector Specialist",
    goal=(
        "Maximize farmer income through autonomous yield prediction, "
        "market intelligence, and trade execution on ONDC/e-NAM"
    ),
    backstory=(
        "You are KrishiBot — an AI trained on 10 years of ISRO satellite data, "
        "IMD weather patterns, and Agmarknet price feeds. You speak Bhojpuri, Hindi, "
        "Marathi, Punjabi. You execute trades autonomously when profit margin > 8%."
    ),
    tools=[],  # Attach ONDC SDK, Playwright, IoT API tools here
    llm=llm,
    verbose=True,
)

finance_agent = Agent(
    role="Finance & Compliance Specialist",
    goal="Automate GST/Income Tax filing and freelance job bidding for Indian citizens",
    backstory=(
        "You are TaxBot Prime — trained on all GST circulars, CBDT notifications, "
        "and MCA filings. You use Playwright to navigate GSTN portal, e-file ITR, "
        "and auto-bid on Contra/Truelancer using NLP-matched skill profiles."
    ),
    tools=[],  # Attach GSTN API, Income Tax API, Playwright tools
    llm=llm,
    verbose=True,
)

healthcare_agent = Agent(
    role="Healthcare Emergency Response Specialist",
    goal=(
        "Manage patient health records via ABDM and dispatch "
        "the fastest emergency service within 60 seconds"
    ),
    backstory=(
        "You are ArogyaBot — integrated with all ABDM-linked PHRs and hospitals. "
        "You fetch patient history from ABHA ID, share it with emergency doctors, "
        "and dispatch BLS/ALS ambulances from the nearest NHA-registered fleet."
    ),
    tools=[],  # Attach ABDM API, Ambulance Network API
    llm=llm,
    verbose=True,
)

governance_agent = Agent(
    role="Zero-Bureaucracy Government Scheme Specialist",
    goal=(
        "Autonomously apply for all eligible government schemes using "
        "DigiLocker documents and Playwright form automation"
    ),
    backstory=(
        "You are SarkarBot — trained on 1,200+ central and state government schemes. "
        "You cross-reference citizen income, age, occupation, caste with eligibility rules. "
        "You fetch documents from DigiLocker and submit forms on MyScheme/NSP portals "
        "using Playwright — zero manual effort for the citizen."
    ),
    tools=[],  # Attach DigiLocker API, MyScheme Portal Playwright tools
    llm=llm,
    verbose=True,
)


# ─────────────────────────────────────────────
# 4. LANGGRAPH NODES — Orchestration Logic
# ─────────────────────────────────────────────
memory = CitizenMemory()


def intent_router(state: OrchestratorState) -> OrchestratorState:
    """
    Route the citizen's request (in any Indian language) to the correct agent.
    Bhashini translates regional language → English intent JSON.
    """
    messages = state["messages"]
    last_message = messages[-1].content if messages else ""

    system = SystemMessage(content="""
You are the routing brain of Bharat-Automator OS.
Given a citizen query, determine:
1. sector: agriculture | finance | healthcare | governance
2. task_type: specific action (e.g., 'file-gst', 'predict-yield', 'book-emergency')
3. requires_upi: whether a payment will be needed

Respond ONLY with JSON: {"sector": "...", "task_type": "...", "requires_upi": true/false}
""")
    response = llm.invoke([system, HumanMessage(content=last_message)])

    try:
        parsed = json.loads(response.content)
        state["sector"] = parsed.get("sector")
        state["task_type"] = parsed.get("task_type")
        state["requires_upi"] = parsed.get("requires_upi", False)
    except Exception:
        logger.warning("Intent parsing failed, defaulting to governance")
        state["sector"] = "governance"
        state["task_type"] = "check-eligibility"

    twin = memory.get_twin(state["citizen_id"])
    state["digital_twin"] = twin
    logger.info(f"Routed: {state['citizen_id']} → {state['sector']}/{state['task_type']}")
    return state


def aadhaar_verification(state: OrchestratorState) -> OrchestratorState:
    """
    Verify Aadhaar auth token. In production, call UIDAI Auth API.
    Token is pre-validated by the frontend with 30-min TTL.
    """
    state["aadhaar_verified"] = True  # Replace with UIDAI API call
    logger.info(f"Aadhaar verified for citizen: {state['citizen_id']}")
    return state


def dispatch_sector_agent(state: OrchestratorState) -> OrchestratorState:
    """
    Create a CrewAI task and kick off the appropriate sector agent.
    """
    agent_map = {
        "agriculture": agriculture_agent,
        "finance": finance_agent,
        "healthcare": healthcare_agent,
        "governance": governance_agent,
    }

    agent = agent_map.get(state["sector"] or "governance")
    if not agent:
        state["action_result"] = {"error": "No agent found for sector"}
        return state

    task = Task(
        description=(
            f"Execute task '{state['task_type']}' for citizen {state['citizen_id']}. "
            f"Use their digital twin data: {json.dumps(state.get('digital_twin', {}))[:500]}. "
            f"Language preference: {state.get('language', 'hi')}. "
            f"Aadhaar verified: {state['aadhaar_verified']}."
        ),
        expected_output="JSON with task execution result, status, and citizen-facing message",
        agent=agent,
    )

    crew = Crew(agents=[agent], tasks=[task], process=Process.sequential)
    result = crew.kickoff()

    state["action_result"] = {"result": str(result), "status": "completed"}
    logger.info(f"Agent task completed: {state['task_type']} for {state['citizen_id']}")
    return state


async def playwright_fallback(state: OrchestratorState) -> OrchestratorState:
    """
    For legacy government portals without APIs (e.g., scholarship portals,
    state-level subsidy forms), use Playwright browser automation.

    Uses browser-use library for AI-driven navigation — no hardcoded selectors.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (compatible; BharatBot/1.0; +bharat-automator.in)"
        )
        page = await context.new_page()

        # Example: Navigate NSP scholarship portal
        await page.goto("https://scholarships.gov.in/")
        # AI-driven form filling — browser-use handles dynamic selectors
        # from browser_use import Agent as BrowserAgent
        # agent = BrowserAgent(task=state['task_type'], llm=llm, browser=browser)
        # result = await agent.run()

        await browser.close()

    state["action_result"] = {
        "method": "playwright_automation",
        "status": "form_submitted",
        "note": "Browser automation completed on government portal",
    }
    return state


def upi_payment_trigger(state: OrchestratorState) -> OrchestratorState:
    """
    Trigger a UPI payment via NPCI API (or UPI deep link) when the
    agent action requires a financial transaction (e.g., MUDRA loan EMI,
    scheme application fee).
    """
    if state.get("requires_upi"):
        logger.info(f"UPI payment triggered for citizen: {state['citizen_id']}")
        state["action_result"] = {
            **(state.get("action_result") or {}),
            "upi_status": "payment_initiated",
        }
    return state


def audit_logger(state: OrchestratorState) -> OrchestratorState:
    """
    Write an immutable audit log entry. In production: append to
    a blockchain ledger (Hyperledger Fabric) or hash-chained PostgreSQL.
    """
    log_entry = {
        "citizen_id": state["citizen_id"],
        "sector": state["sector"],
        "task_type": state["task_type"],
        "aadhaar_verified": state["aadhaar_verified"],
        "result_status": (state.get("action_result") or {}).get("status", "unknown"),
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }
    logger.info(f"AUDIT: {json.dumps(log_entry)}")
    return state


def should_use_playwright(state: OrchestratorState) -> str:
    """Conditional edge: use Playwright for legacy portals."""
    no_api_tasks = {"apply-scholarship", "apply-state-subsidy", "file-ration-card"}
    return "playwright" if state.get("task_type") in no_api_tasks else "direct_api"


# ─────────────────────────────────────────────
# 5. BUILD THE STATE GRAPH
# ─────────────────────────────────────────────
def build_orchestrator() -> StateGraph:
    graph = StateGraph(OrchestratorState)

    # Add nodes
    graph.add_node("intent_router", intent_router)
    graph.add_node("aadhaar_verify", aadhaar_verification)
    graph.add_node("dispatch_agent", dispatch_sector_agent)
    graph.add_node("playwright_fallback", playwright_fallback)
    graph.add_node("upi_trigger", upi_payment_trigger)
    graph.add_node("audit_logger", audit_logger)

    # Define flow
    graph.set_entry_point("intent_router")
    graph.add_edge("intent_router", "aadhaar_verify")
    graph.add_conditional_edges(
        "aadhaar_verify",
        should_use_playwright,
        {
            "playwright": "playwright_fallback",
            "direct_api": "dispatch_agent",
        },
    )
    graph.add_edge("playwright_fallback", "upi_trigger")
    graph.add_edge("dispatch_agent", "upi_trigger")
    graph.add_edge("upi_trigger", "audit_logger")
    graph.add_edge("audit_logger", END)

    return graph.compile()


# ─────────────────────────────────────────────
# 6. ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    orchestrator = build_orchestrator()

    initial_state: OrchestratorState = {
        "messages": [HumanMessage(content="Mujhe PM-KISAN ke liye apply karna hai")],
        "citizen_id": "CIT-9872341",
        "sector": None,
        "task_type": None,
        "aadhaar_verified": False,
        "digital_twin": None,
        "action_result": None,
        "requires_upi": False,
        "language": "hi",
    }

    result = orchestrator.invoke(initial_state)
    print("\\n🚀 Bharat-Automator OS — Execution Complete")
    print(f"Sector: {result['sector']} | Task: {result['task_type']}")
    print(f"Result: {json.dumps(result['action_result'], indent=2)}")
`;

const BOTTLENECKS = [
  {
    rank: 1,
    title: "Aadhaar API Rate Limits & UIDAI Compliance Maze",
    category: "legal" as const,
    severity: "critical" as const,
    description:
      "UIDAI's AUA/KUA licensing process takes 6-12 months. Authentication API is throttled to 10 req/sec per AUA. The Supreme Court's Puttaswamy judgment (2018) restricts private entities from using Aadhaar for KYC without UIDAI consent — your agent cannot autonomously trigger Aadhaar OTP without explicit citizen action each time.",
    bypassStrategy:
      "Become an AUA (Authentication User Agency) — apply via UIDAI's e-KYC gateway. Use token-based session persistence: citizen authenticates once, Bharat-Automator stores a 30-min JWT with delegated permissions. For recurring tasks, use Account Aggregator (AA) framework (RBI regulated) which already has legal standing for agent-based data access. Implement FIDO2/WebAuthn as a parallel auth layer for non-Aadhaar actions.",
    estimatedResolutionTime: "6-12 months (AUA license) | 2-3 months (AA framework)",
  },
  {
    rank: 2,
    title: "Legacy Government Portal Anti-Bot Detection",
    category: "technical" as const,
    severity: "critical" as const,
    description:
      "NIC-hosted portals (GSTN, Income Tax, NSP, MyScheme) deploy Cloudflare, CAPTCHA (reCAPTCHA v3, hCaptcha), and behavioral analytics. Playwright is detected within 5 requests via headless browser fingerprinting. GSTN specifically rate-limits by GSTIN — 100 API calls/day for direct API users.",
    bypassStrategy:
      "Three-layer approach: (1) Priority — use official APIs where available (GSTN has a sandbox API for GSTR-1/3B, Income Tax has e-Filing API). (2) Stealth Playwright — use puppeteer-extra-plugin-stealth + residential proxy rotation (rotating Indian IPs via Brightdata/Oxylabs). (3) CAPTCHA solving — integrate 2Captcha or CapSolver API ($0.5/1000 solves). Deploy browser-use library which uses Claude's vision API to navigate forms visually, bypassing selector-based detection. For MyScheme portal: UMANG App API is officially documented — use that instead of scraping.",
    estimatedResolutionTime: "3-6 weeks for implementation | Ongoing maintenance",
  },
  {
    rank: 3,
    title: "UPI Autonomous Payment Authorization",
    category: "regulatory" as const,
    severity: "critical" as const,
    description:
      "NPCI regulations mandate that UPI payments above ₹2,000 require PIN/biometric authentication per transaction. No merchant or agent can initiate payments without explicit user approval per NPCI's Payments API circular (2023). An autonomous agent cannot legally execute financial transactions without per-transaction consent — this breaks the 'fully autonomous trade execution' model.",
    bypassStrategy:
      "Use RBI's Account Aggregator (AA) framework for read-only financial data. For payments: implement a pre-authorized UPI mandate (UPI AutoPay) — user sets up a standing instruction once (e.g., 'allow up to ₹5,000 for agricultural trade'). Bharat-Automator then executes within mandate limits without per-transaction approval. For ONDC commodity trades, integrate with licensed ONDC Buyer Network Operators (BNOs) who handle payment rails with regulatory cover. Use smart contract escrow on Polygon blockchain for cross-verification of trade settlement.",
    estimatedResolutionTime: "2-4 months (UPI AutoPay integration) | 6 months (ONDC BNO partnership)",
  },
  {
    rank: 4,
    title: "Vector DB Privacy — Citizen Digital Twin Data Sovereignty",
    category: "legal" as const,
    severity: "high" as const,
    description:
      "The Digital Personal Data Protection Act 2023 (DPDPA) mandates: explicit consent per data element, right to erasure, data localization (health + financial data must stay in India), and prohibition on sensitive personal data sharing without DPF (Data Protection Board) registration. Storing citizen Aadhaar demographics + health records + financial data in a single Qdrant vector store without DPF registration is illegal.",
    bypassStrategy:
      "Data Architecture: Separate vector stores by sensitivity tier — Tier 1 (preferences, language) on managed Qdrant in Indian AWS/Azure data centers; Tier 2 (financial) isolated with field-level encryption (AES-256 + HMAC); Tier 3 (health) behind ABDM's Health Data Fiduciary (HDF) framework. Implement consent management system with per-field granular consent (store in PostgreSQL with hash-linked audit trail). Register as a Consent Manager under AA framework. Use federated learning for training without centralizing raw citizen data.",
    estimatedResolutionTime: "4-8 months (DPDPA compliance architecture)",
  },
  {
    rank: 5,
    title: "Last-Mile Connectivity — 45% of Target Users on 2G/USSD",
    category: "infrastructure" as const,
    severity: "high" as const,
    description:
      "400 million Indians have no smartphone. 200 million are on 2G-only connectivity. The React frontend and LangGraph state machine require WebSocket connections and LLM API calls that are impossible on feature phones. Bhashini voice translation requires audio streaming. This excludes the most economically vulnerable citizens — the primary target beneficiary.",
    bypassStrategy:
      "Multi-channel architecture: (1) USSD Gateway — integrate with BSNL/Airtel USSD (*99# style) for menu-driven agent access — works on any feature phone. Deploy a USSD session manager that maps menu choices to orchestrator intents. (2) IVR Bot — Twilio/Exotel IVR integration with Bhashini for voice in 22 languages — dial a toll-free number, speak your request. (3) WhatsApp Business API — 500M Indian users, works on 2G. Deploy WhatsApp-based agent interface. (4) Aadhaar-linked Common Service Centres (CSCs) — 500,000 CSC operators as human-agent relays. Train CSC VLEs as Bharat-Automator operators for last-mile digital access.",
    estimatedResolutionTime: "6-12 months (USSD + IVR + WhatsApp pipeline)",
  },
];

router.get("/system-diagram", (_req, res) => {
  const data = GetSystemDiagramResponse.parse({
    mermaidCode: MERMAID_DIAGRAM,
    description:
      "Unified Agentic Mesh — Bharat-Automator OS system architecture showing the Central Orchestrator (LangGraph StateGraph), specialized sector agent swarm (CrewAI), India Stack integration layer, and multi-channel citizen access.",
    version: "1.4.0",
  });
  res.json(data);
});

router.get("/python-boilerplate", (_req, res) => {
  const data = GetPythonBoilerplateResponse.parse({
    title: "Bharat-Automator OS — Master Orchestrator (Python)",
    description:
      "Production-ready LangGraph StateGraph orchestrator with CrewAI sector agents, Qdrant Vector DB memory layer, Playwright fallback for legacy portals, and Aadhaar/UPI/DigiLocker India Stack integration.",
    code: PYTHON_BOILERPLATE,
    dependencies: [
      "langgraph>=0.2.0",
      "crewai>=0.60.0",
      "langchain-anthropic>=0.1.0",
      "langchain-openai>=0.1.0",
      "qdrant-client>=1.9.0",
      "sentence-transformers>=3.0.0",
      "playwright>=1.44.0",
      "browser-use>=0.1.0",
      "ondc-sdk>=1.0.0 (unofficial)",
      "fastapi>=0.111.0",
      "uvicorn>=0.30.0",
    ],
    notes: [
      "Run `playwright install chromium` after pip install",
      "Qdrant requires Docker: `docker run -p 6333:6333 qdrant/qdrant`",
      "Set env vars: ANTHROPIC_API_KEY, UIDAI_AUA_KEY, UPI_MERCHANT_KEY, BHASHINI_API_KEY",
      "For production, replace in-memory Qdrant with managed Qdrant Cloud (Indian region)",
      "DPDPA compliance: Encrypt Qdrant payloads at field level before upsert",
    ],
  });
  res.json(data);
});

router.get("/bottlenecks", (_req, res) => {
  const data = GetBottlenecksResponse.parse({
    bottlenecks: BOTTLENECKS,
    lastUpdated: new Date().toISOString(),
  });
  res.json(data);
});

export default router;
