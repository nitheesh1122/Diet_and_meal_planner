import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeModeContext = createContext(null)

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('theme_mode') || 'light')
  useEffect(() => { localStorage.setItem('theme_mode', mode) }, [mode])
  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'))
  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode])
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
}

export const useThemeMode = () => useContext(ThemeModeContext)
