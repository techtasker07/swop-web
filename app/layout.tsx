import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Swopify - Trade, Barter & Exchange Items Locally',
  description: 'Swopify is the modern marketplace for bartering and trading items and services in your local community. Swap what you have for what you need.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/swopify.ico',
        sizes: 'any',
      },
      {
        url: '/swopify.png',
        type: 'image/png',
        sizes: '32x32',
      },
    ],
    apple: '/swopify.png',
    shortcut: '/swopify.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
