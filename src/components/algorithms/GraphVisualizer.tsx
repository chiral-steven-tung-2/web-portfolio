import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraphData } from "./graphTypes";

interface GraphVisualizerProps {
  graph: GraphData;
  setGraph: (graph: GraphData) => void;
  currentNode: string | null;
  isRunning: boolean;
  isEdgeHighlighted: (from: string, to: string) => boolean;
  isNodeHighlighted: (nodeId: string) => boolean;
  highlightStart?: string;
  highlightTarget?: string;
  onStartChange?: (nodeId: string) => void;
  onTargetChange?: (nodeId: string) => void;
}

export default function GraphVisualizer({
  graph,
  setGraph,
  currentNode,
  isRunning,
  isEdgeHighlighted,
  isNodeHighlighted,
  highlightStart,
  highlightTarget,
  onStartChange,
  onTargetChange,
}: GraphVisualizerProps) {
  const [editMode, setEditMode] = useState<"view" | "add-node" | "add-edge">("view");
  const [selectedNodeForEdge, setSelectedNodeForEdge] = useState<string | null>(null);
  const [newNodeId, setNewNodeId] = useState("");
  const [newEdgeWeight, setNewEdgeWeight] = useState("1");
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (editMode === "add-node" && newNodeId.trim()) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!graph.nodes[newNodeId]) {
        const newGraph = { ...graph };
        newGraph.nodes[newNodeId] = {
          id: newNodeId,
          x,
          y,
          distance: Infinity,
          previous: null,
          visited: false,
        };
        setGraph(newGraph);
        setNewNodeId("");
      }
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (editMode === "add-edge" && !isRunning) {
      if (!selectedNodeForEdge) {
        setSelectedNodeForEdge(nodeId);
      } else if (selectedNodeForEdge !== nodeId) {
        const weight = parseInt(newEdgeWeight) || 1;
        const newGraph = { ...graph };
        newGraph.edges.push(
          { from: selectedNodeForEdge, to: nodeId, weight },
          { from: nodeId, to: selectedNodeForEdge, weight }
        );
        setGraph(newGraph);
        setSelectedNodeForEdge(null);
      }
    }
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (editMode === "view" && !isRunning) {
      e.stopPropagation();
      setDraggingNode(nodeId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNode && editMode === "view") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(30, Math.min(620, e.clientX - rect.left));
      const y = Math.max(30, Math.min(270, e.clientY - rect.top));

      const newGraph = { ...graph };
      newGraph.nodes[draggingNode].x = x;
      newGraph.nodes[draggingNode].y = y;
      setGraph(newGraph);
    }
  };

  const deleteNode = (nodeId: string) => {
    const newGraph = { ...graph };
    delete newGraph.nodes[nodeId];
    newGraph.edges = newGraph.edges.filter(
      (edge) => edge.from !== nodeId && edge.to !== nodeId
    );
    setGraph(newGraph);

    if (highlightStart === nodeId && onStartChange)
      onStartChange(Object.keys(newGraph.nodes)[0] || "");
    if (highlightTarget === nodeId && onTargetChange)
      onTargetChange(Object.keys(newGraph.nodes)[0] || "");
  };

  const deleteEdge = (from: string, to: string) => {
    const newGraph = { ...graph };
    newGraph.edges = newGraph.edges.filter(
      (edge) =>
        !(edge.from === from && edge.to === to) && !(edge.from === to && edge.to === from)
    );
    setGraph(newGraph);
  };

  const updateEdgeWeight = (from: string, to: string, newWeight: number) => {
    const newGraph = { ...graph };
    const edge1 = newGraph.edges.find((e) => e.from === from && e.to === to);
    const edge2 = newGraph.edges.find((e) => e.from === to && e.to === from);
    if (edge1) edge1.weight = newWeight;
    if (edge2) edge2.weight = newWeight;
    setGraph(newGraph);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h4 className="text-sm font-semibold mb-3">Graph Editor</h4>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2">
            <Button
              variant={editMode === "view" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setEditMode("view");
                setSelectedNodeForEdge(null);
              }}
              disabled={isRunning}
            >
              View/Drag
            </Button>
            <Button
              variant={editMode === "add-node" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setEditMode("add-node");
                setSelectedNodeForEdge(null);
              }}
              disabled={isRunning}
            >
              Add Node
            </Button>
            <Button
              variant={editMode === "add-edge" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setEditMode("add-edge");
                setSelectedNodeForEdge(null);
              }}
              disabled={isRunning}
            >
              Add Edge
            </Button>
          </div>

          {editMode === "add-node" && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Node ID"
                value={newNodeId}
                onChange={(e) => setNewNodeId(e.target.value.toUpperCase())}
                className="px-3 py-1 rounded border bg-background text-sm w-24"
                maxLength={2}
              />
              <span className="text-xs text-muted-foreground">Click to place</span>
            </div>
          )}

          {editMode === "add-edge" && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Weight"
                value={newEdgeWeight}
                onChange={(e) => setNewEdgeWeight(e.target.value)}
                className="px-3 py-1 rounded border bg-background text-sm w-20"
                min="1"
              />
              <span className="text-xs text-muted-foreground">
                {selectedNodeForEdge
                  ? `From ${selectedNodeForEdge} - Click target`
                  : "Click source"}
              </span>
              {selectedNodeForEdge && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedNodeForEdge(null)}>
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Graph</h3>
        <svg
          width="650"
          height="300"
          className="border rounded bg-slate-50 dark:bg-slate-900 cursor-pointer"
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDraggingNode(null)}
          onMouseLeave={() => setDraggingNode(null)}
        >
          {/* Edges */}
          {graph.edges
            .filter(
              (edge, idx, arr) =>
                arr.findIndex(
                  (e) =>
                    (e.from === edge.from && e.to === edge.to) ||
                    (e.from === edge.to && e.to === edge.from)
                ) === idx
            )
            .map((edge, idx) => {
              const fromNode = graph.nodes[edge.from];
              const toNode = graph.nodes[edge.to];
              const isPath = isEdgeHighlighted(edge.from, edge.to);
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={
                      edge.inMST || isPath
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground))"
                    }
                    strokeWidth={edge.inMST || isPath ? "3" : "2"}
                    opacity={edge.inMST || isPath ? 1 : 0.5}
                  />
                  <circle
                    cx={midX}
                    cy={midY}
                    r="12"
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--border))"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isRunning) {
                        const newWeight = prompt(`Edit weight:`, edge.weight.toString());
                        if (newWeight !== null) {
                          const weight = parseInt(newWeight);
                          if (!isNaN(weight) && weight > 0) {
                            updateEdgeWeight(edge.from, edge.to, weight);
                          }
                        }
                      }
                    }}
                  />
                  <text
                    x={midX}
                    y={midY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill="hsl(var(--foreground))"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {edge.weight}
                  </text>
                  {!isRunning && (
                    <text
                      x={midX + 18}
                      y={midY - 18}
                      fontSize="16"
                      fill="hsl(var(--destructive))"
                      className="cursor-pointer font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEdge(edge.from, edge.to);
                      }}
                    >
                      ×
                    </text>
                  )}
                </g>
              );
            })}

          {/* Nodes */}
          {Object.values(graph.nodes).map((node) => {
            const isCurrent = node.id === currentNode;
            const isStart = node.id === highlightStart;
            const isTarget = node.id === highlightTarget;
            const onPath = isNodeHighlighted(node.id);

            let fillColor = "hsl(var(--background))";
            let strokeColor = "hsl(var(--border))";

            if (isCurrent) {
              fillColor = "hsl(var(--primary))";
              strokeColor = "hsl(var(--primary))";
            } else if (node.inMST || node.visited) {
              fillColor = "hsl(var(--primary) / 0.2)";
            } else if (onPath) {
              fillColor = "hsl(var(--primary) / 0.5)";
            }

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="30"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isStart || isTarget ? "3" : "2"}
                  className={
                    editMode === "view" && !isRunning
                      ? "cursor-move"
                      : editMode === "add-edge"
                      ? "cursor-pointer"
                      : ""
                  }
                  onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id);
                  }}
                />
                <text
                  x={node.x}
                  y={node.y - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="20"
                  fontWeight="bold"
                  fill="hsl(var(--foreground))"
                  className="pointer-events-none"
                >
                  {node.id}
                </text>
                <text
                  x={node.x}
                  y={node.y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="hsl(var(--muted-foreground))"
                  className="pointer-events-none"
                >
                  {node.distance === Infinity ? "∞" : node.distance}
                </text>
                {!isRunning && Object.keys(graph.nodes).length > 2 && (
                  <text
                    x={node.x + 25}
                    y={node.y - 25}
                    fontSize="20"
                    fill="hsl(var(--destructive))"
                    className="cursor-pointer font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete node ${node.id}?`)) {
                        deleteNode(node.id);
                      }
                    }}
                  >
                    ×
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary"></div>
            <span>Current/Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 border-2"></div>
            <span>Visited/In MST</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-background border-2"></div>
            <span>Unvisited</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
