import { PrismaClient } from '@prisma/client'
import { ethers } from 'ethers'

const prisma = new PrismaClient()
const mnemonic = process.env.WALLET_PHRASE!
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const provider = ethers.getDefaultProvider("ropsten", {
    // Replace the following with your own INFURA API key
    infura: process.env.API_KEY!,
});
const account = wallet.connect(provider);

let abi = [
    "event Transfer(address indexed _from, address indexed _to, uint256 _value)",
    "function decimals() public view returns (uint8)",
    "function name() public view returns (string)",
    "function symbol() public view returns (string)", 
];

async function fetchLogs() {
    let iface = new ethers.utils.Interface(abi)
    let logs = await provider.getLogs({
        fromBlock: "latest",
        toBlock: "latest",
        topics: [iface.getEventTopic("Transfer")],
    }).catch((err: string) => console.error("ahh", err))

    if (!logs) {
        return
    }
    let updated = 0
    for (const log of logs) {
        try {
            console.log(log)
            let parsed = iface.parseLog(log)
            let type = ( parsed.args.length === 3) ? 'erc20': 'erc721'
            console.log(type)
            await newTransfer(log.address, parsed.args._from, parsed.args._to, parsed.args._value.toNumber(), log.transactionHash, type)
            updated += 1
        } catch(e) {console.error(e)}
    }

    console.log(`Updated ${updated} transfers`)
}


async function newTransfer(
    contractAddress: string, 
    to: string, 
    from: string, 
    amount: number,
    txhash: string,
    type: string
) {
    const ambiguousContract = new ethers.Contract(
        contractAddress,
        abi,
        account
    )
    let decimals = ""
    try {
        decimals = await ambiguousContract.decimals();
    } catch(e) {}

    let name = ""
    try {
        name = await ambiguousContract.name();
    } catch(e) {}

    let symbol = ""
    try {
        symbol = await ambiguousContract.symbol();
    } catch(e) {}

    let row = await prisma.transfer.create({
        data: {
            from: from,
            to: to,
            amount: amount,
            txhash: txhash,
            token: {
                connectOrCreate: {
                    where: {
                        address: contractAddress,
                    },
                    create: {
                        address: contractAddress,
                        name: name,
                        symbol: symbol,
                        decimals: parseInt(decimals),
                        type: type,
                    }
                }
            }
        },
        include: {
            token: true,
        }
    })

    console.log("sucess!")
    console.log(row)
}

async function sleep(ms = 2000) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
}

async function main() {
    do {
        await fetchLogs()
        console.log("sleeping")
        await sleep()
    } while (true)
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })