import { Card } from "@/components/ui/card";
import portfolioData from "@/data/portfolio.json";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background py-8 px-8">
      <div className="w-full space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-foreground mb-4">
            {portfolioData.personal.name}
          </h1>
          <p className="text-lg text-slate-600 dark:text-muted-foreground">
            {portfolioData.personal.school}
          </p>
        </section>

        {/* About Me Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-4">
            About Me
          </h2>
          <Card className="p-6">
            <p className="text-base text-slate-600 dark:text-muted-foreground leading-relaxed">
              {portfolioData.personal.aboutMe}
            </p>
          </Card>
        </section>

        {/* Interests Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-4">
            Interests
          </h2>
          <Card className="p-6">
            <p className="text-base text-slate-600 dark:text-muted-foreground leading-relaxed">
              {portfolioData.personal.interests.join(", ")}
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}