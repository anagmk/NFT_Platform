import './App.css'
import BuyButton from './components/BuyButton'
import UploadNFT from './components/UploadNFT'

function App() {
  return (
    <>
      <UploadNFT />
      <BuyButton tokenId={1} price={0.1} />
    </>
  )
}

export default App
