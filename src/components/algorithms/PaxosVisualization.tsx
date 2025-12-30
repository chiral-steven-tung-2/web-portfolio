import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Server {
  id: number;
  role: "proposer" | "acceptor" | "learner";
  x: number;
  y: number;
  promiseN: number | null;
  acceptedN: number | null;
  acceptedValue: string | null;
  learned: boolean;
}

interface Message {
  from: number;
  to: number;
  type: "prepare" | "promise" | "accept" | "accepted";
  n: number;
  value?: string;
  prevN?: number;
  prevValue?: string;
}

export default function PaxosVisualization() {
  const [servers, setServers] = useState<Server[]>([
    { id: 0, role: "proposer", x: 100, y: 100, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
    { id: 1, role: "acceptor", x: 250, y: 50, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
    { id: 2, role: "acceptor", x: 400, y: 50, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
    { id: 3, role: "acceptor", x: 550, y: 50, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
    { id: 4, role: "learner", x: 250, y: 200, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
    { id: 5, role: "learner", x: 400, y: 200, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [stepLog, setStepLog] = useState<string[]>([]);
  const [proposalNumber, setProposalNumber] = useState(1);
  const [proposalValue, setProposalValue] = useState("Value-A");
  const [phase, setPhase] = useState<"idle" | "prepare" | "accept" | "learn">("idle");

  const reset = () => {
    setServers([
      { id: 0, role: "proposer", x: 100, y: 100, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
      { id: 1, role: "acceptor", x: 250, y: 50, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
      { id: 2, role: "acceptor", x: 400, y: 50, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
      { id: 3, role: "acceptor", x: 550, y: 50, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
      { id: 4, role: "learner", x: 250, y: 200, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
      { id: 5, role: "learner", x: 400, y: 200, promiseN: null, acceptedN: null, acceptedValue: null, learned: false },
    ]);
    setMessages([]);
    setStepLog([]);
    setPhase("idle");
    setProposalNumber(1);
  };

  const runPaxos = async () => {
    setIsRunning(true);
    setStepLog([]);
    setMessages([]);

    const n = proposalNumber;
    const value = proposalValue;
    const newServers = [...servers];

    // Phase 1a: Prepare
    setPhase("prepare");
    setStepLog((prev) => [...prev, `Phase 1a: Proposer sends PREPARE(n=${n}) to acceptors`]);
    
    const acceptors = newServers.filter((s) => s.role === "acceptor");
    const tempMessages: Message[] = acceptors.map((a) => ({
      from: 0,
      to: a.id,
      type: "prepare",
      n,
    }));
    setMessages(tempMessages);
    await new Promise((resolve) => setTimeout(resolve, speed));

    // Phase 1b: Promise
    setMessages([]);
    const promises: Message[] = [];
    
    for (const acceptor of acceptors) {
      if (acceptor.promiseN === null || n > acceptor.promiseN) {
        acceptor.promiseN = n;
        promises.push({
          from: acceptor.id,
          to: 0,
          type: "promise",
          n,
          prevN: acceptor.acceptedN || undefined,
          prevValue: acceptor.acceptedValue || undefined,
        });
        setStepLog((prev) => [
          ...prev,
          `Phase 1b: Acceptor ${acceptor.id} promises to accept n=${n}${
            acceptor.acceptedValue ? ` (previously accepted: ${acceptor.acceptedValue})` : ""
          }`,
        ]);
      } else {
        setStepLog((prev) => [
          ...prev,
          `Phase 1b: Acceptor ${acceptor.id} rejects (already promised n=${acceptor.promiseN})`,
        ]);
      }
    }
    
    setServers([...newServers]);
    setMessages(promises);
    await new Promise((resolve) => setTimeout(resolve, speed));

    if (promises.length < Math.ceil(acceptors.length / 2)) {
      setStepLog((prev) => [...prev, "❌ Failed to get majority promises"]);
      setIsRunning(false);
      setPhase("idle");
      return;
    }

    setStepLog((prev) => [...prev, `✓ Received majority promises (${promises.length}/${acceptors.length})`]);

    // Check if any acceptor has already accepted a value
    let valueToPropose = value;
    const maxPrevN = Math.max(...promises.map((p) => p.prevN || 0));
    if (maxPrevN > 0) {
      const highestPrev = promises.find((p) => p.prevN === maxPrevN);
      if (highestPrev?.prevValue) {
        valueToPropose = highestPrev.prevValue;
        setStepLog((prev) => [
          ...prev,
          `Using previously accepted value: ${valueToPropose}`,
        ]);
      }
    }

    // Phase 2a: Accept
    setPhase("accept");
    setMessages([]);
    await new Promise((resolve) => setTimeout(resolve, speed / 2));

    setStepLog((prev) => [...prev, `Phase 2a: Proposer sends ACCEPT(n=${n}, value=${valueToPropose})`]);
    const acceptMessages: Message[] = acceptors.map((a) => ({
      from: 0,
      to: a.id,
      type: "accept",
      n,
      value: valueToPropose,
    }));
    setMessages(acceptMessages);
    await new Promise((resolve) => setTimeout(resolve, speed));

    // Phase 2b: Accepted
    setMessages([]);
    const accepted: Message[] = [];

    for (const acceptor of acceptors) {
      if (acceptor.promiseN !== null && n >= acceptor.promiseN) {
        acceptor.acceptedN = n;
        acceptor.acceptedValue = valueToPropose;
        accepted.push({
          from: acceptor.id,
          to: 0,
          type: "accepted",
          n,
          value: valueToPropose,
        });
        setStepLog((prev) => [
          ...prev,
          `Phase 2b: Acceptor ${acceptor.id} accepted (n=${n}, value=${valueToPropose})`,
        ]);
      }
    }

    setServers([...newServers]);
    setMessages(accepted);
    await new Promise((resolve) => setTimeout(resolve, speed));

    if (accepted.length >= Math.ceil(acceptors.length / 2)) {
      setStepLog((prev) => [
        ...prev,
        `✓ Majority accepted (${accepted.length}/${acceptors.length})`,
      ]);

      // Notify learners
      setPhase("learn");
      setMessages([]);
      await new Promise((resolve) => setTimeout(resolve, speed / 2));

      const learners = newServers.filter((s) => s.role === "learner");
      const learnMessages: Message[] = learners.flatMap((l) =>
        accepted.slice(0, 1).map((a) => ({
          from: a.from,
          to: l.id,
          type: "accepted" as const,
          n,
          value: valueToPropose,
        }))
      );

      setMessages(learnMessages);
      setStepLog((prev) => [...prev, `Learners receive consensus value: ${valueToPropose}`]);

      for (const learner of learners) {
        learner.learned = true;
        learner.acceptedValue = valueToPropose;
      }

      setServers([...newServers]);
      await new Promise((resolve) => setTimeout(resolve, speed));

      setStepLog((prev) => [...prev, `🎉 Consensus achieved: ${valueToPropose}`]);
    } else {
      setStepLog((prev) => [...prev, "❌ Failed to get majority acceptance"]);
    }

    setMessages([]);
    setIsRunning(false);
    setPhase("idle");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Button onClick={runPaxos} disabled={isRunning} size="lg">
              {isRunning ? "Running..." : "Run Paxos"}
            </Button>
            <Button onClick={reset} variant="outline" disabled={isRunning}>
              Reset
            </Button>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Proposal #:</label>
              <input
                type="number"
                value={proposalNumber}
                onChange={(e) => setProposalNumber(Number(e.target.value))}
                disabled={isRunning}
                className="px-3 py-1 rounded border bg-background w-20"
                min="1"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Value:</label>
              <input
                type="text"
                value={proposalValue}
                onChange={(e) => setProposalValue(e.target.value)}
                disabled={isRunning}
                className="px-3 py-1 rounded border bg-background w-24"
              />
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
        <h3 className="text-xl font-semibold mb-4">Paxos Network</h3>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 700 280" className="border rounded bg-slate-50 dark:bg-slate-900 w-full max-w-full h-auto" style={{ minWidth: "300px" }}>
          {/* Messages */}
          {messages.map((msg, idx) => {
            const from = servers.find((s) => s.id === msg.from);
            const to = servers.find((s) => s.id === msg.to);
            if (!from || !to) return null;

            return (
              <g key={idx}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                  markerEnd="url(#arrow)"
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 10}
                  fontSize="10"
                  fill="hsl(var(--primary))"
                  className="font-mono"
                >
                  {msg.type}
                </text>
              </g>
            );
          })}

          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="hsl(var(--primary))" />
            </marker>
          </defs>

          {/* Servers */}
          {servers.map((server) => (
            <g key={server.id}>
              <circle
                cx={server.x}
                cy={server.y}
                r="25"
                fill={
                  server.learned
                    ? "hsl(var(--primary))"
                    : server.acceptedValue
                    ? "hsl(var(--primary) / 0.3)"
                    : "hsl(var(--background))"
                }
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
              <text
                x={server.x}
                y={server.y - 5}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="hsl(var(--foreground))"
              >
                {server.role[0].toUpperCase()}{server.id}
              </text>
              <text
                x={server.x}
                y={server.y + 8}
                textAnchor="middle"
                fontSize="9"
                fill="hsl(var(--muted-foreground))"
              >
                {server.role}
              </text>
              {server.acceptedValue && (
                <text
                  x={server.x}
                  y={server.y + 40}
                  textAnchor="middle"
                  fontSize="10"
                  fill="hsl(var(--foreground))"
                  className="font-mono"
                >
                  {server.acceptedValue}
                </text>
              )}
            </g>
          ))}
        </svg>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary"></div>
            <span>Learned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/30 border-2"></div>
            <span>Accepted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-background border-2"></div>
            <span>Idle</span>
          </div>
          <div className="px-3 py-1 bg-muted rounded text-xs">
            Phase: <strong>{phase}</strong>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Algorithm Steps</h3>
          <div className="h-[300px] overflow-y-auto font-mono text-sm space-y-1 bg-slate-50 dark:bg-slate-900 p-3 rounded">
            {stepLog.length === 0 ? (
              <p className="text-muted-foreground italic">Click "Run Paxos" to begin</p>
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
          <h3 className="text-xl font-semibold mb-4">How Paxos Works</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Paxos</strong> is a consensus algorithm that
              ensures distributed systems agree on a single value even with failures.
            </p>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Phase 1 - Prepare:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Proposer sends PREPARE(n) to acceptors</li>
                <li>Acceptors promise not to accept proposals {"<"} n</li>
                <li>Acceptors return any previously accepted value</li>
              </ol>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Phase 2 - Accept:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Proposer sends ACCEPT(n, value) to acceptors</li>
                <li>Acceptors accept if they haven't promised higher n</li>
                <li>Learners learn the consensus value</li>
              </ol>
            </div>
            <p className="pt-2">
              <strong className="text-foreground">Key Property:</strong> Requires majority (quorum)
              for both phases
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
