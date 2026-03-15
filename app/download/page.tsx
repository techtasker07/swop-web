"use client"

import { useState } from "react"
import { Download, Smartphone, Shield, Zap, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DownloadPage() {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    const link = document.createElement("a")
    link.href = "/downloads/swopify-app.apk"
    link.download = "swopify-app.apk"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setDownloading(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#073232] to-[#0a4a4a] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-[#32cd32] rounded-2xl p-4 shadow-lg">
            <Smartphone className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Swopify for Android</h1>
          <p className="text-gray-300 text-sm">
            Trade smarter. Download the latest version and get automatic updates.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Shield, label: "Secure" },
            { icon: Zap, label: "Fast" },
            { icon: RefreshCw, label: "Auto-updates" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 space-y-1">
              <Icon className="h-5 w-5 text-[#32cd32] mx-auto" />
              <p className="text-white text-xs font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Install instructions */}
        <div className="bg-white/10 rounded-xl p-4 text-left space-y-2">
          <p className="text-white text-sm font-semibold">Before installing:</p>
          <ol className="text-gray-300 text-xs space-y-1 list-decimal list-inside">
            <li>Go to Settings → Security</li>
            <li>Enable "Install from unknown sources"</li>
            <li>Download and open the APK</li>
            <li>Tap Install — your data stays intact on updates</li>
          </ol>
        </div>

        {/* Download button */}
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-[#32cd32] hover:bg-[#28a428] text-white font-semibold py-4 text-base rounded-xl shadow-lg"
        >
          <Download className="h-5 w-5 mr-2" />
          {downloading ? "Starting download..." : "Download APK"}
        </Button>

        <p className="text-gray-400 text-xs">
          Android 6.0+ required. Updates install over existing version — no data loss.
        </p>
      </div>
    </div>
  )
}
