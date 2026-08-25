"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { applyTheme, getPreferredTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const initial = getPreferredTheme();
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (next) => {
        setThemeState(next);
        applyTheme(next);
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      },
      toggleTheme: () => {
        const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
        const next = current === "dark" ? "light" : "dark";
        setThemeState(next);
        applyTheme(next);
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
