import { useState, type FormEvent } from 'react'
import { uploadNFT } from '../utils/upload'
import { getNextTokenId } from '../utils/contract'
import MintButton from './MintButton'
import ListButton from './ListButton'

export default function UploadNFT() {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tokenURI, setTokenURI] = useState<string | null>(null)
  const [tokenId, setTokenId] = useState<number | null>(null)
  const [isMinted, setIsMinted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setError('Select an image file first')
      return
    }

    setIsUploading(true)
    setError(null)
    setTokenURI(null)
    setIsMinted(false)

    try {
      const result = await uploadNFT(file, name, description)
      const nextTokenId = await getNextTokenId()
      setTokenURI(result)
      setTokenId(nextTokenId)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Upload NFT</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        required
      />
      <input
        type="text"
        placeholder="NFT name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload NFT'}
      </button>
      {error && <p role="alert">{error}</p>}
      {tokenURI && tokenId !== null && (
        <>
          <p>Token ID: {tokenId}</p>
          <p>Token URI: {tokenURI}</p>
          <MintButton
            tokenId={tokenId}
            tokenURI={tokenURI}
            onMinted={() => setIsMinted(true)}
          />
          <ListButton tokenId={tokenId} price={0.1} disabled={!isMinted} />
        </>
      )}
    </form>
  )
}