import { mintNFT } from '../utils/contract'

interface MintButtonProps {
  tokenId: number
  tokenURI: string
}

export default function MintButton({ tokenId, tokenURI }: MintButtonProps) {
  const handleMint = async () => {
    try {
      await mintNFT(tokenId, tokenURI)
      alert('Mint successful!')
    } catch (error) {
      console.error(error)
      alert('Mint failed')
    }
  }

  return <button onClick={handleMint}>Mint NFT</button>
}