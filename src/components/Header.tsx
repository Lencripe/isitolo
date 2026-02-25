
import { Link } from 'react-router-dom'
import { WalletButton } from './WalletButton'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <img
            src="/istolo_fresh.png"
            alt="Istolo"
            className="w-9 h-9 object-contain"
          />
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
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  )
}
