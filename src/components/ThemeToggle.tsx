import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from './Button'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'istolo:theme'

function getInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === 'dark'

    root.classList.toggle('dark', isDark)
    root.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return (
    <Button onClick={toggleTheme} variant="outline" size="sm" className="gap-2 uppercase tracking-[0.2em] text-[10px] px-3">
      {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </Button>
  )
}
