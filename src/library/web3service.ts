import { RpcClient } from 'jsonrpc-ts';
import BN from "bn.js";

export type TXCallParams = {
    from?: string
    to: string
    data?: string
}

export type GetLogsParams = {
    fromBlock?: string | Web3Tag 
    toBlock?: string | Web3Tag 
    // are we watching a particular address?
    address?: string | Array<string>
    // event signatures
    topics?: Array<string>
}

enum Web3Tag {
    latest = "latest",
    earliest = "earliest",
    pending = "pending",
  }

interface Web3Service {
    eth_getBalance: [string, Web3Tag];
    eth_blockNumber: [];
    eth_getTransactionCount: [string, Web3Tag];
    eth_sendRawTransaction: [string];
    eth_estimateGas: [TXCallParams];
    eth_call: [TXCallParams, Web3Tag];
    eth_getTransactionReceipt: [string];
    eth_getLogs: [GetLogsParams]
}

export type TXReceipt = {
    blockNum: number,
    gasUsed: BN,
}

export class Web3Provider {
    client: RpcClient<Web3Service>

    constructor(url: string) {
        this.client = new RpcClient<Web3Service>({url: url})
    }

    async getBalance(address: string): Promise<BN> {
        let result = await this.client.makeRequest(
            {
                method: 'eth_getBalance',
                params: [address, Web3Tag.latest],
                id: 1,
                jsonrpc: '2.0',
            }
        )
        return new BN(result.data.result.substr(2), 16)
    }

    async blockNumber(): Promise<number> {
        let result = await this.client.makeRequest(
            {
                method: 'eth_blockNumber',
                params: [],
                id: 1,
                jsonrpc: '2.0',
            }
        )
        return new BN(result.data.result.substr(2), 16).toNumber()
    }

    // TODO: get this to work
    async getLogs(params: GetLogsParams): Promise<string> {
        let result = await this.client.makeRequest(
            {
                method: 'eth_getLogs',
                params: [params],
                id: 1,
                jsonrpc: '2.0',
            }
        )
        return result.data.result
    }

    async getNonce(address: string): Promise<number> {
        let result = await this.client.makeRequest(
            {
                method: 'eth_getTransactionCount',
                params: [address, Web3Tag.latest],
                id: 1,
                jsonrpc: '2.0',
            }
        )
        return parseInt(result.data.result)
    }

    async sendTransaction(signedTransaction: string): Promise<string> {
        let result = await this.client.makeRequest(
            {
                method: 'eth_sendRawTransaction',
                params: [signedTransaction],
                id: 1,
                jsonrpc: '2.0',
            }
        )
        return result.data.result
    }

    async estimateGas(transaction: TXCallParams): Promise<BN> {
        let result = await this.client.makeRequest(
            {
                method: 'eth_estimateGas',
                params: [transaction],
                id: 1,
                jsonrpc: '2.0',
            }
        )
        return new BN(result.data.result.substr(2), 16)
    }

    async call(transaction: TXCallParams): Promise<string> {
        let result = await this.client.makeRequest(
            {
                method: 'eth_call',
                params: [transaction, Web3Tag.latest],
                id: 1,
                jsonrpc: '2.0',
            }
        )
        return result.data.result
    }

    async receipt(hash: string): Promise<TXReceipt | null> {
        let result = await this.client.makeRequest(
            {
                method: 'eth_getTransactionReceipt',
                params: [hash],
                id: 1,
                jsonrpc: '2.0',
            }
        )
        if (result.data.result == null) {
            return null
        }

        return {
            blockNum: parseInt(result.data.result.blockNumber),
            gasUsed: new BN(result.data.result.gasUsed.substr(2), 16) 
        }
    }
}

export function NewInfuraService(network: string, projectID: string) {
    let url = `https://${network}.infura.io/v3/${projectID}`
    return new Web3Provider(url)
}

// TODO: Read this from envars to not hardcode secrets
export function DefaultWeb3Service() {
    let key = process.env.API_KEY!
    return NewInfuraService('ropsten', key)
}