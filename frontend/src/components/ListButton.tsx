import { listNFT } from '../utils/contract'
import { useState } from 'react'

interface ListButtonProps {
  tokenId: number
  price: number
  disabled?: boolean
}

export default function ListButton({ tokenId, price, disabled = false }: ListButtonProps) {
  const [isListing, setIsListing] = useState(false)

  const handleList = async () => {
    if (isListing) return

    setIsListing(true)
    try {
      await listNFT(tokenId, price)
      alert('Listing successful!')
    } catch (error) {
      console.error(error)
      alert('Listing failed')
    } finally {
      setIsListing(false)
    }
  }

  return <button onClick={handleList} disabled={isListing || disabled}>
    {isListing ? 'Listing...' : disabled ? 'Mint NFT first' : `List for ${price} ETH`}
  </button>
}