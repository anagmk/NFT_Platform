import { BrowserProvider, Contract, parseEther, type JsonRpcSigner } from 'ethers'
import MarketplaceABI from '../abis/Marketplace.json'
import NFTABI from '../abis/NFT.json'

const nftContractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS
const marketplaceContractAddress = import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS
const expectedChainId = BigInt(import.meta.env.VITE_CHAIN_ID || '11155111')

if (!nftContractAddress || !marketplaceContractAddress) {
    throw new Error('VITE_NFT_CONTRACT_ADDRESS and VITE_MARKETPLACE_CONTRACT_ADDRESS are required')
}

export async function connectWallet(validateMarketplace = false) {
    if (!window.ethereum) {
        alert('MetaMask not found')
        return
    }

    const provider = new BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const network = await provider.getNetwork()
    if (network.chainId !== expectedChainId) {
        throw new Error(`Wrong network. Connect MetaMask to chain ${expectedChainId}.`)
    }

    if (validateMarketplace) {
        const marketplace = new Contract(marketplaceContractAddress, MarketplaceABI.abi, provider)
        const marketplaceCode = await provider.getCode(marketplaceContractAddress)
        if (marketplaceCode === '0x') {
            throw new Error(`No marketplace contract was found at ${marketplaceContractAddress} on chain ${expectedChainId}`)
        }

        const marketplaceNftAddress = await marketplace.nftContract()
        if (marketplaceNftAddress.toLowerCase() !== nftContractAddress.toLowerCase()) {
            throw new Error('The marketplace is configured for a different NFT contract')
        }
    }

    const signer = await provider.getSigner()
    const address = await signer.getAddress()

    return { provider, signer, address }
}

export function getMarketplaceContract(signer: JsonRpcSigner) {
    return new Contract(marketplaceContractAddress, MarketplaceABI.abi, signer)
}

export async function mintNFT(tokenId: number, tokenURI: string) {
    const wallet = await connectWallet()
    if (!wallet) {
        throw new Error('Wallet connection was not established')
    }

    const nft = new Contract(nftContractAddress, NFTABI.abi, wallet.signer)
    const tx = await nft.safeMint(wallet.address, tokenId, tokenURI)

    await tx.wait()
    console.log('Mint complete!')
}

export async function listNFT(tokenId: number, priceInEth: number) {
    const wallet = await connectWallet(true)
    if (!wallet) {
        throw new Error('Wallet connection was not established')
    }

    const nft = new Contract(nftContractAddress, NFTABI.abi, wallet.signer)
    const marketplace = getMarketplaceContract(wallet.signer)
    const price = parseEther(priceInEth.toString())

    const approval = await nft.approve(marketplaceContractAddress, tokenId)
    await approval.wait()

    const listing = await marketplace.listItem(tokenId, price)
    await listing.wait()
    console.log('Listing complete!')
}

export async function buyNFT(tokenId: number, priceInEth: number) {
    const wallet = await connectWallet(true)
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