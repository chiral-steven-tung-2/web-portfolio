import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraphData, Edge, initializeDefaultGraph } from "./graphTypes";
import GraphVisualizer from "./GraphVisualizer";

class UnionFind {
  parent: { [key: string]: string };
  rank: { [key: string]: number };

  constructor(nodes: string[]) {
    this.parent = {};
    this.rank = {};
    for (const node of nodes) {
      this.parent[node] = node;
      this.rank[node] = 0;
    }
  }

  find(node: string): string {
    if (this.parent[node] !== node) {
      this.parent[node] = this.find(this.parent[node]);
    }
    return this.parent[node];
  }

  union(node1: string, node2: string): boolean {
    const root1 = this.find(node1);
    const root2 = this.find(node2);

    if (root1 === root2) return false;

    if (this.rank[root1] < this.rank[root2]) {
      this.parent[root1] = root2;
    } else if (this.rank[root1] > this.rank[root2]) {
      this.parent[root2] = root1;
    } else {
      this.parent[root2] = root1;
      this.rank[root1]++;
    }
    return true;
  }
}

export default function KruskalVisualization() {
  const [graph, setGraph] = useState<GraphData>(initializeDefaultGraph());
  const [currentEdge, setCurrentEdge] = useState<Edge | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [stepLog, setStepLog] = useState<string[]>([]);

  const resetGraph = () => {
    const newGraph = initializeDefaultGraph();
    setGraph(newGraph);
    setCurrentEdge(null);
    setStepLog([]);
    setIsRunning(false);
  };

  const runKruskal = async () => {
    setIsRunning(true);
    setStepLog([]);

    const newGraph = { ...graph };
    Object.values(newGraph.nodes).forEach((node) => {
      node.inMST = false;
    });
    newGraph.edges.forEach((edge) => {
      edge.inMST = false;
    });
    setGraph({ ...newGraph });

    // Get unique edges (remove duplicates from undirected representation)
    const uniqueEdges: Edge[] = [];
    const seen = new Set<string>();

    for (const edge of newGraph.edges) {
      const key1 = `${edge.from}-${edge.to}`;
      const key2 = `${edge.to}-${edge.from}`;
      if (!seen.has(key1) && !seen.has(key2)) {
        uniqueEdges.push(edge);
        seen.add(key1);
        seen.add(key2);
      }
    }

    // Sort edges by weight
    const sortedEdges = [...uniqueEdges].sort((a, b) => a.weight - b.weight);

    setStepLog((prev) => [
      ...prev,
      `Starting Kruskal's algorithm`,
      `Sorted ${sortedEdges.length} edges by weight`,
    ]);

    await new Promise((resolve) => setTimeout(resolve, speed));

    const uf = new UnionFind(Object.keys(newGraph.nodes));
    const mstEdges: Edge[] = [];
    let totalWeight = 0;

    for (const edge of sortedEdges) {
      setCurrentEdge(edge);
      setStepLog((prev) => [...prev, `Considering edge ${edge.from}-${edge.to} (weight: ${edge.weight})`]);
      setGraph({ ...newGraph });
      await new Promise((resolve) => setTimeout(resolve, speed));

      if (uf.union(edge.from, edge.to)) {
        // Add edge to MST
        const edge1 = newGraph.edges.find((e) => e.from === edge.from && e.to === edge.to);
        const edge2 = newGraph.edges.find((e) => e.from === edge.to && e.to === edge.from);
        if (edge1) edge1.inMST = true;
        if (edge2) edge2.inMST = true;

        newGraph.nodes[edge.from].inMST = true;
        newGraph.nodes[edge.to].inMST = true;

        mstEdges.push(edge);
        totalWeight += edge.weight;
        setStepLog((prev) => [...prev, `  ✓ Added to MST (total weight: ${totalWeight})`]);
        setGraph({ ...newGraph });
      } else {
        setStepLog((prev) => [...prev, `  ✗ Rejected (would create cycle)`]);
      }

      await new Promise((resolve) => setTimeout(resolve, speed));
    }

    setCurrentEdge(null);
    setIsRunning(false);

    setStepLog((prev) => [
      ...prev,
      `MST complete! Total weight: ${totalWeight}, Edges in MST: ${mstEdges.length}`,
    ]);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Button onClick={runKruskal} disabled={isRunning} size="lg">
              {isRunning ? "Running..." : "Start Algorithm"}
            </Button>
            <Button onClick={resetGraph} variant="outline" disabled={isRunning}>
              Reset Graph
            </Button>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
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

      <GraphVisualizer
        graph={graph}
        setGraph={setGraph}
        currentNode={null}
        isRunning={isRunning}
        isEdgeHighlighted={(from, to) => {
          if (currentEdge) {
            return (
              (currentEdge.from === from && currentEdge.to === to) ||
              (currentEdge.from === to && currentEdge.to === from)
            );
          }
          return false;
        }}
        isNodeHighlighted={() => false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Algorithm Steps</h3>
          <div className="h-[300px] overflow-y-auto font-mono text-sm space-y-1 bg-slate-50 dark:bg-slate-900 p-3 rounded">
            {stepLog.length === 0 ? (
              <p className="text-muted-foreground italic">Click "Start Algorithm" to begin</p>
            ) : (
              stepLog.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.startsWith("  ✓")
                      ? "text-green-600 dark:text-green-400 pl-4"
                      : log.startsWith("  ✗")
                      ? "text-red-600 dark:text-red-400 pl-4"
                      : log.startsWith("  ")
                      ? "text-blue-600 dark:text-blue-400 pl-4"
                      : "text-foreground"
                  }
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Kruskal's Algorithm</strong> finds the Minimum
              Spanning Tree (MST) by selecting edges in order of increasing weight.
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Sort all edges by weight in ascending order</li>
              <li>Initialize each node as its own set</li>
              <li>For each edge, check if it connects two different sets</li>
              <li>If yes, add edge to MST and merge the sets</li>
              <li>If no, skip the edge (would create a cycle)</li>
              <li>Repeat until MST has V-1 edges (V = number of vertices)</li>
            </ol>
            <p className="pt-2">
              <strong className="text-foreground">Time Complexity:</strong> O(E log E) where E is
              the number of edges
            </p>
            <p>
              <strong className="text-foreground">Key Structure:</strong> Uses Union-Find
              (Disjoint Set Union) for cycle detection
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
