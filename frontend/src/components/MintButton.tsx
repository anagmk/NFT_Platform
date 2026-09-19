import { mintNFT } from '../utils/contract'
import { useState } from 'react'

interface MintButtonProps {
  tokenId: number
  tokenURI: string
}

export default function MintButton({ tokenId, tokenURI }: MintButtonProps) {
  const [isMinting, setIsMinting] = useState(false)

  const handleMint = async () => {
    if (isMinting) return

    setIsMinting(true)
    try {
      await mintNFT(tokenId, tokenURI)
      alert('Mint successful!')
    } catch (error) {
      console.error(error)
      alert('Mint failed')
    } finally {
      setIsMinting(false)
    }
  }

  return <button onClick={handleMint} disabled={isMinting}>
    {isMinting ? 'Minting...' : 'Mint NFT'}
  </button>
}