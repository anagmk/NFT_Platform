import { buyNFT } from '../utils/contract'
import { useState } from 'react'

interface BuyButtonProps {
  tokenId: number
  price: number
  onPurchased?: () => void
}

export default function BuyButton({ tokenId, price, onPurchased }: BuyButtonProps) {
  const [isBuying, setIsBuying] = useState(false)

  const handleBuy = async () => {
    if (isBuying) return

    setIsBuying(true)
    try {
      await buyNFT(tokenId, price)
      onPurchased?.()
      alert('Purchase successful!')
    } catch (error) {
      console.error(error)
      alert('Purchase failed')
    } finally {
      setIsBuying(false)
    }
  }

  return <button onClick={handleBuy} disabled={isBuying}>
    {isBuying ? 'Buying...' : `Buy for ${price} ETH`}
  </button>
}