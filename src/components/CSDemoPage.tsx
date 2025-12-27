import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DijkstraVisualization from "./algorithms/DijkstraVisualization";
import PrimVisualization from "./algorithms/PrimVisualization";
import KruskalVisualization from "./algorithms/KruskalVisualization";
import PaxosVisualization from "./algorithms/PaxosVisualization";
import PBFTVisualization from "./algorithms/PBFTVisualization";
import MazeVisualization from "./algorithms/MazeVisualization";

export default function CSDemoPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Algorithm Visualizations</h1>
          <p className="text-muted-foreground">
            Interactive demonstrations of graph, search, and consensus algorithms
          </p>
        </div>

        <Tabs defaultValue="dijkstra" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="dijkstra">Dijkstra</TabsTrigger>
            <TabsTrigger value="prim">Prim</TabsTrigger>
            <TabsTrigger value="kruskal">Kruskal</TabsTrigger>
            <TabsTrigger value="maze">DFS/BFS</TabsTrigger>
            <TabsTrigger value="paxos">Paxos</TabsTrigger>
            <TabsTrigger value="pbft">PBFT</TabsTrigger>
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
