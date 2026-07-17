"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Dark mode system — toggle global de tema.
 * Persiste en localStorage. Aplica clase `theme-site-dark` al <html>.
 * NO usa next-themes (que afectaría el theme flip de la sección cinética).
 * El theme flip de KineticSection usa body.theme-dark y es independiente.
 *
 * P5: DEFAULT OSCURO. La página arranca en dark mode (navy #0e0e10).
 * El usuario puede togglear a claro; la preferencia se persiste.
 */

type Theme = "light" | "dark";

const STORAGE_KEY = "rogelio-portfolio-theme";

function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  // Default: DARK (la identidad del sitio ahora es oscura)
  return "dark";
}

function setTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  notifySubs();
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === "dark") {
    html.classList.add("theme-site-dark");
  } else {
    html.classList.remove("theme-site-dark");
  }
}

// Store externo para useSyncExternalStore
const subs = new Set<() => void>();
function subscribe(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}
function notifySubs() {
  subs.forEach((cb) => cb());
}
function getSnapshot(): Theme {
  return getTheme();
}
function getServerSnapshot(): Theme {
  // SSR devuelve dark para coherencia con el default
  return "dark";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Aplica el theme al montar (para hidratación correcta)
  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  return {
    theme,
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
    setDark: () => setTheme("dark"),
    setLight: () => setTheme("light"),
  };
}

// Script inline para evitar FOUC — se ejecuta antes que React.
// P5: aplica dark por defecto si no hay preferencia guardada.
export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t === 'light') {
      // explícitamente claro: no añadimos la clase
    } else {
      // default o dark explícito → modo oscuro
      document.documentElement.classList.add('theme-site-dark');
    }
  } catch(e){
    document.documentElement.classList.add('theme-site-dark');
  }
})();
`;
