import { DefaultWeb3Service } from "./library/web3service"
import { TestWallet } from "./library/wallet";
import { Account } from "./library/account";
import { Contract } from "./library/contract";

async function main(args: string[]) {
    let service = DefaultWeb3Service()
    let wallet = TestWallet()
    let account = new Account(wallet, service)

    const usdc = new Contract(
        "0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4",
        [
            "function balanceOf(address _owner) public view returns (uint256 balance)",
            "function transfer(address _to, uint256 _value) public returns (bool success)",
        ],
        account
    )


    let address = args[0]
    let amount = parseInt(args[1]) * 1e6

    console.log('Checking Balance')
    let result = await usdc.call("balanceOf", wallet.address)
    if(parseInt(result) < amount) {
        throw new Error("not enough USDC")
    }
    console.log('Confirmed enough funds')


    let pendingTX = await usdc.sendTransaction("transfer", address, amount)

    console.log(`Transaction Hash: ${pendingTX.hash}`)

    let receipt = await pendingTX.wait()
    console.log(`Transaction confirmed in block ${receipt.blockNum}`);
    console.log(`Gas used: ${receipt.gasUsed}`)
}

const args = process.argv.slice(2);

main(args)