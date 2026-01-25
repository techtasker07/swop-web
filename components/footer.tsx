import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-primary/10 p-1">
                <Image
                  src="/swopify.png"
                  alt="Swopify Logo"
                  fill
                  className="object-contain rounded-md"
                />
              </div>
              <span className="text-lg font-bold text-foreground">Swopify</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The modern marketplace for bartering and trading items and services in your local community.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Marketplace</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/browse" className="hover:text-foreground">Browse Listings</Link></li>
              <li><Link href="/browse?category=electronics" className="hover:text-foreground">Electronics</Link></li>
              <li><Link href="/browse?category=furniture" className="hover:text-foreground">Furniture</Link></li>
              <li><Link href="/browse?category=services" className="hover:text-foreground">Services</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/how-it-works" className="hover:text-foreground">How It Works</Link></li>
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/safety" className="hover:text-foreground">Safety Tips</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Swopify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
