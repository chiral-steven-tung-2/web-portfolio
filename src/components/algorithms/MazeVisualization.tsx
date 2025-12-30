import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CellType = "empty" | "wall" | "start" | "end" | "visited" | "path" | "current";

interface Cell {
  row: number;
  col: number;
  type: CellType;
}

export default function MazeVisualization() {
  const rows = 15;
  const cols = 25;

  const [maze, setMaze] = useState<Cell[][]>(initializeMaze(rows, cols));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [algorithm, setAlgorithm] = useState<"dfs" | "bfs">("dfs");
  const [stepLog, setStepLog] = useState<string[]>([]);
  const [drawMode, setDrawMode] = useState<"wall" | "start" | "end">("wall");
  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState({ row: 7, col: 2 });
  const [end, setEnd] = useState({ row: 7, col: 22 });

  function initializeMaze(rows: number, cols: number): Cell[][] {
    const maze: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        let type: CellType = "empty";
        if (r === 7 && c === 2) type = "start";
        else if (r === 7 && c === 22) type = "end";
        row.push({ row: r, col: c, type });
      }
      maze.push(row);
    }
    return maze;
  }

  const resetMaze = () => {
    setMaze(initializeMaze(rows, cols));
    setStepLog([]);
    setStart({ row: 7, col: 2 });
    setEnd({ row: 7, col: 22 });
  };

  const clearPath = () => {
    const newMaze: Cell[][] = maze.map((row) =>
      row.map((cell) => ({
        ...cell,
        type:
          cell.type === "visited" || cell.type === "path" || cell.type === "current"
            ? "empty"
            : cell.type,
      }))
    );
    setMaze(newMaze);
    setStepLog([]);
  };

  const generateRandomMaze = () => {
    const newMaze = initializeMaze(rows, cols);
    
    // Add random walls
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newMaze[r][c].type === "empty" && Math.random() < 0.3) {
          newMaze[r][c].type = "wall";
        }
      }
    }
    
    setMaze(newMaze);
    setStepLog([]);
  };

  const handleCellClick = (row: number, col: number) => {
    if (isRunning) return;

    const newMaze = [...maze];
    const cell = newMaze[row][col];

    if (drawMode === "start") {
      // Clear old start
      const oldStart = newMaze[start.row][start.col];
      if (oldStart.type === "start") oldStart.type = "empty";
      
      // Set new start
      if (cell.type !== "end" && cell.type !== "wall") {
        cell.type = "start";
        setStart({ row, col });
      }
    } else if (drawMode === "end") {
      // Clear old end
      const oldEnd = newMaze[end.row][end.col];
      if (oldEnd.type === "end") oldEnd.type = "empty";
      
      // Set new end
      if (cell.type !== "start" && cell.type !== "wall") {
        cell.type = "end";
        setEnd({ row, col });
      }
    } else if (drawMode === "wall") {
      if (cell.type !== "start" && cell.type !== "end") {
        cell.type = cell.type === "wall" ? "empty" : "wall";
      }
    }

    setMaze(newMaze);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isDrawing || isRunning || drawMode !== "wall") return;
    
    const newMaze = [...maze];
    const cell = newMaze[row][col];
    
    if (cell.type !== "start" && cell.type !== "end") {
      cell.type = "wall";
      setMaze(newMaze);
    }
  };

  const runDFS = async () => {
    setIsRunning(true);
    setStepLog([`Starting DFS from (${start.row}, ${start.col})`]);
    clearPath();

    const newMaze: Cell[][] = maze.map((row) =>
      row.map((cell) => ({
        ...cell,
        type:
          cell.type === "visited" || cell.type === "path" || cell.type === "current"
            ? "empty"
            : cell.type,
      }))
    );

    const stack: [number, number, [number, number][]][] = [[start.row, start.col, []]];
    const visited = new Set<string>();
    visited.add(`${start.row},${start.col}`);

    let found = false;
    let nodesExplored = 0;

    while (stack.length > 0 && !found) {
      const [row, col, path] = stack.pop()!;
      nodesExplored++;

      // Mark as current
      if (newMaze[row][col].type === "empty") {
        newMaze[row][col].type = "current";
      }
      setMaze([...newMaze]);
      await new Promise((resolve) => setTimeout(resolve, speed));

      // Mark as visited
      if (newMaze[row][col].type === "current") {
        newMaze[row][col].type = "visited";
      }

      if (row === end.row && col === end.col) {
        found = true;
        setStepLog((prev) => [
          ...prev,
          `Found path! Nodes explored: ${nodesExplored}, Path length: ${path.length + 1}`,
        ]);

        // Draw path
        for (const [r, c] of path) {
          if (newMaze[r][c].type === "visited") {
            newMaze[r][c].type = "path";
          }
        }
        setMaze([...newMaze]);
        break;
      }

      // Explore neighbors (in DFS order: right, down, left, up)
      const neighbors: [number, number][] = [
        [row, col + 1],
        [row + 1, col],
        [row, col - 1],
        [row - 1, col],
      ];

      for (const [nr, nc] of neighbors.reverse()) {
        if (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          !visited.has(`${nr},${nc}`) &&
          newMaze[nr][nc].type !== "wall"
        ) {
          visited.add(`${nr},${nc}`);
          stack.push([nr, nc, [...path, [row, col]]]);
        }
      }

      setMaze([...newMaze]);
    }

    if (!found) {
      setStepLog((prev) => [...prev, `No path found. Nodes explored: ${nodesExplored}`]);
    }

    setIsRunning(false);
  };

  const runBFS = async () => {
    setIsRunning(true);
    setStepLog([`Starting BFS from (${start.row}, ${start.col})`]);
    clearPath();

    const newMaze: Cell[][] = maze.map((row) =>
      row.map((cell) => ({
        ...cell,
        type:
          cell.type === "visited" || cell.type === "path" || cell.type === "current"
            ? "empty"
            : cell.type,
      }))
    );

    const queue: [number, number, [number, number][]][] = [[start.row, start.col, []]];
    const visited = new Set<string>();
    visited.add(`${start.row},${start.col}`);

    let found = false;
    let nodesExplored = 0;

    while (queue.length > 0 && !found) {
      const [row, col, path] = queue.shift()!;
      nodesExplored++;

      // Mark as current
      if (newMaze[row][col].type === "empty") {
        newMaze[row][col].type = "current";
      }
      setMaze([...newMaze]);
      await new Promise((resolve) => setTimeout(resolve, speed));

      // Mark as visited
      if (newMaze[row][col].type === "current") {
        newMaze[row][col].type = "visited";
      }

      if (row === end.row && col === end.col) {
        found = true;
        setStepLog((prev) => [
          ...prev,
          `Found path! Nodes explored: ${nodesExplored}, Path length: ${path.length + 1}`,
        ]);

        // Draw path
        for (const [r, c] of path) {
          if (newMaze[r][c].type === "visited") {
            newMaze[r][c].type = "path";
          }
        }
        setMaze([...newMaze]);
        break;
      }

      // Explore neighbors (BFS explores in all directions)
      const neighbors: [number, number][] = [
        [row - 1, col],
        [row, col + 1],
        [row + 1, col],
        [row, col - 1],
      ];

      for (const [nr, nc] of neighbors) {
        if (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          !visited.has(`${nr},${nc}`) &&
          newMaze[nr][nc].type !== "wall"
        ) {
          visited.add(`${nr},${nc}`);
          queue.push([nr, nc, [...path, [row, col]]]);
        }
      }

      setMaze([...newMaze]);
    }

    if (!found) {
      setStepLog((prev) => [...prev, `No path found. Nodes explored: ${nodesExplored}`]);
    }

    setIsRunning(false);
  };

  const runAlgorithm = () => {
    if (algorithm === "dfs") {
      runDFS();
    } else {
      runBFS();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-3 md:p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 md:gap-4 items-center">
            <div className="flex flex-wrap gap-2 md:gap-4 items-center w-full md:w-auto">
              <Button onClick={runAlgorithm} disabled={isRunning} size="sm" className="flex-1 md:flex-none md:text-base">
                {isRunning ? "Running..." : `Run ${algorithm.toUpperCase()}`}
              </Button>
              <Button onClick={clearPath} variant="outline" disabled={isRunning} size="sm" className="flex-1 md:flex-none">
                Clear Path
              </Button>
              <Button onClick={resetMaze} variant="outline" disabled={isRunning} size="sm" className="flex-1 md:flex-none">
                Reset
              </Button>
              <Button onClick={generateRandomMaze} variant="outline" disabled={isRunning} size="sm" className="flex-1 md:flex-none">
                Random
              </Button>
            </div>

            <div className="flex gap-2 md:gap-4 items-center flex-wrap w-full md:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Algorithm:</label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value as "dfs" | "bfs")}
                  disabled={isRunning}
                  className="px-3 py-1 rounded border bg-background"
                >
                  <option value="dfs">DFS (Depth-First)</option>
                  <option value="bfs">BFS (Breadth-First)</option>
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
                  <option value={100}>Slow</option>
                  <option value={50}>Normal</option>
                  <option value={10}>Fast</option>
                  <option value={1}>Very Fast</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">Draw Mode</h4>
            <div className="flex gap-2">
              <Button
                variant={drawMode === "wall" ? "default" : "outline"}
                size="sm"
                onClick={() => setDrawMode("wall")}
                disabled={isRunning}
              >
                Draw Walls
              </Button>
              <Button
                variant={drawMode === "start" ? "default" : "outline"}
                size="sm"
                onClick={() => setDrawMode("start")}
                disabled={isRunning}
              >
                Set Start
              </Button>
              <Button
                variant={drawMode === "end" ? "default" : "outline"}
                size="sm"
                onClick={() => setDrawMode("end")}
                disabled={isRunning}
              >
                Set End
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Maze</h3>
        <div className="overflow-x-auto">
          <div
            className="inline-block border rounded bg-slate-50 dark:bg-slate-900"
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
          >
            {maze.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell) => {
                  let bgColor = "bg-white dark:bg-slate-800";
                  
                  if (cell.type === "wall") bgColor = "bg-slate-900 dark:bg-slate-200";
                  else if (cell.type === "start") bgColor = "bg-green-500";
                  else if (cell.type === "end") bgColor = "bg-red-500";
                  else if (cell.type === "path") bgColor = "bg-yellow-400";
                  else if (cell.type === "current") bgColor = "bg-purple-500";
                  else if (cell.type === "visited") bgColor = "bg-blue-200 dark:bg-blue-800";

                  return (
                    <div
                      key={`${cell.row}-${cell.col}`}
                      className={`w-4 h-4 md:w-6 md:h-6 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors ${bgColor}`}
                      onClick={() => handleCellClick(cell.row, cell.col)}
                      onMouseEnter={() => handleMouseEnter(cell.row, cell.col)}
                    />
                );
              })}
            </div>
          ))}
        </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 border"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 border"></div>
            <span>End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 dark:bg-slate-200 border"></div>
            <span>Wall</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 border"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 border"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 border"></div>
            <span>Path</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Algorithm Log</h3>
          <div className="h-[200px] overflow-y-auto font-mono text-sm space-y-1 bg-slate-50 dark:bg-slate-900 p-3 rounded">
            {stepLog.length === 0 ? (
              <p className="text-muted-foreground italic">Run an algorithm to see the log</p>
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
          <h3 className="text-xl font-semibold mb-4">How They Work</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">DFS (Depth-First Search):</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Uses a stack (LIFO) to explore nodes</li>
                <li>Goes deep into one path before backtracking</li>
                <li>May not find shortest path</li>
                <li>Space complexity: O(h) where h is max depth</li>
              </ul>
            </div>
            <div className="pt-2">
              <p className="font-semibold text-foreground">BFS (Breadth-First Search):</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Uses a queue (FIFO) to explore nodes</li>
                <li>Explores level by level</li>
                <li>Guarantees shortest path in unweighted graphs</li>
                <li>Space complexity: O(w) where w is max width</li>
              </ul>
            </div>
            <p className="pt-2 text-xs">
              💡 Tip: Draw walls by clicking/dragging, then watch how each algorithm explores differently!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
