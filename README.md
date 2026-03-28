<div align="center">

# 🇮🇳 Bharat-Automator OS

### **The Unified Agentic Mesh for India**

*AI-powered command center that orchestrates sector-specific agents across India Stack — automating government services, financial compliance, healthcare access & agricultural intelligence for 1.4 billion citizens.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

<p>
  <img src="https://img.shields.io/badge/India_Stack-Aadhaar_|_UPI_|_DigiLocker_|_ABDM-FF9933?style=flat-square" alt="India Stack" />
  <img src="https://img.shields.io/badge/AI-GPT_|_LangGraph_|_CrewAI-8B5CF6?style=flat-square" alt="AI Stack" />
  <img src="https://img.shields.io/badge/Status-Active_Development-00C853?style=flat-square" alt="Status" />
</p>

</div>

---

## 🧠 What is Bharat-Automator OS?

**Bharat-Automator OS** is not just another dashboard — it's an **Agentic Mesh** where specialized AI agents collaborate to solve real-world problems for Indian citizens and businesses.

Think of it as a **digital nervous system** that connects:

- 🏛️ **Government portals** (MyScheme, NSP, GST Portal, Income Tax)
- 🏥 **Healthcare systems** (ABDM/ABHA, 108 Ambulance Network)
- 🌾 **Agricultural intelligence** (ISRO satellite data, Agmarknet, e-NAM)
- 💰 **Financial services** (UPI, Razorpay, GST filing, ITR automation)
- 🌐 **Language translation** (Bhashini — 22 Indian languages)

All through a single, beautiful command center.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🤖 AI Assistant
Conversational AI powered by GPT for answering citizen queries about digital services, schemes, and compliance.

### 🔄 Task Automator
Multi-agent execution dashboard with real-time logs from Delegator, Scraper, Analyzer & Generator agents.

### 📊 Data Science Lab
Interactive analytics and visualization dashboard for processing and understanding data patterns.

</td>
<td width="50%">

### 💰 Profit Engine
Revenue optimization with smart insights and automation for freelancers and businesses.

### 💳 Payment Processing
Razorpay-powered payments with UPI, cards, net banking & wallets — fully RBI compliant with 3-layer security.

### 🏗️ Architecture Visualizer
Interactive mesh graph (React Flow) and Mermaid.js diagrams showing the full system architecture.

</td>
</tr>
</table>

---

## 🏛️ Sector Agents

| Agent | Domain | Capabilities |
|-------|--------|-------------|
| 🌾 **KrishiBot** | Agriculture | Yield prediction (IoT + ISRO), market intelligence (Agmarknet), trade execution (e-NAM/ONDC) |
| 💼 **TaxBot Prime** | Finance & IT | GST/Income Tax filing, freelance bidding (Contra, Truelancer, Upwork), financial compliance |
| 🏥 **ArogyaBot** | Healthcare | ABDM/ABHA integration, patient history, emergency ambulance dispatch (108 Network) |
| 🏛️ **SarkarBot** | Governance | Scheme eligibility checks (MyScheme/NSP), automated applications via DigiLocker |

---

## 🇮🇳 India Stack Integration

```
┌─────────────────────────────────────────────────────────┐
│                   INDIA STACK LAYER                      │
├──────────────┬──────────────┬──────────────┬────────────┤
│   🆔 Aadhaar  │   💸 UPI     │  📄 DigiLocker│ 🌐 Bhashini│
│   e-KYC Auth │   Payments   │  Document    │ Translation│
│   OTP Verify │   Real-time  │  Vault       │ 22 Languages│
└──────────────┴──────────────┴──────────────┴────────────┘
```

- **Aadhaar API** — OTP-based e-KYC verification via UIDAI
- **UPI Gateway** — Real-time payment settlement with intent generation
- **DigiLocker** — Fetch verified credentials (Marksheets, PAN, Land Records)
- **Bhashini** — AI-powered translation across 22 Indian languages
- **ABDM (ABHA)** — Health ID and records management

---

## 🛡️ Security

| Layer | Protection |
|-------|-----------|
| 🔐 **Secret Management** | API keys stored in encrypted environment secrets — never in code or git |
| ⏱️ **Timing-Safe Comparison** | `crypto.timingSafeEqual()` for payment signature verification — prevents timing attacks |
| 🧹 **Error Sanitization** | All error responses scrubbed of sensitive values — keys auto-redacted with regex patterns |
| 🔒 **OIDC Auth** | OpenID Connect with PKCE for user authentication and session management |
| 📜 **DPDPA 2023** | Designed with India's Digital Personal Data Protection Act compliance in mind |

---

## 🏗️ Architecture

