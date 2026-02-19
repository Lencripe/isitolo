
import { Link, useLocation } from 'react-router-dom'
import { WalletButton } from './WalletButton'
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
      "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
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
          <span className="text-xl font-bold">Istolo</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium hover:text-primary transition">
            Home
          </Link>
          <Link to="/shop" className="text-sm font-medium hover:text-primary transition">
            Shop
          </Link>
          {isHome && (
            <>
              <a href="#features" className="text-sm font-medium hover:text-primary transition">
                Features
              </a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition">
                About
              </a>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <WalletButton />
          <Link to="/shop">
            <Button variant="default" size="sm">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
