import { NewRandomWallet } from "./library/wallet";

const wallet = NewRandomWallet()

console.log(`Mnemonic: ${wallet.mnemonic.phrase}`);
console.log(`Address: ${wallet.address}`);
