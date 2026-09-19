import { BrowserProvider, Contract, parseEther, type JsonRpcSigner } from 'ethers'
import MarketplaceABI from '../abis/Marketplace.json'
import NFTABI from '../abis/NFT.json'

const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS
const nftAddress = import.meta.env.VITE_NFT_ADDRESS

if (!marketplaceAddress) {
    throw new Error('VITE_MARKETPLACE_ADDRESS is not configured')
}

if (!nftAddress) {
    throw new Error('VITE_NFT_ADDRESS is not configured')
}

export async function connectWallet() {
    if (!window.ethereum) {
        alert('MetaMask not found')
        return
    }

    const provider = new BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = await provider.getSigner()
    const address = await signer.getAddress()

    return { provider, signer, address }
}

export function getMarketplaceContract(signer: JsonRpcSigner) {
    return new Contract(marketplaceAddress, MarketplaceABI.abi, signer)
}

export async function mintNFT(tokenId: number, tokenURI: string) {
    const wallet = await connectWallet()
    if (!wallet) {
        throw new Error('Wallet connection was not established')
    }

    const nft = new Contract(nftAddress, NFTABI.abi, wallet.signer)
    const tx = await nft.safeMint(wallet.address, tokenId, tokenURI)

    await tx.wait()
    console.log('Mint complete!')
}

export async function buyNFT(tokenId: number, priceInEth: number) {
    const wallet = await connectWallet()
    if (!wallet) {
        throw new Error('Wallet connection was not established')
    }

    const marketplace = getMarketplaceContract(wallet.signer)
    const tx = await marketplace.buyItem(tokenId, {
        value: parseEther(priceInEth.toString()),
    })

    await tx.wait()
    console.log('Purchase complete!')
}