
import { Link, useLocation } from 'react-router-dom'
import { WalletButton } from './WalletButton'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20M2 12h20M7 7h10M7 10h10M7 13h10M7 16h10" />
          </svg>
          <span className="text-xl font-bold tracking-[0.3em]">ISTOLO</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition">
            Home
          </Link>
          <Link to="/shop" className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition">
            Shop
          </Link>
          <Link to="/creator/collections" className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition">
            Creator Studio
          </Link>
          {isHome && (
            <>
              <a href="#features" className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition">
                Features
              </a>
              <a href="#about" className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition">
                About
              </a>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletButton />
          <Link to="/shop">
            <Button
              variant="default"
              size="sm"
              className="uppercase tracking-[0.25em] text-xs px-5"
            >
              Shop
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
