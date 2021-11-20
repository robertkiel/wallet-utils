import { ethers } from 'ethers'
import { LedgerSigner } from '@ethersproject/hardware-wallets'
import { HoprToken, HoprDistributor, MultiSigWallet, HoprBoost } from './types'

const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'


// console.log(PAYLOAD)

type Network = 'xDai' | 'mainnet'

function setup(network: Network): { signer: ethers.Signer; provider: ethers.providers.Provider } {
  let provider: ethers.providers.Provider
  switch (network) {
    case 'xDai':
      provider = new ethers.providers.WebSocketProvider('wss://xdai.poanetwork.dev/wss')
      break
    case 'mainnet':
      provider = new ethers.providers.InfuraProvider('homestead', '7df28ab798b848b7b5c0331f4674bb2a')
      break
  }

  const signer = new LedgerSigner(provider, 'hid', `m/44'/60'/1'/0/0`)

  return { signer, provider }
}

function getContractInstances(
  network: Network,
  signer: ethers.Signer
): { HoprToken: HoprToken; HoprDistributor: HoprDistributor; MultiSig: MultiSigWallet; HoprBoostNft: HoprBoost } {
  let HoprTokenAddress: string
  let HoprDistributorAddress: string
  let MultiSigAddress: string
  let HoprBoostNftAddress: string

  switch (network) {
    case 'mainnet':
      HoprTokenAddress = '0xf5581dfefd8fb0e4aec526be659cfab1f8c781da'
      MultiSigAddress = '0x4F50Ab4e931289344a57f2fe4bBd10546a6fdC17'
      HoprDistributorAddress = '0x'
      HoprBoostNftAddress = '0x'
      break
    case 'xDai':
      HoprTokenAddress = '0xD057604A14982FE8D88c5fC25Aac3267eA142a08'
      MultiSigAddress = '0x5e1c4e7004b7411ba27dc354330fab31147dfef1'
      HoprDistributorAddress = '0x987cb736fBfBc4a397Acd06045bf0cD9B9deFe66'
      HoprBoostNftAddress = '0x43d13D7B83607F14335cF2cB75E87dA369D056c7'
      break
  }
  const MultiSigABI = require('./abi/MultiSigWallet.json')
  const HoprDistributorABI = require('./abi/HoprDistributor.json')
  const HoprTokenABI = require('./abi/HoprToken.json')
  const HoprBoostABI = require('./abi/HoprBoost.json')

  const MultiSig = new ethers.Contract(MultiSigAddress, MultiSigABI['abi'], signer) as MultiSigWallet
  const HoprDistributor = new ethers.Contract(
    HoprDistributorAddress,
    HoprDistributorABI['abi'],
    signer
  ) as HoprDistributor
  const HoprToken = new ethers.Contract(HoprTokenAddress, HoprTokenABI['abi'], signer) as HoprToken
  const HoprBoostNft = new ethers.Contract(HoprBoostNftAddress, HoprBoostABI['abi'], signer) as HoprBoost

  return { MultiSig, HoprDistributor, HoprToken, HoprBoostNft }
}

async function main() {
  const network: Network = 'xDai'

  const { signer, provider } = setup(network)
  const { MultiSig, HoprToken, HoprBoostNft } = getContractInstances(network, signer)

  const gasPrice = await provider.getGasPrice()
  const tx = await HoprBoostNft.populateTransaction.grantRole(MINTER_ROLE, '0x273D4e93eeEf5a494206c072ffF70f6Ea7D7afC4')

  await MultiSig.submitTransaction(HoprBoostNft.address, 0, tx.data, {
    gasLimit: '500000',
    gasPrice: gasPrice
  })

  console.log('Done')
}

main()
