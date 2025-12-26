import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import portfolioData from "@/data/portfolio.json";

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-background py-8 px-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-8">
          Work Experience
        </h1>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border"></div>

          {/* Experience items */}
          <div className="space-y-8">
            {portfolioData.experience.map((exp) => (
              <div key={exp.id} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-4 w-4 h-4 rounded-full bg-foreground border-4 border-background"></div>

                {/* Company Header */}
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-foreground">
                    {exp.company}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    📍 {exp.location}
                  </p>
                </div>

                {/* Roles within company */}
                <div className="space-y-3">
                  {exp.roles.map((role, roleIndex) => (
                    <Card key={roleIndex} className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-foreground">
                            {role.position}
                          </h3>
                        </div>
                        <Badge variant="outline" className="self-start text-xs">
                          {role.startDate} - {role.endDate}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-muted-foreground mb-3">
                        {role.description}
                      </p>

                      {role.responsibilities && role.responsibilities.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-foreground mb-1">
                            Key Responsibilities:
                          </h4>
                          <ul className="list-disc list-inside space-y-0.5">
                            {role.responsibilities.map((resp, idx) => (
                              <li key={idx} className="text-xs text-slate-600 dark:text-muted-foreground">
                                {resp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {role.skills && role.skills.length > 0 && (
                        <div>
                          <div className="flex flex-wrap gap-1.5">
                            {role.skills.map((skill, skillIdx) => (
                              <Badge key={skillIdx} variant="secondary" className="text-xs px-2 py-0.5">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}