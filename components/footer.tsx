import Link from "next/link"
import Image from "next/image"
import { Twitter, Instagram, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-[#073232] via-[#084040] to-[#073232] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="grid gap-8 sm:gap-10 md:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand Section - Takes more space */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-5 text-center sm:text-left">
              <Link href="/" className="inline-flex items-center gap-3 group justify-center sm:justify-start">
                <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden bg-white/10 p-1.5 group-hover:bg-white/20 transition-colors">
                  <Image
                    src="/swopify.png"
                    alt="Swopify Logo"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white">Swopify</span>
              </Link>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-sm mx-auto sm:mx-0">
                The modern marketplace for bartering and trading items and services. Join thousands building a sustainable community through smart exchanges.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors justify-center sm:justify-start">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <a href="mailto:support@swopify.co">support@swopify.co</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors justify-center sm:justify-start">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href="tel:+2348012345678">+234 801 234 5678</a>
                </div>
                <div className="flex items-start gap-2 text-sm text-white/70 justify-center sm:justify-start">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-4">
                <p className="text-sm font-semibold text-white/90 mb-3">Follow Us</p>
                <div className="flex gap-3 justify-center sm:justify-start">
                  <a 
                    href="https://x.com/swopifyxchange" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                    aria-label="X (Twitter)"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a 
                    href="https://www.instagram.com/swopifyxchange/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-5">Marketplace</h3>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <Link href="/browse" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Browse Listings</span>
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Categories</span>
                  </Link>
                </li>
                <li>
                  <Link href="/service-coins" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Service Coins</span>
                  </Link>
                </li>
                <li>
                  <Link href="/trade-coins" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Trade Coins</span>
                  </Link>
                </li>
                <li>
                  <Link href="/time-banking" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Time Banking</span>
                  </Link>
                </li>
                <li>
                  <Link href="/b2b" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">B2B Trading</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-2 text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-5">Company</h3>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <Link href="/how-it-works" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">How It Works</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">About Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Contact</span>
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">FAQ</span>
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Blog</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="lg:col-span-2 text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-5">Support</h3>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <Link href="/help" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Help Center</span>
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Safety Tips</span>
                  </Link>
                </li>
                <li>
                  <Link href="/guidelines" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Community Guidelines</span>
                  </Link>
                </li>
                <li>
                  <Link href="/trust-safety" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Trust & Safety</span>
                  </Link>
                </li>
                <li>
                  <Link href="/report" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Report Issue</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2 text-center sm:text-left">
              <h3 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-5">Legal</h3>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Cookie Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="text-sm text-white/70 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform">Disclaimer</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p className="text-center sm:text-left">
              &copy; {currentYear} Swopify. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link href="/sitemap" className="hover:text-white transition-colors">
                Sitemap
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Accessibility
              </Link>
              <span className="text-white/40">Made with ❤️ in Nigeria</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
