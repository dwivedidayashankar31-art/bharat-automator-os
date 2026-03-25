import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type NodeData = {
  label: string;
  sublabel?: string;
  icon?: string;
  color?: string;
  bg?: string;
  border?: string;
  badge?: string;
};

const AgentNode = ({ data, selected }: NodeProps<Node<NodeData>>) => (
  <div className={`relative px-4 py-3 rounded-2xl border-2 shadow-lg min-w-[140px] transition-all ${
    selected ? "scale-105 shadow-2xl" : ""
  } ${data.border || "border-primary/40"} ${data.bg || "bg-primary/10"} backdrop-blur-xl`}
    style={{ background: data.bg || "rgba(255,107,26,0.1)" }}>
    <Handle type="target" position={Position.Top} className="!bg-primary/60 !border-primary/40 !w-2 !h-2" />
    <Handle type="source" position={Position.Bottom} className="!bg-primary/60 !border-primary/40 !w-2 !h-2" />
    <Handle type="target" position={Position.Left} className="!bg-primary/60 !border-primary/40 !w-2 !h-2" />
    <Handle type="source" position={Position.Right} className="!bg-primary/60 !border-primary/40 !w-2 !h-2" />
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">{data.icon}</span>
      <span className="text-[12px] font-semibold text-white leading-tight">{data.label}</span>
    </div>
    {data.sublabel && <p className="text-[10px] text-white/50 leading-tight">{data.sublabel}</p>}
    {data.badge && (
      <div className="absolute -top-2 -right-2 bg-emerald-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full">
        {data.badge}
      </div>
    )}
  </div>
);

const HubNode = ({ data, selected }: NodeProps<Node<NodeData>>) => (
  <div className={`relative px-6 py-4 rounded-3xl border-2 shadow-2xl min-w-[180px] text-center transition-all ${
    selected ? "scale-105" : ""
  }`} style={{ borderColor: "rgba(255,107,26,0.6)", background: "rgba(255,107,26,0.15)", backdropFilter: "blur(20px)" }}>
    <Handle type="source" position={Position.Bottom} className="!bg-primary !border-primary/50 !w-3 !h-3" />
    <Handle type="source" position={Position.Right} className="!bg-primary !border-primary/50 !w-3 !h-3" />
    <Handle type="source" position={Position.Left} className="!bg-primary !border-primary/50 !w-3 !h-3" />
    <Handle type="target" position={Position.Top} className="!bg-primary !border-primary/50 !w-3 !h-3" />
    <div className="text-2xl mb-1.5">{data.icon}</div>
    <div className="text-[13px] font-bold text-white">{data.label}</div>
    {data.sublabel && <p className="text-[10px] text-primary/80 mt-0.5">{data.sublabel}</p>}
    <div className="absolute inset-0 rounded-3xl bg-primary/5 animate-pulse" style={{ animationDuration: "3s" }} />
  </div>
);

