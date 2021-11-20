## Debian / Ubuntu

### USB Ledger connection

```sh
apt install build-essential git
apt install libudev-dev
```

### Setup

```sh
yarn install
yarn typechain
```

- Change main method, e.g.

```ts
async function main() {
  // ...
  const tx = await HoprBoostNft.populateTransaction.grantRole(MINTER_ROLE, '0x')

  await MultiSig.submitTransaction(HoprBoostNft.address, 0, tx.data, {
    gasLimit: '500000',
    gasPrice: gasPrice
  })
}
```
