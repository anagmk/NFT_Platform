export async function uploadNFT(file: File, name: string, description: string) {
    const formData = new FormData()
    formData.append('file', file)

    const fileRes = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData,
    })
    const fileBody = await fileRes.json()
    if (!fileRes.ok) {
        throw new Error(fileBody.error ?? 'File upload failed')
    }

    const metaRes = await fetch('/api/upload/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, imageCid: fileBody.cid }),
    })
    const metaBody = await metaRes.json()
    if (!metaRes.ok) {
        throw new Error(metaBody.error ?? 'Metadata upload failed')
    }

    return metaBody.tokenURI as string
}