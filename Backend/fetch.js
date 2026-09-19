const { PinataSDK } = require("pinata")
require("dotenv").config()

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
})

async function main() {
  try {
    const file = await pinata.gateways.public.get("bafkreigntueuvlly4c46jng2ssnjggufd2khvcqmzomkflaog2ulmcgtsa")
    console.log(file.data)
  } catch (error) {
    console.log(error);
  }
}

main()