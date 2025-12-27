import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraphData, initializeDefaultGraph } from "./graphTypes";
import GraphVisualizer from "./GraphVisualizer";

export default function DijkstraVisualization() {
  const [graph, setGraph] = useState<GraphData>(initializeDefaultGraph());
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [startNode, setStartNode] = useState("A");
  const [targetNode, setTargetNode] = useState("F");
  const [stepLog, setStepLog] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const resetGraph = () => {
    const newGraph = initializeDefaultGraph();
    setGraph(newGraph);
    setCurrentNode(null);
    setStepLog([]);
    setIsComplete(false);
    setIsRunning(false);
  };

  const runDijkstra = async () => {
    setIsRunning(true);
    setStepLog([]);
    setIsComplete(false);

    const newGraph = { ...graph };
    Object.values(newGraph.nodes).forEach((node) => {
      node.distance = Infinity;
      node.previous = null;
      node.visited = false;
    });
    newGraph.nodes[startNode].distance = 0;
    setGraph({ ...newGraph });
    setStepLog((prev) => [...prev, `Starting from node ${startNode}`]);

    await new Promise((resolve) => setTimeout(resolve, speed));

    const unvisited = new Set(Object.keys(newGraph.nodes));

    while (unvisited.size > 0) {
      let minNode: string | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        if (newGraph.nodes[nodeId].distance < minDistance) {
          minDistance = newGraph.nodes[nodeId].distance;
          minNode = nodeId;
        }
      }

      if (minNode === null || minDistance === Infinity) {
        setStepLog((prev) => [...prev, "No more reachable nodes"]);
        break;
      }

      setCurrentNode(minNode);
      setStepLog((prev) => [...prev, `Visiting node ${minNode} with distance ${minDistance}`]);
      await new Promise((resolve) => setTimeout(resolve, speed));

      newGraph.nodes[minNode].visited = true;
      unvisited.delete(minNode);
      setGraph({ ...newGraph });

      if (minNode === targetNode) {
        setStepLog((prev) => [...prev, `Reached target node ${targetNode}!`]);
        break;
      }

      const neighbors = newGraph.edges.filter((edge) => edge.from === minNode);

      for (const edge of neighbors) {
        if (!newGraph.nodes[edge.to].visited) {
          const newDistance = newGraph.nodes[minNode].distance + edge.weight;

          if (newDistance < newGraph.nodes[edge.to].distance) {
            newGraph.nodes[edge.to].distance = newDistance;
            newGraph.nodes[edge.to].previous = minNode;
            setStepLog((prev) => [
              ...prev,
              `  Updated ${edge.to}: distance = ${newDistance} (via ${minNode})`,
            ]);
          }
        }
      }

      setGraph({ ...newGraph });
      await new Promise((resolve) => setTimeout(resolve, speed));
    }

    setCurrentNode(null);
    setIsComplete(true);
    setIsRunning(false);

    const path = getShortestPath(newGraph, startNode, targetNode);
    if (path.length > 0) {
      setStepLog((prev) => [
        ...prev,
        `Shortest path: ${path.join(" → ")} (distance: ${newGraph.nodes[targetNode].distance})`,
      ]);
    } else {
      setStepLog((prev) => [...prev, `No path found from ${startNode} to ${targetNode}`]);
    }
  };

  const getShortestPath = (graph: GraphData, start: string, end: string): string[] => {
    const path: string[] = [];
    let current: string | null = end;

    while (current !== null && current !== start) {
      path.unshift(current);
      current = graph.nodes[current].previous;
    }

    if (current === start) {
      path.unshift(start);
      return path;
    }

    return [];
  };

  const isOnShortestPath = (nodeId: string): boolean => {
    if (!isComplete) return false;
    const path = getShortestPath(graph, startNode, targetNode);
    return path.includes(nodeId);
  };

  const isEdgeOnPath = (from: string, to: string): boolean => {
    if (!isComplete) return false;
    const path = getShortestPath(graph, startNode, targetNode);
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i] === from && path[i + 1] === to) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Button onClick={runDijkstra} disabled={isRunning} size="lg">
              {isRunning ? "Running..." : "Start Algorithm"}
            </Button>
            <Button onClick={resetGraph} variant="outline" disabled={isRunning}>
              Reset Graph
            </Button>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Start:</label>
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
              <label className="text-sm font-medium">Target:</label>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
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
        isEdgeHighlighted={isEdgeOnPath}
        isNodeHighlighted={isOnShortestPath}
        highlightStart={startNode}
        highlightTarget={targetNode}
        onStartChange={setStartNode}
        onTargetChange={setTargetNode}
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
              <strong className="text-foreground">Dijkstra's Algorithm</strong> finds the shortest
              path from a start node to all other nodes in a weighted graph.
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Initialize all distances to infinity (except start = 0)</li>
              <li>Select unvisited node with smallest distance</li>
              <li>Update distances of neighbors through current node</li>
              <li>Mark current node as visited</li>
              <li>Repeat until target is reached or all nodes visited</li>
            </ol>
            <p className="pt-2">
              <strong className="text-foreground">Time Complexity:</strong> O((V + E) log V)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
