export interface Node {
  id: string;
  x: number;
  y: number;
  distance: number;
  previous: string | null;
  visited: boolean;
  inMST?: boolean;
}

export interface Edge {
  from: string;
  to: string;
  weight: number;
  inMST?: boolean;
}

export interface GraphData {
  nodes: { [key: string]: Node };
  edges: Edge[];
}

export function initializeDefaultGraph(): GraphData {
  const nodes: { [key: string]: Node } = {
    A: { id: "A", x: 100, y: 150, distance: Infinity, previous: null, visited: false },
    B: { id: "B", x: 250, y: 80, distance: Infinity, previous: null, visited: false },
    C: { id: "C", x: 250, y: 220, distance: Infinity, previous: null, visited: false },
    D: { id: "D", x: 400, y: 80, distance: Infinity, previous: null, visited: false },
    E: { id: "E", x: 400, y: 220, distance: Infinity, previous: null, visited: false },
    F: { id: "F", x: 550, y: 150, distance: Infinity, previous: null, visited: false },
  };

  const edges: Edge[] = [
    { from: "A", to: "B", weight: 4 },
    { from: "B", to: "A", weight: 4 },
    { from: "A", to: "C", weight: 2 },
    { from: "C", to: "A", weight: 2 },
    { from: "B", to: "D", weight: 5 },
    { from: "D", to: "B", weight: 5 },
    { from: "C", to: "B", weight: 1 },
    { from: "B", to: "C", weight: 1 },
    { from: "C", to: "E", weight: 10 },
    { from: "E", to: "C", weight: 10 },
    { from: "D", to: "F", weight: 3 },
    { from: "F", to: "D", weight: 3 },
    { from: "E", to: "D", weight: 2 },
    { from: "D", to: "E", weight: 2 },
    { from: "E", to: "F", weight: 6 },
    { from: "F", to: "E", weight: 6 },
  ];

  return { nodes, edges };
}
