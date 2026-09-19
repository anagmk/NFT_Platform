import { BrowserProvider, Contract } from 'ethers'
import MarketplaceABI from '../abis/Marketplace.json'

const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_ADDRESS

if (!marketplaceAddress) {
  throw new Error('VITE_MARKETPLACE_ADDRESS is not configured')
}

export async function listenForSales(
  onSale: (buyer: string, tokenId: bigint, price: bigint) => void
) {
  const provider = new BrowserProvider(window.ethereum!)
  const marketplace = new Contract(marketplaceAddress, MarketplaceABI.abi, provider)

  marketplace.on('Sold', (buyer, tokenId, price) => {
    onSale(buyer, tokenId, price)
  })

  return marketplace
}

export async function getPastSales() {
  const provider = new BrowserProvider(window.ethereum!)
  const marketplace = new Contract(marketplaceAddress, MarketplaceABI.abi, provider)

  return await marketplace.queryFilter(marketplace.filters.Sold())
}