```
bharat-automator-os/
├── 📦 artifacts/                    # Deployable applications
│   ├── api-server/                  # Express 5 API server
│   │   └── src/routes/              # API routes (payments, agents, india-stack...)
│   ├── bharat-automator/            # React + Vite frontend
│   │   └── src/pages/               # Dashboard, AI Assistant, Payments...
│   └── mockup-sandbox/              # Component prototyping environment
├── 📚 lib/                          # Shared libraries
│   ├── api-spec/                    # OpenAPI 3.1 spec + Orval codegen
│   ├── api-client-react/            # Generated React Query hooks
│   ├── api-zod/                     # Generated Zod schemas
│   ├── db/                          # Drizzle ORM schema + migrations
│   └── integrations/                # OpenAI integration utilities
├── 🔧 scripts/                      # Utility & seed scripts
├── pnpm-workspace.yaml              # Monorepo configuration
└── tsconfig.base.json               # Shared TypeScript config
```

---

## 🚀 Tech Stack

<table>
<tr>
<td align="center" width="20%">

**Frontend**
<br/>
React 19<br/>
Vite 7<br/>
Tailwind CSS 4<br/>
Framer Motion<br/>
React Flow v12<br/>
Shadcn/UI

</td>
<td align="center" width="20%">

**Backend**
<br/>
Express 5<br/>
Node.js 24<br/>
Pino Logger<br/>
Zod Validation<br/>
esbuild

</td>
<td align="center" width="20%">

**Database**
<br/>
PostgreSQL<br/>
Drizzle ORM<br/>
Qdrant Vector DB

</td>
<td align="center" width="20%">

**AI / ML**
<br/>
OpenAI GPT<br/>
LangGraph<br/>
CrewAI Swarms<br/>
Bhashini NLP

</td>
<td align="center" width="20%">

**Payments**
<br/>
Razorpay<br/>
UPI Integration<br/>
HMAC-SHA256<br/>
RBI Compliant

</td>
</tr>
</table>

---

## 📡 API Endpoints

### Core
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/auth/user` | Get authenticated user |
| `GET` | `/api/orchestrator/status` | Orchestrator node status |
| `POST` | `/api/orchestrator/dispatch` | Dispatch agent task |

### India Stack
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/indiastack/auth-aadhaar` | Aadhaar e-KYC verification |
| `POST` | `/api/indiastack/upi-payment` | UPI payment intent |
| `GET` | `/api/indiastack/digilocker-docs` | Fetch DigiLocker documents |

### Sector Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/agriculture/predict-yield` | Crop yield prediction |
| `POST` | `/api/agriculture/execute-trade` | Market trade execution |
| `POST` | `/api/finance/file-gst` | Automated GST filing |
| `POST` | `/api/finance/file-income-tax` | ITR filing automation |
| `POST` | `/api/healthcare/book-emergency` | Emergency ambulance dispatch |
| `POST` | `/api/governance/apply-scheme` | Government scheme application |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment signature (timing-safe) |
| `GET` | `/api/payments/config` | Get public key config |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 24+
- **pnpm** 10+
- **PostgreSQL** database

### Installation

```bash
# Clone the repository
git clone https://github.com/dwivedidayashankar31-art/bharat-automator-os.git
cd bharat-automator-os

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, DATABASE_URL

# Push database schema
pnpm --filter @workspace/db run push

# Generate API client
pnpm --filter @workspace/api-spec run codegen

# Start development servers
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/bharat-automator run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `RAZORPAY_KEY_ID` | Razorpay public key | ✅ |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key (never expose!) | ✅ |
| `PORT` | API server port | ✅ |

---

## 🗺️ Roadmap

- [x] 🧠 Central Orchestrator with LangGraph
- [x] 🤖 4 Sector Agents (Agriculture, Finance, Healthcare, Governance)
- [x] 🇮🇳 India Stack Integration (Aadhaar, UPI, DigiLocker, Bhashini)
- [x] 💳 Razorpay Payment Processing with 3-layer security
- [x] 🎨 AI Assistant with streaming chat
- [x] 📊 Data Science & Analytics Dashboard
- [ ] 🏪 Agent Marketplace
- [ ] 📱 Mobile App (React Native / Expo)
- [ ] 🔗 WhatsApp Business API Integration
- [ ] 🗳️ Voter ID & Election Services Agent
- [ ] 🚄 IRCTC Railway Booking Agent

---

## 🤝 Contributing

Contributions are welcome! Whether it's a bug fix, new agent, or documentation improvement:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-agent`)
3. Commit your changes (`git commit -m 'Add AmazingAgent for XYZ sector'`)
4. Push to the branch (`git push origin feature/amazing-agent`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for India 🇮🇳**

*Empowering 1.4 billion citizens through AI-driven automation*

<br/>

<img src="https://img.shields.io/badge/Made_in-Bharat-FF9933?style=for-the-badge&labelColor=138808" alt="Made in Bharat" />

</div>
