import { ethers, BigNumber } from 'ethers'
import { LedgerSigner } from '@ethersproject/hardware-wallets'
import { HoprToken, HoprDistributor, MultiSigWallet, HoprBoost, USDT, USDC, HoprStake } from './types'
import { accounts, values } from './data'

const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'
const DISTRIBUTOR_MAX_PERCENT = 10 ** 6

// console.log(PAYLOAD)

type Network = 'xDai' | 'mainnet'

type Setup = { signer?: ethers.Signer; provider: ethers.providers.Provider }

function setup(network: Network, withSigner: boolean = true): Setup {
  let provider: ethers.providers.Provider
  switch (network) {
    case 'xDai':
      provider = new ethers.providers.WebSocketProvider('wss://xdai.poanetwork.dev/wss')
      break
    case 'mainnet':
      provider = new ethers.providers.InfuraProvider('homestead', '7df28ab798b848b7b5c0331f4674bb2a')
      break
  }

  let result: Setup = { provider } as any

  if (withSigner) {
    result.signer = new LedgerSigner(provider, 'hid', `m/44'/60'/1'/0/0`)
  }

  return result
}

function getContractInstances(
  network: Network,
  signer?: ethers.Signer | ethers.providers.Provider
): {
  HoprToken: HoprToken
  HoprDistributor?: HoprDistributor
  MultiSig: MultiSigWallet
  HoprBoostNft?: HoprBoost
  USDT?: USDT
  USDC?: USDC
  HoprStake?: HoprStake
} {
  let HoprTokenAddress: string
  let HoprDistributorAddress: string
  let MultiSigAddress: string
  let HoprBoostNftAddress: string
  let USDTAddress: string
  let USDCAddress: string
  let HoprStakeAddress: string

  switch (network) {
    case 'mainnet':
      HoprTokenAddress = '0xf5581dfefd8fb0e4aec526be659cfab1f8c781da'
      MultiSigAddress = '0x4F50Ab4e931289344a57f2fe4bBd10546a6fdC17'
      HoprDistributorAddress = '0x0736F69a12882C33aaD39069F434FBbd085f9899'
      // HoprBoostNftAddress = '0x'
      USDTAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
      USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      break
    case 'xDai':
      HoprStakeAddress = '0x912f4d6607160256787a2ad40da098ac2afe57ac'
      HoprTokenAddress = '0xD057604A14982FE8D88c5fC25Aac3267eA142a08'
      MultiSigAddress = '0x5e1c4e7004b7411ba27dc354330fab31147dfef1'
      HoprDistributorAddress = '0x987cb736fBfBc4a397Acd06045bf0cD9B9deFe66'
      HoprBoostNftAddress = '0x43d13D7B83607F14335cF2cB75E87dA369D056c7'
      // USDTAddress = '0x'
      break
  }
  const MultiSigABI = require('./abi/MultiSigWallet.json')
  const HoprDistributorABI = require('./abi/HoprDistributor.json')
  const HoprTokenABI = require('./abi/HoprToken.json')
  const HoprBoostABI = require('./abi/HoprBoost.json')
  const USDTABI = require('./abi/USDT.json')
  const HoprStakeABI = require('./abi/HoprStake.json')

  const MultiSig = new ethers.Contract(MultiSigAddress, MultiSigABI['abi'], signer) as MultiSigWallet
  let HoprDistributor: HoprDistributor
  if (HoprDistributorAddress) {
    HoprDistributor = new ethers.Contract(HoprDistributorAddress, HoprDistributorABI['abi'], signer) as HoprDistributor
  }

  const HoprToken = new ethers.Contract(HoprTokenAddress, HoprTokenABI['abi'], signer) as HoprToken

  let HoprBoostNft: HoprBoost
  if (HoprBoostNftAddress) {
    HoprBoostNft = new ethers.Contract(HoprBoostNftAddress, HoprBoostABI['abi'], signer) as HoprBoost
  }

  let USDT: USDT
  if (USDTAddress) {
    USDT = new ethers.Contract(USDTAddress, USDTABI['abi'], signer) as USDT
  }

  let USDC: USDC
  if (USDCAddress) {
    USDC = new ethers.Contract(USDCAddress, USDTABI['abi'], signer) as USDC
  }

  let HoprStake: HoprStake
  if (HoprStakeAddress) {
    HoprStake = new ethers.Contract(HoprStakeAddress, HoprStakeABI['abi'], signer) as HoprStake
  }

  return { MultiSig, HoprDistributor, HoprToken, HoprBoostNft, USDT, USDC, HoprStake }
}

function printMethodABI(tx: ethers.PopulatedTransaction, describtion: string) {
  console.log(describtion)
  console.log('Identifier:', tx.data.slice(2, 2 + 8))
  let index = 0
  for (let i = 10; i < tx.data.length; i += 64) {
    console.log(`Argument ${index}:`, tx.data.slice(i, i + 64))
    index++
  }
}

function preProcessAllocations(): { cleanAccounts: string[]; cleanValues: string[] } {
  let accountSet = new Set<string>()

  let cleanAccounts: string[] = []
  let cleanValues: string[] = []

  let duplicates: string[] = []

  for (const account of accounts) {
    if (!accountSet.has(account)) {
      accountSet.add(account)
    } else {
      duplicates.push(account)
    }
  }

  for (const [index, account] of accounts.entries()) {
    if (!duplicates.includes(account)) {
      cleanAccounts.push(account)
      cleanValues.push(values[index])
    } else {
      console.log(account)
    }
  }

  return { cleanAccounts, cleanValues }
}

async function main() {
  // const { cleanValues, cleanAccounts } = preProcessAllocations()
  const network: Network = 'xDai'
  const withSigner = true

  const { signer, provider } = setup(network, withSigner)

  const { MultiSig, HoprToken, HoprBoostNft, HoprDistributor, USDT, USDC, HoprStake } = getContractInstances(network, withSigner ? signer : provider)

  const Contract = HoprStake

  // const computed = await HoprToken.populateTransaction.transfer(
  //   '0xd7682ef1180f5fc496cf6981e4854738a57c593e'
  // , 5n * 10n**(18n+ 6n))

  // console.log(await HoprToken.decimals())
  // printMethodABI(computed, `transferOwnership('0xd7682ef1180f5fc496cf6981e4854738a57c593e')`)

  // const mstx = await MultiSig.transactions(78)

  // console.log(`MS Tx:\n`, mstx.data)

  // await MultiSig.confirmTransaction(78, {
  //   gasLimit: '500000'
  // })
  // const gasPrice = await provider.getGasPrice()

  // const price = ethers.BigNumber.from(`0xdf8475800`)

  // console.log(gasPrice, gasPrice.toNumber())
  // // console.log('decimals', await HoprToken.decimals())

  // console.log(BigNumber.from('0x16e0223b7e8b1d000000'))

  // const onchainTx = await MultiSig.transactions(74)
  // console.log(`on-chain\n`, onchainTx.data)
  // console.log(`computed\n`, computed.data)

 

  // console.log(mstx.data)
  // (Contract.address, 0, tx.data, )

  // console.log(mstx.data)

  console.log('Done')
}

main()
