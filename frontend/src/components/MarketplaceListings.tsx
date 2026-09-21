import { useEffect, useState } from 'react'
import BuyButton from './BuyButton'

interface Listing {
  tokenId: number
  seller: string
  price: string
  tokenURI?: string
  listing: boolean
  active: boolean
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function MarketplaceListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadListings = async () => {
      try {
        const response = await fetch('/api/listings')
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? 'Failed to load listings')
        setListings(result)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load listings')
      } finally {
        setIsLoading(false)
      }
    }

    loadListings()
  }, [])

  if (isLoading) return <section><h2>Marketplace</h2><p>Loading listings...</p></section>
  if (error) return <section><h2>Marketplace</h2><p role="alert">{error}</p></section>

  return (
    <section>
      <h2>Marketplace</h2>
      {listings.length === 0 ? (
        <p>No active listings.</p>
      ) : (
        <ol>
          {listings.map((item) => {
            const price = Number(item.price) / 1e18
            return (
              <li key={item.tokenId}>
                <strong>Token #{item.tokenId}</strong>
                <span>Seller: {shortenAddress(item.seller)}</span>
                {item.tokenURI && <span>Metadata: {item.tokenURI}</span>}
                <span>{price} ETH</span>
                <BuyButton
                  tokenId={item.tokenId}
                  price={price}
                  onPurchased={() => setListings((current) => current.filter((listing) => listing.tokenId !== item.tokenId))}
                />
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}