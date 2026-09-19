import { useEffect } from 'react'
import { listenForSales } from '../utils/events'

export default function MarketplaceListings() {
  useEffect(() => {
    let contractInstance: any

    const setup = async () => {
      contractInstance = await listenForSales((buyer, tokenId, price) => {
        console.log('New sale:', buyer, tokenId, price)
      })
    }

    setup()

    return () => {
      if (contractInstance) contractInstance.removeAllListeners('Sold')
    }
  }, [])

  return <div>{/* your listings UI */}</div>
}