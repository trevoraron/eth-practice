import { Transaction, TransactionParams } from "cipher-ethereum";
import { gasPrice } from "./utils";
import { Wallet } from "./wallet";
import { Web3Provider, TXReceipt, TXCallParams } from "./web3service";
import BN from "bn.js";

export class Account {
    wallet: Wallet
    provider: Web3Provider

    constructor(wallet: Wallet, provider: Web3Provider) {
        this.wallet = wallet
        this.provider = provider
    }

    async getBalance() {
        return this.provider.getBalance(this.wallet.address)
    }

    async sendTransaction(params: TransactionParams) {
        // first lets get our current nonce
        let nonce = await this.provider.getNonce(this.wallet.address)
        params.nonce = nonce

        // now lets find the gas limit by estimating the gas
        let gasParams: TXCallParams = {
            from: this.wallet.address,
            to: params.toAddress!,
        }

        if (params.data) {
            gasParams.data = params.data
        }
        let gasEstimate = await this.provider.estimateGas(gasParams)
        params.gasLimit = new BN(gasEstimate)

        // sign the transaction
        let tx = new Transaction(params)
        let signedTx = `0x${tx.sign(this.wallet.privateKey).toString("hex")}`

        // send it off 
        let hash = await this.provider.sendTransaction(signedTx)
        return new PendingTransaction(hash, this.provider)
    }

    async sendEth(address: string, amount: BN) {
        let balance = await this.getBalance()
        if (balance.lt(amount)) {
            throw new Error("not enough funds!")
        }
        return await this.sendTransaction(
            {
                nonce: 0,
                gasPriceWei: gasPrice,
                gasLimit: new BN(0),
                toAddress: address,
                valueWei: amount,
            }
        )
    }
}

export class PendingTransaction {
    hash: string
    provider: Web3Provider

    constructor(hash: string, provider: Web3Provider) {
        this.hash = hash
        this.provider = provider
    }

    async wait(): Promise<TXReceipt> {
        let result = null
        do {
            await this.sleep()
            result = await this.provider.receipt(this.hash) 
        } while (result === null)
        return result
    }

    async sleep(ms = 1000) {
        return new Promise(resolve => {
          setTimeout(resolve, ms);
        });
    }
}