import { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainPage from './pages/MainPage';
import ResumePage from './pages/ResumePage';
import EducationPage from './pages/EducationPage';
import ExperiencePage from './pages/ExperiencePage';
import ProjectPage from './pages/ProjectPage';
import CourseProjects from './pages/CourseProjects';

function App() {
  const [activeSection, setActiveSection] = useState('main');

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  const renderPage = () => {
    switch (activeSection) {
      case 'main':
        return <MainPage />;
      case 'resume':
        return <ResumePage />;
      case 'education':
        return <EducationPage />;
      case 'experience':
        return <ExperiencePage />;
      case 'projects':
        return <ProjectPage />;
      case 'course-projects':
        return <CourseProjects />;
      default:
        return <MainPage />;
    }
  };

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen">
        <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
        <Sidebar />
        <div className="pt-16 pl-64">
          {renderPage()}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
