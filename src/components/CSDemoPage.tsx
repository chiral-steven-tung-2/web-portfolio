import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DijkstraVisualization from "./algorithms/DijkstraVisualization";
import PrimVisualization from "./algorithms/PrimVisualization";
import KruskalVisualization from "./algorithms/KruskalVisualization";
import PaxosVisualization from "./algorithms/PaxosVisualization";
import PBFTVisualization from "./algorithms/PBFTVisualization";
import MazeVisualization from "./algorithms/MazeVisualization";

export default function CSDemoPage() {
  return (
    <div className="min-h-screen bg-background py-4 md:py-8 px-2 md:px-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="text-center px-2">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Algorithm Visualizations</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Interactive demonstrations of graph, search, and consensus algorithms
          </p>
        </div>

        <Tabs defaultValue="dijkstra" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="dijkstra" className="text-xs md:text-sm px-2 py-2">Dijkstra</TabsTrigger>
            <TabsTrigger value="prim" className="text-xs md:text-sm px-2 py-2">Prim</TabsTrigger>
            <TabsTrigger value="kruskal" className="text-xs md:text-sm px-2 py-2">Kruskal</TabsTrigger>
            <TabsTrigger value="maze" className="text-xs md:text-sm px-2 py-2">DFS/BFS</TabsTrigger>
            <TabsTrigger value="paxos" className="text-xs md:text-sm px-2 py-2">Paxos</TabsTrigger>
            <TabsTrigger value="pbft" className="text-xs md:text-sm px-2 py-2">PBFT</TabsTrigger>
          </TabsList>

          <TabsContent value="dijkstra">
            <DijkstraVisualization />
          </TabsContent>

          <TabsContent value="prim">
            <PrimVisualization />
          </TabsContent>

          <TabsContent value="kruskal">
            <KruskalVisualization />
          </TabsContent>

          <TabsContent value="maze">
            <MazeVisualization />
          </TabsContent>

          <TabsContent value="paxos">
            <PaxosVisualization />
          </TabsContent>

          <TabsContent value="pbft">
            <PBFTVisualization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
