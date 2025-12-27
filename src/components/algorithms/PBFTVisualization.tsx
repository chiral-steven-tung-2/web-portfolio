import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Replica {
  id: number;
  x: number;
  y: number;
  isPrimary: boolean;
  isByzantine: boolean;
  phase: "idle" | "pre-prepare" | "prepare" | "commit" | "reply";
  prepareCount: number;
  commitCount: number;
  value: string | null;
  replied: boolean;
}

interface Message {
  from: number;
  to: number | "all";
  type: "pre-prepare" | "prepare" | "commit" | "reply";
  view: number;
  seq: number;
  value?: string;
}

export default function PBFTVisualization() {
  const [replicas, setReplicas] = useState<Replica[]>([
    { id: 0, x: 350, y: 50, isPrimary: true, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
    { id: 1, x: 200, y: 150, isPrimary: false, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
    { id: 2, x: 500, y: 150, isPrimary: false, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
    { id: 3, x: 200, y: 250, isPrimary: false, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
    { id: 4, x: 500, y: 250, isPrimary: false, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [stepLog, setStepLog] = useState<string[]>([]);
  const [clientRequest, setClientRequest] = useState("Transaction-X");
  const [byzantineNode, setByzantineNode] = useState<number | null>(null);

  const reset = () => {
    setReplicas([
      { id: 0, x: 350, y: 50, isPrimary: true, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
      { id: 1, x: 200, y: 150, isPrimary: false, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
      { id: 2, x: 500, y: 150, isPrimary: false, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
      { id: 3, x: 200, y: 250, isPrimary: false, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
      { id: 4, x: 500, y: 250, isPrimary: false, isByzantine: false, phase: "idle", prepareCount: 0, commitCount: 0, value: null, replied: false },
    ]);
    setMessages([]);
    setStepLog([]);
    setByzantineNode(null);
  };

  const runPBFT = async () => {
    setIsRunning(true);
    setStepLog([]);
    setMessages([]);

    const newReplicas = [...replicas];
    const view = 0;
    const seq = 1;
    const n = newReplicas.length;
    const f = Math.floor((n - 1) / 3); // Max Byzantine nodes tolerated
    const quorum = 2 * f + 1;

    // Mark byzantine node
    if (byzantineNode !== null) {
      newReplicas[byzantineNode].isByzantine = true;
      setStepLog((prev) => [...prev, `⚠️ Node ${byzantineNode} is Byzantine (faulty)`]);
    }

    setStepLog((prev) => [
      ...prev,
      `Starting PBFT with ${n} replicas (f=${f}, quorum=${quorum})`,
      `Client sends request: ${clientRequest}`,
    ]);

    await new Promise((resolve) => setTimeout(resolve, speed));

    // Phase 0: Pre-Prepare (Primary broadcasts)
    const primary = newReplicas.find((r) => r.isPrimary);
    if (!primary) return;

    setStepLog((prev) => [...prev, `Pre-Prepare: Primary (${primary.id}) broadcasts request`]);
    primary.phase = "pre-prepare";
    primary.value = clientRequest;
    
    const prePrepareMsg: Message[] = newReplicas
      .filter((r) => !r.isPrimary)
      .map((r) => ({
        from: primary.id,
        to: r.id,
        type: "pre-prepare" as const,
        view,
        seq,
        value: clientRequest,
      }));

    setReplicas([...newReplicas]);
    setMessages(prePrepareMsg);
    await new Promise((resolve) => setTimeout(resolve, speed));

    // Replicas receive pre-prepare
    for (const replica of newReplicas.filter((r) => !r.isPrimary && !r.isByzantine)) {
      replica.value = clientRequest;
      replica.phase = "pre-prepare";
    }
    setReplicas([...newReplicas]);
    setMessages([]);
    await new Promise((resolve) => setTimeout(resolve, speed / 2));

    // Phase 1: Prepare (Replicas broadcast)
    setStepLog((prev) => [...prev, `Prepare: Replicas broadcast PREPARE messages`]);
    
    const prepareMessages: Message[] = [];
    for (const replica of newReplicas.filter((r) => !r.isPrimary && !r.isByzantine)) {
      replica.phase = "prepare";
      for (const other of newReplicas.filter((o) => o.id !== replica.id)) {
        prepareMessages.push({
          from: replica.id,
          to: other.id,
          type: "prepare",
          view,
          seq,
          value: clientRequest,
        });
      }
    }

    setMessages(prepareMessages);
    setReplicas([...newReplicas]);
    await new Promise((resolve) => setTimeout(resolve, speed));

    // Count prepare messages
    for (const replica of newReplicas.filter((r) => !r.isByzantine)) {
      replica.prepareCount = prepareMessages.filter((m) => m.to === replica.id).length + 1;
      setStepLog((prev) => [
        ...prev,
        `Replica ${replica.id} received ${replica.prepareCount} PREPARE messages`,
      ]);
    }

    setMessages([]);
    setReplicas([...newReplicas]);
    await new Promise((resolve) => setTimeout(resolve, speed / 2));

    // Phase 2: Commit (if quorum reached)
    const preparedReplicas = newReplicas.filter(
      (r) => !r.isByzantine && r.prepareCount >= quorum
    );

    if (preparedReplicas.length === 0) {
      setStepLog((prev) => [...prev, "❌ Failed to reach prepare quorum"]);
      setIsRunning(false);
      return;
    }

    setStepLog((prev) => [
      ...prev,
      `✓ ${preparedReplicas.length} replicas reached prepare quorum (${quorum} needed)`,
      `Commit: Prepared replicas broadcast COMMIT messages`,
    ]);

    const commitMessages: Message[] = [];
    for (const replica of preparedReplicas) {
      replica.phase = "commit";
      for (const other of newReplicas.filter((o) => o.id !== replica.id)) {
        commitMessages.push({
          from: replica.id,
          to: other.id,
          type: "commit",
          view,
          seq,
        });
      }
    }

    setMessages(commitMessages);
    setReplicas([...newReplicas]);
    await new Promise((resolve) => setTimeout(resolve, speed));

    // Count commit messages
    for (const replica of newReplicas.filter((r) => !r.isByzantine)) {
      replica.commitCount = commitMessages.filter((m) => m.to === replica.id).length + 1;
      setStepLog((prev) => [
        ...prev,
        `Replica ${replica.id} received ${replica.commitCount} COMMIT messages`,
      ]);
    }

    setMessages([]);
    setReplicas([...newReplicas]);
    await new Promise((resolve) => setTimeout(resolve, speed / 2));

    // Reply to client
    const committedReplicas = newReplicas.filter(
      (r) => !r.isByzantine && r.commitCount >= quorum + 1
    );

    if (committedReplicas.length === 0) {
      setStepLog((prev) => [...prev, "❌ Failed to reach commit quorum"]);
      setIsRunning(false);
      return;
    }

    setStepLog((prev) => [
      ...prev,
      `✓ ${committedReplicas.length} replicas reached commit quorum`,
      `Reply: Replicas send REPLY to client`,
    ]);

    for (const replica of committedReplicas) {
      replica.phase = "reply";
      replica.replied = true;
    }

    const replyMessages: Message[] = committedReplicas.map((r) => ({
      from: r.id,
      to: -1,
      type: "reply" as const,
      view,
      seq,
      value: clientRequest,
    }));

    setMessages(replyMessages);
    setReplicas([...newReplicas]);
    await new Promise((resolve) => setTimeout(resolve, speed));

    setStepLog((prev) => [
      ...prev,
      `🎉 Consensus achieved! Client received ${committedReplicas.length} matching replies`,
      `Request "${clientRequest}" committed successfully`,
    ]);

    if (byzantineNode !== null) {
      setStepLog((prev) => [
        ...prev,
        `✓ Byzantine node ${byzantineNode} was tolerated (${f} failures max)`,
      ]);
    }

    setMessages([]);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Button onClick={runPBFT} disabled={isRunning} size="lg">
              {isRunning ? "Running..." : "Run PBFT"}
            </Button>
            <Button onClick={reset} variant="outline" disabled={isRunning}>
              Reset
            </Button>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Request:</label>
              <input
                type="text"
                value={clientRequest}
                onChange={(e) => setClientRequest(e.target.value)}
                disabled={isRunning}
                className="px-3 py-1 rounded border bg-background w-32"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Byzantine Node:</label>
              <select
                value={byzantineNode ?? ""}
                onChange={(e) =>
                  setByzantineNode(e.target.value ? Number(e.target.value) : null)
                }
                disabled={isRunning}
                className="px-3 py-1 rounded border bg-background"
              >
                <option value="">None</option>
                {replicas.filter((r) => !r.isPrimary).map((r) => (
                  <option key={r.id} value={r.id}>
                    Node {r.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Speed:</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                disabled={isRunning}
                className="px-3 py-1 rounded border bg-background"
              >
                <option value={2000}>Slow</option>
                <option value={1000}>Normal</option>
                <option value={500}>Fast</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">PBFT Network</h3>
        <svg width="700" height="320" className="border rounded bg-slate-50 dark:bg-slate-900">
          {/* Client */}
          <g>
            <rect
              x="315"
              y="5"
              width="70"
              height="30"
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              rx="5"
            />
            <text
              x="350"
              y="25"
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="hsl(var(--foreground))"
            >
              Client
            </text>
          </g>

          {/* Messages */}
          {messages.map((msg, idx) => {
            const from = msg.from === -1 ? { x: 350, y: 35 } : replicas.find((r) => r.id === msg.from);
            const to = msg.to === -1 ? { x: 350, y: 35 } : msg.to === "all" ? null : replicas.find((r) => r.id === msg.to);
            
            if (!from || !to) return null;

            return (
              <g key={idx}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={msg.type === "reply" ? "hsl(var(--primary))" : "hsl(var(--chart-2))"}
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  opacity="0.5"
                  markerEnd="url(#arrow2)"
                />
              </g>
            );
          })}

          <defs>
            <marker
              id="arrow2"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--primary))" opacity="0.7" />
            </marker>
          </defs>

          {/* Replicas */}
          {replicas.map((replica) => (
            <g key={replica.id}>
              <circle
                cx={replica.x}
                cy={replica.y}
                r="30"
                fill={
                  replica.isByzantine
                    ? "hsl(var(--destructive) / 0.3)"
                    : replica.replied
                    ? "hsl(var(--primary))"
                    : replica.phase !== "idle"
                    ? "hsl(var(--primary) / 0.3)"
                    : "hsl(var(--background))"
                }
                stroke={
                  replica.isPrimary
                    ? "hsl(var(--primary))"
                    : replica.isByzantine
                    ? "hsl(var(--destructive))"
                    : "hsl(var(--border))"
                }
                strokeWidth={replica.isPrimary ? "3" : "2"}
              />
              <text
                x={replica.x}
                y={replica.y - 5}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="hsl(var(--foreground))"
              >
                {replica.id}
              </text>
              <text
                x={replica.x}
                y={replica.y + 10}
                textAnchor="middle"
                fontSize="9"
                fill="hsl(var(--muted-foreground))"
              >
                {replica.isPrimary ? "PRIMARY" : replica.isByzantine ? "BYZANTINE" : "REPLICA"}
              </text>
              {replica.phase !== "idle" && (
                <text
                  x={replica.x}
                  y={replica.y + 45}
                  textAnchor="middle"
                  fontSize="9"
                  fill="hsl(var(--foreground))"
                  className="font-mono"
                >
                  {replica.phase}
                </text>
              )}
            </g>
          ))}
        </svg>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary border-2 border-primary"></div>
            <span>Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary"></div>
            <span>Replied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/30 border-2"></div>
            <span>Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-destructive/30 border-2 border-destructive"></div>
            <span>Byzantine</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Algorithm Steps</h3>
          <div className="h-[300px] overflow-y-auto font-mono text-sm space-y-1 bg-slate-50 dark:bg-slate-900 p-3 rounded">
            {stepLog.length === 0 ? (
              <p className="text-muted-foreground italic">Click "Run PBFT" to begin</p>
            ) : (
              stepLog.map((log, idx) => (
                <div key={idx} className="text-foreground">
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">How PBFT Works</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">PBFT (Practical Byzantine Fault Tolerance)</strong>{" "}
              achieves consensus even when up to f nodes are Byzantine (malicious/faulty).
            </p>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Three-Phase Protocol:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>
                  <strong>Pre-Prepare:</strong> Primary broadcasts request to all replicas
                </li>
                <li>
                  <strong>Prepare:</strong> Replicas broadcast PREPARE messages to each other
                </li>
                <li>
                  <strong>Commit:</strong> After 2f+1 PREPARE messages, broadcast COMMIT
                </li>
                <li>
                  <strong>Reply:</strong> After 2f+1 COMMIT messages, send reply to client
                </li>
              </ol>
            </div>
            <p className="pt-2">
              <strong className="text-foreground">Requirements:</strong>
            </p>
            <ul className="list-disc list-inside ml-2">
              <li>Needs n ≥ 3f + 1 replicas to tolerate f failures</li>
              <li>Quorum = 2f + 1 messages</li>
              <li>Client waits for f + 1 matching replies</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
