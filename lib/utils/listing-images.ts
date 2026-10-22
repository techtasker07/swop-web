export type ListingImageSource = {
  url: string
  is_primary?: boolean | null
  sort_order?: number | null
  alt_text?: string | null
}

/**
 * Listings created across older and newer app versions can have photos in the
 * `images` array, `listing_images` rows, or both. Merge both sources so a
 * partially migrated listing never hides valid photos from the gallery.
 */
export function getListingImages(listing: {
  images?: string[] | null
  listing_images?: ListingImageSource[] | null
}): Required<ListingImageSource>[] {
  const tableImages = [...(listing.listing_images || [])]
    .filter((image) => Boolean(image?.url))
    .sort((first, second) => {
      if (Boolean(first.is_primary) !== Boolean(second.is_primary)) return first.is_primary ? -1 : 1
      return (first.sort_order ?? 0) - (second.sort_order ?? 0)
    })

  const legacyImages = (listing.images || []).filter(Boolean).map((url, index) => ({
    url,
    is_primary: index === 0,
    sort_order: index,
    alt_text: null,
  }))

  const uniqueImages = new Map<string, Required<ListingImageSource>>()
  for (const image of [...tableImages, ...legacyImages]) {
    if (!uniqueImages.has(image.url)) {
      uniqueImages.set(image.url, {
        url: image.url,
        is_primary: Boolean(image.is_primary),
        sort_order: image.sort_order ?? uniqueImages.size,
        alt_text: image.alt_text ?? "",
      })
    }
  }

  return [...uniqueImages.values()]
}
