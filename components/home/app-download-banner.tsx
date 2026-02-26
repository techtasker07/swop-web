"use client"

import { Smartphone, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function AppDownloadBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Auto-hide after 20 seconds
    const timer = setTimeout(() => {
      handleClose()
    }, 20000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 500) // Match animation duration
  }

  const handleDownload = () => {
    // Use the local APK file from public/downloads folder
    const downloadUrl = "/downloads/swopify-app.apk"
    
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'swopify-app.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isVisible) return null

  return (
    <div 
      className={`w-full bg-gradient-to-r from-[#32cd32] to-[#28a428] shadow-md overflow-hidden transition-all duration-500 ease-in-out ${
        isAnimating ? 'max-h-0 opacity-0 transform -translate-y-full' : 'max-h-20 opacity-100 transform translate-y-0'
      }`}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          {/* Left side - Icon and text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 bg-white/20 rounded-full p-2">
              <Smartphone className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-white truncate">
              Get the Swopify mobile app for a better experience
            </p>
          </div>

          {/* Right side - Download button and close */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-white text-[#073232] hover:bg-white/90 shadow-md flex-shrink-0 font-semibold"
            >
              <Download className="h-4 w-4 mr-2" />
              Download App
            </Button>
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Close banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { AppDownloadBanner as default }
