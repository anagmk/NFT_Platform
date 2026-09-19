import { useState, type FormEvent } from 'react'
import { uploadNFT } from '../utils/upload'

export default function UploadNFT() {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tokenURI, setTokenURI] = useState<string | null>(null)
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

    try {
      const result = await uploadNFT(file, name, description)
      setTokenURI(result)
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
      {tokenURI && <p>Token URI: {tokenURI}</p>}
    </form>
  )
}