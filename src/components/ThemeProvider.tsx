import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hue: number;
  setHue: (hue: number) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
  hue: 220,
  setHue: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );
  
  const [hue, setHue] = useState<number>(
    () => Number(localStorage.getItem("hue")) || 360
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem("hue", hue.toString());
    
    if (hue === 360) {
      // Use original default theme colors when slider is maxed out
      if (theme === "dark") {
        root.style.setProperty('--background', '224 71% 4%');
        root.style.setProperty('--card', '224 71% 4%');
        root.style.setProperty('--popover', '224 71% 4%');
        root.style.setProperty('--primary', '210 40% 98%');
        root.style.setProperty('--secondary', '222.2 47.4% 11.2%');
        root.style.setProperty('--muted', '223 47% 11%');
        root.style.setProperty('--accent', '216 34% 17%');
        root.style.setProperty('--border', '216 34% 17%');
        root.style.setProperty('--input', '216 34% 17%');
        root.style.setProperty('--ring', '216 34% 17%');
      } else {
        root.style.setProperty('--background', '0 0% 100%');
        root.style.setProperty('--card', '0 0% 100%');
        root.style.setProperty('--popover', '0 0% 100%');
        root.style.setProperty('--primary', '222.2 47.4% 11.2%');
        root.style.setProperty('--secondary', '210 40% 96.1%');
        root.style.setProperty('--muted', '210 40% 96.1%');
        root.style.setProperty('--accent', '210 40% 96.1%');
        root.style.setProperty('--border', '214.3 31.8% 91.4%');
        root.style.setProperty('--input', '214.3 31.8% 91.4%');
        root.style.setProperty('--ring', '222.2 84% 4.9%');
      }
    } else if (theme === "dark") {
      // Update CSS variables for dark mode
      root.style.setProperty('--background', `${hue} 71% 4%`);
      root.style.setProperty('--card', `${hue} 71% 4%`);
      root.style.setProperty('--popover', `${hue} 71% 4%`);
      root.style.setProperty('--primary', `${hue} 40% 98%`);
      root.style.setProperty('--secondary', `${hue} 47.4% 11.2%`);
      root.style.setProperty('--muted', `${hue} 47% 11%`);
      root.style.setProperty('--accent', `${hue} 34% 17%`);
      root.style.setProperty('--border', `${hue} 34% 17%`);
      root.style.setProperty('--input', `${hue} 34% 17%`);
      root.style.setProperty('--ring', `${hue} 34% 17%`);
    } else {
      // Update CSS variables for light mode
      root.style.setProperty('--background', `${hue} 70% 92%`);
      root.style.setProperty('--card', `${hue} 60% 95%`);
      root.style.setProperty('--popover', `${hue} 60% 95%`);
      root.style.setProperty('--primary', `${hue} 47.4% 11.2%`);
      root.style.setProperty('--secondary', `${hue} 50% 90%`);
      root.style.setProperty('--muted', `${hue} 50% 90%`);
      root.style.setProperty('--accent', `${hue} 50% 90%`);
      root.style.setProperty('--border', `${hue} 40% 85%`);
      root.style.setProperty('--input', `${hue} 40% 85%`);
      root.style.setProperty('--ring', `${hue} 84% 4.9%`);
    }
  }, [hue, theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    hue,
    setHue,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
