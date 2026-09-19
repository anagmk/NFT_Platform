import './App.css'
import BuyButton from './components/BuyButton'
import UploadNFT from './components/UploadNFT'
import MintButton from './components/MintButton'

function App() {
  return (
    <>
      <UploadNFT />
      <BuyButton tokenId={1} price={0.1} />
      <MintButton tokenId={1} tokenURI="ipfs://bafkreidutmnwyyz57qmc2j4xieqh2jhezbqzetqe6a6ahexqja2py3xwly" />
    </>
  )
}

export default App
