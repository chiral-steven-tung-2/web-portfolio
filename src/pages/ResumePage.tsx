import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import portfolioData from "@/data/portfolio.json";

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-background py-8 px-8">
      <div className="w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
            Resume/CV
          </h1>
          <Button asChild variant="default">
            <a
              href="/resume.pdf"
              download="My_Resume.pdf"
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
          </Button>
        </div>

        {/* Education Section */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-foreground mb-4 pb-2 border-b-2 border-slate-300 dark:border-border">
            Education
          </h2>
          <div className="space-y-4">
            {portfolioData.education.map((edu) => (
              <div key={edu.id} className="pl-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                    {edu.school}
                  </h3>
                  <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-muted-foreground mb-1">
                  {edu.degree}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {edu.location}
                </p>
                {edu.awards && edu.awards.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {edu.awards.map((award, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                        {award}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Work Experience Section */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-foreground mb-4 pb-2 border-b-2 border-slate-300 dark:border-border">
            Work Experience
          </h2>
          <div className="space-y-6">
            {portfolioData.experience.map((exp) => (
              <div key={exp.id} className="pl-4">
                <div className="mb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                    {exp.company}
                  </h3>
                  <p className="text-xs text-muted-foreground">{exp.location}</p>
                </div>
                <div className="space-y-3">
                  {exp.roles.map((role, roleIndex) => (
                    <div key={roleIndex} className="ml-4">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                          {role.position}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {role.startDate} - {role.endDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-muted-foreground mb-2">
                        {role.description}
                      </p>
                      {role.responsibilities && role.responsibilities.length > 0 && (
                        <ul className="list-disc list-inside space-y-0.5 mb-2">
                          {role.responsibilities.map((resp, idx) => (
                            <li key={idx} className="text-xs text-slate-600 dark:text-muted-foreground">
                              {resp}
                            </li>
                          ))}
                        </ul>
                      )}
                      {role.skills && role.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {role.skills.map((skill, skillIdx) => (
                            <Badge key={skillIdx} variant="outline" className="text-xs px-2 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-foreground mb-4 pb-2 border-b-2 border-slate-300 dark:border-border">
            Projects
          </h2>
          <div className="space-y-4">
            {portfolioData.projects.map((project) => (
              <div key={project.id} className="pl-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                    {project.title}
                  </h3>
                  {project.date && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {project.date}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-muted-foreground mb-2">
                  {project.description}
                </p>
                {project.highlights && project.highlights.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 mb-2 ml-2">
                    {project.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-muted-foreground">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {project.technologies.map((tech, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                      {tech}
                    </Badge>
                  ))}
                </div>
                {project.repository && (
                  <a
                    href={project.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    View Repository
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
