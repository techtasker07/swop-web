import { CreateListingForm } from "@/components/listings/create-listing-form"

export const metadata = {
  title: "Create Listing | Swopify",
  description: "Create a new listing to trade your items or services.",
}

export default function NewListingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Listing</h1>
        <p className="text-muted-foreground">
          List an item or service you'd like to trade with the community
        </p>
      </div>

      <CreateListingForm />
    </div>
  )
}