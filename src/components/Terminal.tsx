import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import portfolioData from "@/data/portfolio.json";

interface TerminalLine {
  type: "input" | "output" | "error";
  content: string;
}

export default function Terminal() {
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      type: "output",
      content: "Welcome to Steven's Interactive Portfolio Terminal v1.0.0",
    },
    {
      type: "output",
      content: 'Type "help" to see available commands.',
    },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const commands: { [key: string]: (args?: string) => string | string[] } = {
    help: () => [
      "Available commands:",
      "  help           - Show this help message",
      "  about          - Learn about me",
      "  whoami         - Display my name and title",
      "  skills         - List my technical skills",
      "  languages      - Show programming languages I know",
      "  education      - Display my educational background",
      "  experience     - Show my work experience",
      "  projects       - List my projects",
      "  contact        - Get my contact information",
      "  interests      - Show my interests",
      "  clear          - Clear the terminal",
      "  neofetch       - Display system info (fun!)",
      "  ls             - List available sections",
      "  cat [section]  - Display detailed info (e.g., cat skills)",
    ],
    about: () => portfolioData.personal.aboutMe,
    whoami: () => `${portfolioData.personal.name} - Computer Science Student @ ${portfolioData.personal.school}`,
    skills: () => [
      "Technical Skills:",
      ...portfolioData.skills.technical.map((skill) => `  • ${skill}`),
      "",
      "Frameworks:",
      ...portfolioData.skills.frameworks.map((fw) => `  • ${fw}`),
      "",
      "Tools:",
      ...portfolioData.skills.tools.map((tool) => `  • ${tool}`),
    ],
    languages: () => [
      "Programming Languages:",
      ...portfolioData.programmingLanguages.map((lang) => `  • ${lang}`),
    ],
    education: () =>
      portfolioData.education.map(
        (edu) =>
          `${edu.degree}\n${edu.school} (${edu.startDate} - ${edu.endDate})\nAwards: ${edu.awards.join(", ")}`
      ),
    experience: () =>
      portfolioData.experience.flatMap((exp) =>
        exp.roles.map(
          (role) =>
            `${role.position} @ ${exp.company}\n${role.startDate} - ${role.endDate}\n${role.description}`
        )
      ),
    projects: () => [
      "My Projects:",
      ...portfolioData.projects.map(
        (project) => `  [${project.date}] ${project.title}\n  ${project.description}\n  Tech: ${project.technologies.join(", ")}`
      ),
    ],
    contact: () => [
      "Contact Information:",
      ...portfolioData.personal.socialLinks.map(
        (link) => `  ${link.name}: ${link.url}`
      ),
    ],
    interests: () => [
      "Interests:",
      ...portfolioData.personal.interests.map((interest) => `  • ${interest}`),
    ],
    clear: () => {
      setHistory([]);
      return "";
    },
    neofetch: () => [
      "                   ",
      "      ____         steven@portfolio",
      "     / __/___      ─────────────────",
      "    _\\ \\/ _ \\      OS: Web Portfolio v1.0",
      "   /___/\\___/      Host: Your Browser",
      "                   Shell: interactive-terminal",
      "                   Terminal: portfolio-term",
      `                   Name: ${portfolioData.personal.name}`,
      `                   School: ${portfolioData.personal.school}`,
      `                   Skills: ${portfolioData.programmingLanguages.length} languages`,
      `                   Projects: ${portfolioData.projects.length} major projects`,
      "                   Theme: CS Student",
      "",
    ],
    ls: () => [
      "about.txt",
      "skills.md",
      "education.json",
      "experience.log",
      "projects/",
      "contact.info",
      "README.md",
    ],
    cat: (args?: string) => {
      if (!args) return "Usage: cat [section]\nAvailable sections: skills, about, contact, interests";
      
      const section = args.toLowerCase();
      switch (section) {
        case "skills":
          return commands.skills();
        case "about":
          return commands.about();
        case "contact":
          return commands.contact();
        case "interests":
          return commands.interests();
        case "readme":
        case "readme.md":
          return [
            "# Steven Tung - Portfolio",
            "",
            portfolioData.personal.briefDescription,
            "",
            `## Quick Stats`,
            `- 🎓 ${portfolioData.education.length} Degrees`,
            `- 💼 ${portfolioData.experience.length} Companies`,
            `- 🚀 ${portfolioData.projects.length} Projects`,
            `- 💻 ${portfolioData.programmingLanguages.length} Languages`,
            "",
            'Type "help" for available commands.',
          ];
        default:
          return `cat: ${args}: No such file or directory`;
      }
    },
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    const [command, ...args] = trimmedCmd.split(" ");
    const commandLower = command.toLowerCase();

    setHistory((prev) => [
      ...prev,
      { type: "input", content: `$ ${trimmedCmd}` },
    ]);

    if (commandLower in commands) {
      const result = commands[commandLower](args.join(" "));
      if (result) {
        const output = Array.isArray(result) ? result : [result];
        setHistory((prev) => [
          ...prev,
          ...output.map((line) => ({ type: "output" as const, content: line })),
        ]);
      }
    } else {
      setHistory((prev) => [
        ...prev,
        {
          type: "error",
          content: `Command not found: ${command}. Type "help" for available commands.`,
        },
      ]);
    }

    setCommandHistory((prev) => [...prev, trimmedCmd]);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <Card
      className="w-full font-mono text-sm bg-slate-950 dark:bg-slate-950 border-slate-700 overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-slate-400 text-xs ml-2">
          steven@portfolio: ~
        </span>
      </div>

      <div className="p-4 h-[500px] overflow-y-auto">
        {history.map((line, index) => (
          <div key={index} className="mb-1">
            {line.type === "input" ? (
              <div className="text-green-400">{line.content}</div>
            ) : line.type === "error" ? (
              <div className="text-red-400">{line.content}</div>
            ) : (
              <div className="text-slate-300">{line.content}</div>
            )}
          </div>
        ))}

        <div className="flex items-center gap-2">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-slate-300 caret-green-400"
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </Card>
  );
}
