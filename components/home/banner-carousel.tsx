"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { createClient } from "@/lib/supabase/client"

interface Banner {
  id: string
  title: string
  description: string | null
  image_url: string
  link_url: string | null
  link_text: string | null
  display_order: number
}

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (error) throw error

      setBanners(data || [])
    } catch (error) {
      console.error("Error fetching banners:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length, nextSlide])

  if (isLoading) {
    return (
      <div className="relative w-full h-[120px] sm:h-[160px] md:h-[240px] lg:h-[300px] bg-gray-200 animate-pulse rounded-md sm:rounded-lg" />
    )
  }

  if (banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-full h-[120px] sm:h-[160px] md:h-[240px] lg:h-[300px] overflow-hidden rounded-md sm:rounded-lg shadow-md sm:shadow-lg md:shadow-xl group">
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentBanner.image_url}
          alt={currentBanner.title}
          fill
          className="object-cover"
          priority
        />
        
        {/* Overlay - Very strong on mobile for maximum text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40 sm:from-black/75 sm:via-black/55 md:from-black/70 md:via-black/50 md:to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center sm:items-start">
          {/* Title and Description - Compact on mobile, full on desktop */}
          <div className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-5 lg:px-8 lg:py-6 w-full">
            <div className="max-w-2xl text-white">
              <h2 className="text-sm font-bold mb-0.5 leading-tight sm:text-base sm:mb-1 md:text-2xl md:mb-2 lg:text-3xl lg:mb-3">
                {currentBanner.title}
              </h2>
              {currentBanner.description && (
                <p className="text-[10px] leading-snug text-white/90 line-clamp-2 sm:text-xs sm:line-clamp-2 md:text-sm md:line-clamp-3 lg:text-base">
                  {currentBanner.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile, visible on hover on desktop */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 sm:p-2 rounded-full hidden sm:opacity-0 sm:group-hover:opacity-100 sm:flex transition-opacity"
            aria-label="Previous banner"
          >
            <ChevronLeftIcon className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 sm:p-2 rounded-full hidden sm:opacity-0 sm:group-hover:opacity-100 sm:flex transition-opacity"
            aria-label="Next banner"
          >
            <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - Very small on mobile */}
      {banners.length > 1 && (
        <div className="absolute bottom-1.5 sm:bottom-2 md:bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-1.5 md:space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 sm:h-1.5 md:h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-4 sm:w-6 md:w-8"
                  : "bg-white/50 hover:bg-white/75 w-1 sm:w-1.5 md:w-2"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
