import { DefaultWeb3Service } from "./library/web3service"
import { WeiToEth } from './library/utils';

async function main(args: string[]) {
    let service = DefaultWeb3Service()
    let balance = await service.getBalance(args[0])
    console.log(`Balance: ${WeiToEth(balance)}`)
}

const args = process.argv.slice(2);

main(args)