import { DefaultWeb3Service } from "./library/web3service"
import { TestWallet } from "./library/wallet";
import { Account } from "./library/account";
import { Contract } from "./library/contract";

async function main() {
    let service = DefaultWeb3Service()
    let wallet = TestWallet()
    let account = new Account(wallet, service)

    const usdc = new Contract(
        "0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4",
        [
            "function balanceOf(address _owner) public view returns (uint256 balance)",
        ],
        account
    )

    let result = await usdc.call("balanceOf", wallet.address)

    console.log(`USDC Balance: ${parseInt(result) / 1e6 }`)
}

main()