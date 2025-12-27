import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraphData, initializeDefaultGraph } from "./graphTypes";
import GraphVisualizer from "./GraphVisualizer";

export default function PrimVisualization() {
  const [graph, setGraph] = useState<GraphData>(initializeDefaultGraph());
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [startNode, setStartNode] = useState("A");
  const [stepLog, setStepLog] = useState<string[]>([]);

  const resetGraph = () => {
    const newGraph = initializeDefaultGraph();
    setGraph(newGraph);
    setCurrentNode(null);
    setStepLog([]);
    setIsRunning(false);
  };

  const runPrim = async () => {
    setIsRunning(true);
    setStepLog([]);

    const newGraph = { ...graph };
    Object.values(newGraph.nodes).forEach((node) => {
      node.distance = Infinity;
      node.previous = null;
      node.visited = false;
      node.inMST = false;
    });
    newGraph.edges.forEach((edge) => {
      edge.inMST = false;
    });

    newGraph.nodes[startNode].distance = 0;
    setGraph({ ...newGraph });
    setStepLog((prev) => [...prev, `Starting Prim's algorithm from node ${startNode}`]);

    await new Promise((resolve) => setTimeout(resolve, speed));

    const unvisited = new Set(Object.keys(newGraph.nodes));
    let totalWeight = 0;

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let minNode: string | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        if (newGraph.nodes[nodeId].distance < minDistance) {
          minDistance = newGraph.nodes[nodeId].distance;
          minNode = nodeId;
        }
      }

      if (minNode === null || (minDistance === Infinity && unvisited.size > 0)) {
        setStepLog((prev) => [...prev, "Graph is disconnected - MST cannot span all nodes"]);
        break;
      }

      // Add node to MST
      setCurrentNode(minNode);
      newGraph.nodes[minNode].inMST = true;
      newGraph.nodes[minNode].visited = true;
      unvisited.delete(minNode);

      if (minDistance !== Infinity) {
        totalWeight += minDistance;
        setStepLog((prev) => [
          ...prev,
          `Adding node ${minNode} to MST (edge weight: ${minDistance})`,
        ]);

        // Mark the edge as part of MST
        if (newGraph.nodes[minNode].previous) {
          const prev = newGraph.nodes[minNode].previous;
          const edge1 = newGraph.edges.find((e) => e.from === prev && e.to === minNode);
          const edge2 = newGraph.edges.find((e) => e.from === minNode && e.to === prev);
          if (edge1) edge1.inMST = true;
          if (edge2) edge2.inMST = true;
        }
      } else {
        setStepLog((prev) => [...prev, `Starting node ${minNode} added to MST`]);
      }

      setGraph({ ...newGraph });
      await new Promise((resolve) => setTimeout(resolve, speed));

      // Update distances to neighbors
      const neighbors = newGraph.edges.filter((edge) => edge.from === minNode);

      for (const edge of neighbors) {
        if (!newGraph.nodes[edge.to].inMST) {
          if (edge.weight < newGraph.nodes[edge.to].distance) {
            newGraph.nodes[edge.to].distance = edge.weight;
            newGraph.nodes[edge.to].previous = minNode;
            setStepLog((prev) => [
              ...prev,
              `  Updated ${edge.to}: key = ${edge.weight} (via ${minNode})`,
            ]);
          }
        }
      }

      setGraph({ ...newGraph });
      await new Promise((resolve) => setTimeout(resolve, speed));
    }

    setCurrentNode(null);
    setIsRunning(false);

    const mstEdges = newGraph.edges.filter((e) => e.inMST);
    const uniqueEdges = mstEdges.filter(
      (edge, idx, arr) =>
        arr.findIndex(
          (e) =>
            (e.from === edge.from && e.to === edge.to) ||
            (e.from === edge.to && e.to === edge.from)
        ) === idx
    );

    setStepLog((prev) => [
      ...prev,
      `MST complete! Total weight: ${totalWeight}, Edges in MST: ${uniqueEdges.length}`,
    ]);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Button onClick={runPrim} disabled={isRunning} size="lg">
              {isRunning ? "Running..." : "Start Algorithm"}
            </Button>
            <Button onClick={resetGraph} variant="outline" disabled={isRunning}>
              Reset Graph
            </Button>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Start Node:</label>
              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                disabled={isRunning}
                className="px-3 py-1 rounded border bg-background"
              >
                {Object.keys(graph.nodes).map((nodeId) => (
                  <option key={nodeId} value={nodeId}>
                    {nodeId}
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

      <GraphVisualizer
        graph={graph}
        setGraph={setGraph}
        currentNode={currentNode}
        isRunning={isRunning}
        isEdgeHighlighted={() => false}
        isNodeHighlighted={() => false}
        highlightStart={startNode}
        onStartChange={setStartNode}
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
                    log.startsWith("  ")
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
              <strong className="text-foreground">Prim's Algorithm</strong> finds the Minimum
              Spanning Tree (MST) of a weighted undirected graph.
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Start with any node as the initial MST</li>
              <li>Find the minimum weight edge connecting MST to a new node</li>
              <li>Add that edge and node to the MST</li>
              <li>Repeat until all nodes are in the MST</li>
            </ol>
            <p className="pt-2">
              <strong className="text-foreground">Time Complexity:</strong> O((V + E) log V) with
              binary heap
            </p>
            <p>
              <strong className="text-foreground">Use Case:</strong> Network design, clustering,
              approximation algorithms
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
