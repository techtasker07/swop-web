import { User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function AuthorCard({ author }: { author: string }) {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#32cd32] to-[#073232] flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Author</p>
            <p className="font-semibold text-[#073232] text-sm truncate">{author}</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
          Insights from the Swopify team.
        </p>
      </CardContent>
    </Card>
  )
}
