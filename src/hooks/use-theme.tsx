import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Tema = "dark" | "light";

const CHAVE = "nba-props-analyzer:tema";

interface ThemeContextValue {
  tema: Tema;
  alternarTema: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ tema: "dark", alternarTema: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>("dark");

  useEffect(() => {
    const salvo = window.localStorage.getItem(CHAVE) as Tema | null;
    if (salvo === "light" || salvo === "dark") setTema(salvo);
  }, []);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.toggle("dark", tema === "dark");
    raiz.style.colorScheme = tema;
    window.localStorage.setItem(CHAVE, tema);
  }, [tema]);

  return (
    <ThemeContext.Provider
      value={{ tema, alternarTema: () => setTema((atual) => (atual === "dark" ? "light" : "dark")) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
