import { buyNFT } from '../utils/contract'

interface BuyButtonProps {
  tokenId: number
  price: number
}

export default function BuyButton({ tokenId, price }: BuyButtonProps) {
  const handleBuy = async () => {
    try {
      await buyNFT(tokenId, price)
      alert('Purchase successful!')
    } catch (error) {
      console.error(error)
      alert('Purchase failed')
    }
  }

  return <button onClick={handleBuy}>Buy for {price} ETH</button>
}