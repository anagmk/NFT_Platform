import { listNFT } from '../utils/contract'
import { useState } from 'react'

interface ListButtonProps {
  tokenId: number
  price?: number
  disabled?: boolean
}

export default function ListButton({ tokenId, price, disabled = false }: ListButtonProps) {
  const [isListing, setIsListing] = useState(false)
  const [priceInEth, setPriceInEth] = useState(price?.toString() ?? '')

  const handleList = async () => {
    if (isListing) return

    const parsedPrice = Number(priceInEth)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      alert('Enter a listing price greater than 0 ETH')
      return
    }

    setIsListing(true)
    try {
      await listNFT(tokenId, parsedPrice)
      alert('Listing successful!')
    } catch (error) {
      console.error(error)
      alert('Listing failed')
    } finally {
      setIsListing(false)
    }
  }

  return (
    <div>
      <label>
        Price (ETH)
        <input
          type="number"
          min="0.000000000000000001"
          step="any"
          value={priceInEth}
          onChange={(event) => setPriceInEth(event.target.value)}
          disabled={isListing || disabled}
          placeholder="0.1"
        />
      </label>
      <button onClick={handleList} disabled={isListing || disabled}>
        {isListing ? 'Listing...' : disabled ? 'Mint NFT first' : 'List NFT'}
      </button>
    </div>
  )
}