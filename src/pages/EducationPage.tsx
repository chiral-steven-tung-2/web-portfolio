import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import portfolioData from "@/data/portfolio.json";

export default function EducationPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

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

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(portfolioData.courses.map(course => course.department));
    return ["All", ...Array.from(depts).sort()];
  }, []);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return portfolioData.courses.filter(course => {
      const matchesDepartment = selectedDepartment === "All" || course.department === selectedDepartment;
      const courseCode = `${course.department} ${course.courseNumber}`;
      const matchesSearch = searchQuery === "" || 
        courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesDepartment && matchesSearch;
    });
  }, [selectedDepartment, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background py-8 px-8">
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
                  <div className="w-24 h-24 flex-shrink-0 bg-slate-200 dark:bg-accent rounded-full m-4 flex items-center justify-center overflow-hidden">
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

        {/* Courses Section */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-6">
            Courses Taken
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
              
              {/* Department Filter */}
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <Button
                    key={dept}
                    variant={selectedDepartment === dept ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDepartment(dept)}
                  >
                    {dept}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Course Results */}
          <div className="mb-2 text-sm text-muted-foreground">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCourses.map((course) => {
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
                        {/* <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground leading-tight">
                          Description
                        </h3> */}
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

          {filteredCourses.length === 0 && (
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
