"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter, MapPin, DollarSign, Package, Wrench } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { formatNaira } from "@/lib/utils/currency"

const categories = [
  { name: "All Categories", slug: "", icon: Package },
  { name: "Electronics & Tech", slug: "electronics", icon: Package },
  { name: "Furniture & Home", slug: "furniture", icon: Package },
  { name: "Fashion & Clothing", slug: "clothing", icon: Package },
  { name: "Services", slug: "services", icon: Wrench },
  { name: "Vehicles & Transport", slug: "vehicles", icon: Package },
  { name: "Books & Media", slug: "books", icon: Package },
  { name: "Sports & Recreation", slug: "sports", icon: Package },
  { name: "Health & Beauty", slug: "health", icon: Package },
  { name: "Toys & Games", slug: "toys", icon: Package },
  { name: "Other", slug: "other", icon: Package },
]

const sortOptions = [
  { label: "Most Recent", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "A to Z", value: "alpha" },
  { label: "Most Popular", value: "popular" },
]

const conditions = [
  { label: "Brand New", value: "brand_new" },
  { label: "Like New", value: "like_new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Poor", value: "poor" },
]

const listingTypes = [
  { label: "Items", value: "item" },
  { label: "Services", value: "service" },
]

const locations = [
  "Lagos, Nigeria",
  "Abuja, Nigeria", 
  "Port Harcourt, Nigeria",
  "Kano, Nigeria",
  "Ibadan, Nigeria",
  "Benin City, Nigeria",
  "Kaduna, Nigeria",
]

interface BrowseFiltersProps {
  selectedCategory?: string
  searchQuery?: string
  sortBy?: string
  selectedType?: string
  selectedLocation?: string
  selectedCondition?: string
  priceMin?: string
  priceMax?: string
}

export function BrowseFilters({ 
  selectedCategory, 
  searchQuery, 
  sortBy,
  selectedType,
  selectedLocation,
  selectedCondition,
  priceMin,
  priceMax
}: BrowseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchQuery || "")
  const [priceRange, setPriceRange] = useState([
    parseInt(priceMin || "0"),
    parseInt(priceMax || "1000000")
  ])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/browse?${params.toString()}`)
  }, [router, searchParams])

  const updatePriceRange = useCallback((values: number[]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (values[0] > 0) {
      params.set("price_min", values[0].toString())
    } else {
      params.delete("price_min")
    }
    if (values[1] < 1000000) {
      params.set("price_max", values[1].toString())
    } else {
      params.delete("price_max")
    }
    router.push(`/browse?${params.toString()}`)
  }, [router, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters("search", search)
  }

  const clearFilters = () => {
    setSearch("")
    setPriceRange([0, 1000000])
    router.push("/browse")
  }

  const hasFilters = selectedCategory || searchQuery || sortBy || selectedType || 
                    selectedLocation || selectedCondition || priceMin || priceMax

  const activeFiltersCount = [
    selectedCategory,
    searchQuery,
    selectedType,
    selectedLocation,
    selectedCondition,
    priceMin || priceMax
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button 
          variant="outline" 
          className="w-full gap-2" 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      <div className={`space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Search */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for items, services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              <Button type="submit" size="default" className="px-4">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Category */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedCategory || ""}
              onValueChange={(value) => updateFilters("category", value)}
              className="space-y-3"
            >
              {categories.map((category) => {
                const IconComponent = category.icon
                return (
                  <div key={category.slug} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <RadioGroupItem value={category.slug} id={category.slug || "all"} />
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <Label 
                      htmlFor={category.slug || "all"} 
                      className="cursor-pointer text-sm font-medium flex-1"
                    >
                      {category.name}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Type */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedType || ""}
              onValueChange={(value) => updateFilters("type", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="" id="type-all" />
                <Label htmlFor="type-all" className="cursor-pointer text-sm font-medium">
                  All Types
                </Label>
              </div>
              {listingTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                  <Label 
                    htmlFor={`type-${type.value}`} 
                    className="cursor-pointer text-sm font-medium"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Condition */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedCondition || ""}
              onValueChange={(value) => updateFilters("condition", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="" id="condition-all" />
                <Label htmlFor="condition-all" className="cursor-pointer text-sm font-medium">
                  Any Condition
                </Label>
              </div>
              {conditions.map((condition) => (
                <div key={condition.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value={condition.value} id={`condition-${condition.value}`} />
                  <Label 
                    htmlFor={`condition-${condition.value}`} 
                    className="cursor-pointer text-sm font-medium"
                  >
                    {condition.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Price Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              onValueCommit={updatePriceRange}
              max={1000000}
              step={1000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatNaira(priceRange[0])}</span>
              <span>{formatNaira(priceRange[1])}</span>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedLocation || ""}
              onValueChange={(value) => updateFilters("location", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="" id="location-all" />
                <Label htmlFor="location-all" className="cursor-pointer text-sm font-medium">
                  All Locations
                </Label>
              </div>
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value={location} id={`location-${location}`} />
                  <Label 
                    htmlFor={`location-${location}`} 
                    className="cursor-pointer text-sm font-medium"
                  >
                    {location}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Sort By */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sort By</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={sortBy || "newest"}
              onValueChange={(value) => updateFilters("sort", value)}
              className="space-y-3"
            >
              {sortOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
                  <Label 
                    htmlFor={`sort-${option.value}`} 
                    className="cursor-pointer text-sm font-medium"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Clear Filters */}
        {hasFilters && (
          <Button 
            variant="outline" 
            className="w-full gap-2 bg-transparent hover:bg-destructive hover:text-destructive-foreground" 
            onClick={clearFilters}
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  )
}
