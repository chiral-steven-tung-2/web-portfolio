import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import portfolioData from "@/data/portfolio.json";

export default function ProjectPage() {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const toggleFlip = (projectId: number) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background py-8 px-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-8">
          Projects
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioData.projects.map((project) => {
            const isFlipped = flippedCards.has(project.id);
            return (
              <div key={project.id} className="h-80">
                <div
                  className="relative w-full h-full cursor-pointer preserve-3d"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.6s",
                  }}
                  onClick={() => toggleFlip(project.id)}
                >
                  {/* Front of card */}
                  <Card className="absolute inset-0 p-5 flex flex-col backface-hidden">
                    {/* Header with title and date */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex-1">
                        {project.title}
                      </h3>
                      {project.date && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {project.date}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-muted-foreground mb-4 flex-1 overflow-y-auto">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Repository link */}
                    <div className="flex items-center justify-between">
                      {project.repository && (
                        <Button
                          variant="link"
                          asChild
                          className="p-0 h-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={project.repository}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            View Repository
                          </a>
                        </Button>
                      )}
                      {project.highlights && project.highlights.length > 0 && (
                        <span className="text-xs text-muted-foreground italic">
                          Click to see highlights
                        </span>
                      )}
                    </div>
                  </Card>

                  {/* Back of card */}
                  {project.highlights && project.highlights.length > 0 && (
                    <Card className="absolute inset-0 p-5 flex flex-col backface-hidden rotate-y-180">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex-1">
                          {project.title}
                        </h3>
                        {project.date && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {project.date}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground mb-3">
                          Key Highlights:
                        </h4>
                        <ul className="list-disc list-inside space-y-2">
                          {project.highlights.map((highlight, idx) => (
                            <li key={idx} className="text-sm text-slate-600 dark:text-muted-foreground">
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-border">
                        <span className="text-xs text-muted-foreground italic">
                          Click to see description
                        </span>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
