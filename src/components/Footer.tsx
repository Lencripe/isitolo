

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-16">
      <div className="container max-w-7xl px-4 mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M2 12h20M7 7h10M7 10h10M7 13h10M7 16h10" />
              </svg>
              <span className="font-bold">Istolo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              On-demand printing powered by Solana blockchain.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Products</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">Metal Prints</a></li>
              <li><a href="#" className="hover:text-foreground transition">Paper Prints</a></li>
              <li><a href="#" className="hover:text-foreground transition">Canvas</a></li>
              <li><a href="#" className="hover:text-foreground transition">Merchandise</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition">API</a></li>
              <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition">FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">About</a></li>
              <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Istolo. All rights reserved. Powered by Solana.
          </p>
        </div>
      </div>
    </footer>
  )
}