const StackNode = ({ data, selected }: NodeProps<Node<NodeData>>) => (
  <div className={`relative px-4 py-3 rounded-xl border shadow-lg min-w-[130px] transition-all ${selected ? "scale-105" : ""}`}
    style={{ borderColor: data.border || "rgba(255,255,255,0.2)", background: data.bg || "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
    <Handle type="target" position={Position.Top} className="!bg-white/40 !border-white/30 !w-2 !h-2" />
    <Handle type="source" position={Position.Bottom} className="!bg-white/40 !border-white/30 !w-2 !h-2" />
    <Handle type="target" position={Position.Left} className="!bg-white/40 !border-white/30 !w-2 !h-2" />
    <div className="flex items-center gap-2">
      <span className="text-base">{data.icon}</span>
      <div>
        <div className="text-[12px] font-semibold text-white">{data.label}</div>
        {data.sublabel && <div className="text-[9px] text-white/40">{data.sublabel}</div>}
      </div>
    </div>
  </div>
);

const nodeTypes = {
  agent: AgentNode,
  hub: HubNode,
  stack: StackNode,
};

const initialNodes: Node[] = [
  // Central Hub
  { id: "hub", type: "hub", position: { x: 400, y: 200 }, data: { label: "Master Orchestrator", sublabel: "LangGraph State Machine", icon: "🧠" } },

  // Sector Agents
  { id: "agr", type: "agent", position: { x: 80, y: 400 }, data: { label: "KrishiBot Alpha", sublabel: "AGR-001 · Agriculture", icon: "🌾", border: "rgba(16,185,129,0.5)", bg: "rgba(16,185,129,0.08)", badge: "LIVE" } },
  { id: "fin", type: "agent", position: { x: 280, y: 420 }, data: { label: "TaxBot Prime", sublabel: "FIN-001 · Finance", icon: "💼", border: "rgba(59,130,246,0.5)", bg: "rgba(59,130,246,0.08)", badge: "LIVE" } },
  { id: "hlt", type: "agent", position: { x: 480, y: 420 }, data: { label: "ArogyaBot", sublabel: "HLT-001 · Healthcare", icon: "❤️", border: "rgba(239,68,68,0.5)", bg: "rgba(239,68,68,0.08)" } },
  { id: "gov", type: "agent", position: { x: 680, y: 400 }, data: { label: "SarkarBot", sublabel: "GOV-001 · Governance", icon: "🏛️", border: "rgba(168,85,247,0.5)", bg: "rgba(168,85,247,0.08)" } },

  // Sub-Agents (Task Automator)
  { id: "scraper", type: "agent", position: { x: 80, y: 600 }, data: { label: "WebScraper", sublabel: "Data extraction", icon: "🌐", border: "rgba(59,130,246,0.4)", bg: "rgba(59,130,246,0.06)" } },
  { id: "analyzer", type: "agent", position: { x: 280, y: 600 }, data: { label: "DataAnalyzer", sublabel: "Statistical AI", icon: "📊", border: "rgba(16,185,129,0.4)", bg: "rgba(16,185,129,0.06)" } },
  { id: "generator", type: "agent", position: { x: 480, y: 600 }, data: { label: "ContentGen", sublabel: "Report synthesis", icon: "✍️", border: "rgba(168,85,247,0.4)", bg: "rgba(168,85,247,0.06)" } },

  // Memory Layer
  { id: "qdrant", type: "agent", position: { x: 680, y: 580 }, data: { label: "Qdrant VectorDB", sublabel: "1.4M citizen twins", icon: "🗄️", border: "rgba(245,158,11,0.4)", bg: "rgba(245,158,11,0.06)" } },

  // India Stack
  { id: "aadhaar", type: "stack", position: { x: 40, y: 100 }, data: { label: "Aadhaar e-KYC", sublabel: "Identity layer", icon: "🪪", border: "rgba(255,107,26,0.3)", bg: "rgba(255,107,26,0.06)" } },
  { id: "upi", type: "stack", position: { x: 230, y: 60 }, data: { label: "UPI / NACH", sublabel: "Payment rail", icon: "💳", border: "rgba(59,130,246,0.3)", bg: "rgba(59,130,246,0.06)" } },
  { id: "digilocker", type: "stack", position: { x: 580, y: 60 }, data: { label: "DigiLocker", sublabel: "Document vault", icon: "🔐", border: "rgba(168,85,247,0.3)", bg: "rgba(168,85,247,0.06)" } },
  { id: "bhashini", type: "stack", position: { x: 760, y: 100 }, data: { label: "Bhashini NLP", sublabel: "22 languages", icon: "🗣️", border: "rgba(16,185,129,0.3)", bg: "rgba(16,185,129,0.06)" } },
  { id: "ondc", type: "stack", position: { x: 380, y: 30 }, data: { label: "ONDC / e-NAM", sublabel: "Commerce network", icon: "🛒", border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.06)" } },
];

const edgeStyle = { stroke: "rgba(255,107,26,0.35)", strokeWidth: 1.5 };
const blueEdge = { stroke: "rgba(59,130,246,0.35)", strokeWidth: 1.5 };
const greenEdge = { stroke: "rgba(16,185,129,0.35)", strokeWidth: 1.5 };
const purpleEdge = { stroke: "rgba(168,85,247,0.35)", strokeWidth: 1.5 };
const dimEdge = { stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 };

const initialEdges: Edge[] = [
  { id: "hub-agr", source: "hub", target: "agr", animated: true, style: greenEdge, type: "smoothstep" },
  { id: "hub-fin", source: "hub", target: "fin", animated: true, style: blueEdge, type: "smoothstep" },
  { id: "hub-hlt", source: "hub", target: "hlt", animated: true, style: { stroke: "rgba(239,68,68,0.35)", strokeWidth: 1.5 }, type: "smoothstep" },
  { id: "hub-gov", source: "hub", target: "gov", animated: true, style: purpleEdge, type: "smoothstep" },

  { id: "agr-scraper", source: "agr", target: "scraper", style: dimEdge, type: "smoothstep" },
  { id: "fin-analyzer", source: "fin", target: "analyzer", style: dimEdge, type: "smoothstep" },
  { id: "hlt-generator", source: "hlt", target: "generator", style: dimEdge, type: "smoothstep" },
  { id: "gov-qdrant", source: "gov", target: "qdrant", style: dimEdge, type: "smoothstep" },
  { id: "hub-qdrant", source: "hub", target: "qdrant", style: { stroke: "rgba(245,158,11,0.3)", strokeWidth: 1.5 }, type: "smoothstep" },

  { id: "aadhaar-hub", source: "aadhaar", target: "hub", style: edgeStyle, type: "smoothstep" },
  { id: "upi-hub", source: "upi", target: "hub", style: edgeStyle, type: "smoothstep" },
  { id: "digilocker-hub", source: "digilocker", target: "hub", style: edgeStyle, type: "smoothstep" },
  { id: "bhashini-hub", source: "bhashini", target: "hub", style: edgeStyle, type: "smoothstep" },
  { id: "ondc-hub", source: "ondc", target: "hub", style: { stroke: "rgba(245,158,11,0.3)", strokeWidth: 1.5 }, type: "smoothstep" },
];

export function MeshFlowDiagram() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ height: 600, background: "#050810" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.04)" />
        <Controls className="!bg-black/60 !border-white/10 !rounded-xl" />
        <MiniMap
          className="!bg-black/60 !border-white/10 !rounded-xl"
          nodeColor={(node) => {
            if (node.type === "hub") return "rgba(255,107,26,0.8)";
            if (node.id === "agr") return "rgba(16,185,129,0.6)";
            if (node.id === "fin") return "rgba(59,130,246,0.6)";
            if (node.id === "hlt") return "rgba(239,68,68,0.6)";
            if (node.id === "gov") return "rgba(168,85,247,0.6)";
            return "rgba(255,255,255,0.15)";
          }}
          maskColor="rgba(0,0,0,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
