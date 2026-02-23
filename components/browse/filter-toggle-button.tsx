"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"

interface FilterToggleButtonProps {
  activeFilters: number
}

export function FilterToggleButton({ activeFilters }: FilterToggleButtonProps) {
  const toggleFilters = () => {
    const filterSection = document.getElementById('mobile-filters')
    if (filterSection) {
      filterSection.classList.toggle('hidden')
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="gap-2 bg-white hover:bg-gray-50" 
      onClick={toggleFilters}
    >
      <Filter className="h-4 w-4" />
      <span className="hidden sm:inline">Filters</span>
      {activeFilters > 0 && (
        <Badge variant="secondary" className="bg-[#32cd32]/10 text-[#32cd32] text-xs">
          {activeFilters}
        </Badge>
      )}
    </Button>
  )
}
