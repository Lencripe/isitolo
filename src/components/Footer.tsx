

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-16">
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
              <span className="font-bold tracking-[0.3em]">ISTOLO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium streetwear authenticated by NFC technology and secured on the Solana blockchain.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-[0.3em] text-muted-foreground">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/shop" className="hover:text-foreground transition">All Products</a></li>
              <li><a href="/shop" className="hover:text-foreground transition">New Drops</a></li>
              <li><a href="/creator/collections" className="hover:text-foreground transition">Creators</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-[0.3em] text-muted-foreground">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition">FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-[0.3em] text-muted-foreground">Technology</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-border/60" />
                <div className="h-10 w-10 rounded-full border border-border/60" />
                <div className="h-10 w-10 rounded-full border border-border/60" />
              </div>
              <p className="text-sm text-muted-foreground">Powered by Solana & NFC Technology.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Istolo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
