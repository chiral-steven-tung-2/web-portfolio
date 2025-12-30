import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import portfolioData from "@/data/portfolio.json";

export default function EducationPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const toggleFlip = (courseId: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  // Filter and organize courses
  const organizedCourses = useMemo(() => {
    // Filter courses
    const filtered = portfolioData.courses.filter(course => {
      const courseCode = `${course.department} ${course.courseNumber}`;
      const matchesSearch = searchQuery === "" || 
        courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

    // Group by department
    const grouped = filtered.reduce((acc, course) => {
      if (!acc[course.department]) {
        acc[course.department] = [];
      }
      acc[course.department].push(course);
      return acc;
    }, {} as Record<string, typeof filtered>);

    // Sort courses within each department by course number
    Object.keys(grouped).forEach(dept => {
      grouped[dept].sort((a, b) => {
        const numA = parseInt(a.courseNumber);
        const numB = parseInt(b.courseNumber);
        return sortOrder === "asc" ? numA - numB : numB - numA;
      });
    });

    return grouped;
  }, [searchQuery, sortOrder]);

  const totalCourses = Object.values(organizedCourses).reduce((sum, courses) => sum + courses.length, 0);

  return (
    <div className="min-h-screen bg-background py-8 px-8">
      <div className="w-full space-y-12">
        {/* Education Section */}
        <section>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-8">
            Education
          </h1>
          <div className="space-y-4">
            {portfolioData.education.map((edu) => (
              <Card key={edu.id} className="p-0 overflow-hidden">
                <div className="flex">
                  {/* School Logo - Circular */}
                  <div className="w-24 h-24 flex-shrink-0 bg-accent rounded-full m-4 flex items-center justify-center overflow-hidden">
                    {edu.logo ? (
                      <img
                        src={edu.logo}
                        alt={edu.school}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-slate-500">
                        {edu.school.charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  {/* School Info */}
                  <div className="flex-1 min-w-0 p-4 pl-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
                          {edu.school}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-muted-foreground mt-1">
                          {edu.degree}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {edu.location}
                        </p>
                        {edu.awards && edu.awards.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {edu.awards.map((award, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {award}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-6">
            Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Technical Skills */}
            <Card className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">
                Technical
              </h3>
              <div className="flex flex-wrap gap-2">
                {portfolioData.skills.technical.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Frameworks */}
            <Card className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">
                Frameworks
              </h3>
              <div className="flex flex-wrap gap-2">
                {portfolioData.skills.frameworks.map((framework, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {framework}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Tools */}
            <Card className="p-5">
              <h3 className="text-lg font-semibold text-foreground mb-3 pb-2 border-b border-border">
                Tools
              </h3>
              <div className="flex flex-wrap gap-2">
                {portfolioData.skills.tools.map((tool, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tool}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Programming Languages Section */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-6">
            Programming Languages
          </h2>
          <Card className="p-6">
            <div className="flex flex-wrap gap-3 mb-4">
              {portfolioData.programmingLanguages.map((language, index) => {
                const proficiencyColors = {
                  expert: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700',
                  advanced: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700',
                  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
                  beginner: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-700'
                };
                const colorClass = proficiencyColors[language.proficiency as keyof typeof proficiencyColors] || proficiencyColors.beginner;
                return (
                  <Badge key={index} variant="outline" className={`text-base px-4 py-2 font-medium ${colorClass}`}>
                    {language.name}
                  </Badge>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Expert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">Advanced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-muted-foreground">Intermediate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-sm text-muted-foreground">Beginner</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Certifications Section */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-6">
            Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioData.certifications.map((cert, index) => (
              <Card key={index} className="p-5 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {cert.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">{cert.issuer}</p>
                <p className="text-sm text-muted-foreground">{cert.date}</p>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    View Credential →
                  </a>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Courses Section */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-6">
            Course History
          </h2>

          {/* Search and Filter - Single Row */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search by course name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              
              {/* Sort Order Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="flex items-center gap-2"
              >
                {sortOrder === "asc" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    Ascending
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                    Descending
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Course Results */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {totalCourses} course{totalCourses !== 1 ? 's' : ''}
          </div>

          {/* Courses organized by department */}
          <div className="space-y-8">
            {Object.keys(organizedCourses).sort().map((department) => (
              <div key={department}>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-foreground mb-4 flex items-center gap-2">
                  {department}
                  <Badge variant="secondary" className="text-xs">
                    {organizedCourses[department].length}
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {organizedCourses[department].map((course) => {
                    const isFlipped = flippedCards.has(course.id);
                    return (
                      <div
                        key={course.id}
                        className="h-40 cursor-pointer perspective-1000"
                        onClick={() => toggleFlip(course.id)}
                      >
                        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                          {/* Front of Card */}
                          <Card className="absolute inset-0 backface-hidden hover:shadow-md transition-shadow p-3">
                            <div className="space-y-2 h-full flex flex-col">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {course.department} {course.courseNumber}
                                </Badge>
                                {course.grade && (
                                  <Badge variant="secondary" className="text-xs">
                                    {course.grade}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground leading-tight flex-1">
                                {course.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {course.semester} {course.year}
                              </p>
                              <p className="text-xs text-muted-foreground italic">
                                Click to see description
                              </p>
                            </div>
                          </Card>
                          
                          {/* Back of Card */}
                          <Card className="absolute inset-0 backface-hidden rotate-y-180 hover:shadow-md transition-shadow p-3 bg-accent/50">
                            <div className="space-y-2 h-full flex flex-col">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {course.department} {course.courseNumber}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex-1 overflow-y-auto">
                                {course.description}
                              </p>
                              <p className="text-xs text-muted-foreground italic">
                                Click to flip back
                              </p>
                            </div>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {totalCourses === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No courses found matching your search criteria.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
