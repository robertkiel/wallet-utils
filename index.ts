import { ethers } from 'ethers'
import { LedgerSigner } from '@ethersproject/hardware-wallets'

const TETHER = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const UNISWAP_ROUTER = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'
const CURVE_USDT_ROUTER = '0x52ea46506b9cc5ef470c5bf89f17dc28bb35d85c'
const ROBERT = '0x93bC372b4cC142dA75a365C5cB45be996347bfeC'

const ADDRESS = CURVE_USDT_ROUTER

//const Balance = '0x' + Number(1e18).toString(16).padStart(64, '0')

const BALANCE = '0x' + Number(0e18).toString(16).padStart(64, '0')

// const WORDS = [
//   '095ea7b3', // approve()
//   '0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d', // UniSwap Router
//   '00000000000000000000000000000000000000000000000000000002540be400' // Number(10000e6).toString(16).padStart(64, '0') == 10k USDT
// ]

// const WORDS = [
//   '095ea7b3', // approve()
//   '00000000000000000000000052ea46506b9cc5ef470c5bf89f17dc28bb35d85c', // Curve USDT Router
//   '000000000000000000000000000000000000000000000000000000174876e800' // Number(100000e6).toString(16).padStart(64, '0') == 100k USDT
// ]

const WORDS = [
  'a6417ed6', // exchange_underlying
  '0000000000000000000000000000000000000000000000000000000000000002', // (token ID 2 = USDT)
  '0000000000000000000000000000000000000000000000000000000000000001', // (token ID 1 = USDC)
  '000000000000000000000000000000000000000000000000000000174876e800', // (amount to spend in USDT) Number(100000e6).toString(16).padStart(64, '0') == 100k USDT
  '000000000000000000000000000000000000000000000000000000170cdc1e00' // (minimal amount to receive in DAI) Number(99000e6).toString(16)
]

// const WORDS = [
//   '18cbafe5', // swapExactTokensForETH
//   '00000000000000000000000000000000000000000000000000000002540be400', // Number(10000e6).toString(16).padStart(64, '0') == 10k USDT
//   '0000000000000000000000000000000000000000000000004bb2703105674800', // Number((10000 / 1400) * 1e18 * 0.9).toString(16).padStart(64, '0') == 7.14 ETH OutMin
//   '00000000000000000000000000000000000000000000000000000000000000a0', // arr length
//   '0000000000000000000000004f50ab4e931289344a57f2fe4bbd10546a6fdc17', // MultiSig address
//   '0000000000000000000000000000000000000000000000000000000060375e4e', // Number(Math.floor(1614111849618 / 1000 + 24 * 3600 * 0.5)).toString(16).padStart(64, '0') == 12 hours from 1614111849618
//   '0000000000000000000000000000000000000000000000000000000000000002', // arr length
//   '000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7', // USDT
//   '000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // WETH
// ]

const PAYLOAD = '0x' + WORDS.join('')

console.log(PAYLOAD)

type Network = 'xDai' | 'mainnet'

function setup(network: Network): { signer: ethers.Signer } {
  let provider: ethers.providers.Provider
  switch (network) {
    case 'xDai':
      provider = new ethers.providers.WebSocketProvider('wss://rpc.xdaichain.com/wss')
    case 'mainnet':
      provider = new ethers.providers.InfuraProvider('homestead', '7df28ab798b848b7b5c0331f4674bb2a')
  }

  const signer = new LedgerSigner(provider, 'hid', `m/44'/60'/1'/0/0`)

  return { signer }
}

function getContractInstances(network: Network, signer: ethers.Signer) {
  let HoprTokenAddress: string
  let HoprDistributorAddress: string
  let MultiSigAddress: string
  switch (network) {
    case 'mainnet':
      HoprTokenAddress = '0xf5581dfefd8fb0e4aec526be659cfab1f8c781da'
      MultiSigAddress = '0x4F50Ab4e931289344a57f2fe4bBd10546a6fdC17'
      HoprDistributorAddress = '0x'
    case 'xDai':
      HoprTokenAddress = '0xD057604A14982FE8D88c5fC25Aac3267eA142a08'
      MultiSigAddress = '0x5e1c4e7004b7411ba27dc354330fab31147dfef1'
      HoprDistributorAddress = '0x987cb736fBfBc4a397Acd06045bf0cD9B9deFe66'
  }
  const MultiSigABI = require('./bin/contracts/MultiSigWallet.json')
  const HoprDistributorABI = require('./bin/contracts/HoprDistributor.json')
  const HoprTokenABI = require('./bin/contracts/HoprToken.json')

  const MultiSig = new ethers.Contract(MultiSigAddress, MultiSigABI['abi'], signer)

}

async function main() {
  const network: Network = 'xDai'

  const { signer } = setup(network)
  getContractInstances(network, signer)


  // await MultiSig.submitTransaction(ADDRESS, BALANCE, PAYLOAD).

  console.log(await signer.getAddress())
}

main()
