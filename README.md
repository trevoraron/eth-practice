# eth-practice

Implementing ethers.js library using json rpc calls directly

Messing around with prisma to store events on the blockchain

Based on this Doc: https://blog.coinbase.com/introduction-to-building-on-defi-with-ethereum-and-usdc-part-1-ea952295a6e2

Create Wallet:
```
yarn createWallet
```

Get Balance:
```
yarn getBalance 0x13aEf5523584052915c2797295f47fD3CF69E6Cc
```

Transfer Eth:
```
yarn transferEth 0xE70f20F61f6A5a15d169745C0Abe3172A79ce5A7 .1
```

Transfer USDC:
```
yarn transferUSDC 0xDdAC089Fe56F0a9C70e6a04C74DCE52F86a91e13 1
```

Update Schema:
```
yarn prisma format
yarn prisma generate
yarn prisma migrate dev
```

View the DB:
```
yarn prisma studio
```