import { DefaultWeb3Service } from "./library/web3service"
import { EthToWei } from './library/utils';
import { TestWallet } from "./library/wallet";
import { Account } from "./library/account";

async function main(args: string[]) {
    let service = DefaultWeb3Service()
    let wallet = TestWallet()
    let account = new Account(wallet, service)

    let address = args[0]
    let amount = EthToWei(parseFloat(args[1]))

    let pendingTX = await account.sendEth(address, amount)

    console.log(`Transaction Hash: ${pendingTX.hash}`)

    let receipt = await pendingTX.wait()
    console.log(`Transaction confirmed in block ${receipt.blockNum}`);
    console.log(`Gas used: ${receipt.gasUsed}`)
}

const args = process.argv.slice(2);

main(args)