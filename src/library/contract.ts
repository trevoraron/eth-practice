import { Account, PendingTransaction } from "./account";
import { Address, util } from "cipher-ethereum";
import { gasPrice } from "./utils";
import BN from "bn.js";

type parsedFunction = {
    functionSignature: string,
    topic: string
    argumentTypes: Array<string>
}

export class Contract {
    address: string
    abi: Array<string>
    account: Account
    // Name -> Signature
    parsedFunctions: Record<string, parsedFunction>

    constructor(address: string, abi: Array<string>, account: Account) {
        this.address = address
        this.abi = abi 
        this.account = account
        this.parsedFunctions = {}
        for (let functionCall of abi) {
            let parsedAbi = this.parseABI(functionCall)
            this.parsedFunctions[parsedAbi.name] = {
                functionSignature: parsedAbi.parsed,
                topic: parsedAbi.topic,
                argumentTypes: parsedAbi.types
            }
        }
    }

    async sendTransaction(functionName: string, ...params: any): Promise<PendingTransaction> {
        let parsedFunction = this.parsedFunctions[functionName]
        if (!parsedFunction) {
            throw new Error("non existant function")
        }
        let data = parsedFunction.functionSignature

        for (let i = 0; i < params.length; i++) {
            data = data.concat(this.parseParam(params[i], parsedFunction.argumentTypes[i]))
        }

        return await this.account.sendTransaction(
            {
                nonce: 0,
                gasPriceWei: gasPrice,
                gasLimit: new BN(0),
                toAddress: this.address,
                data: data,
                valueWei: new BN(0)
            }
        )
    }

    eventSignature(eventName: string): string {
        let parsedFunction = this.parsedFunctions[eventName]
        if (!parsedFunction) {
            throw new Error("non existant event")
        }
        return parsedFunction.topic
    }

    async call(functionName: string, ...params: any): Promise<string> {
        let parsedFunction = this.parsedFunctions[functionName]
        if (!parsedFunction) {
            throw new Error("non existant function")
        }
        let data = parsedFunction.functionSignature

        for (let i = 0; i < params.length; i++) {
            data = data.concat(this.parseParam(params[i], parsedFunction.argumentTypes[i]))
        }

        return await this.account.provider.call(
            {
                to: this.address,
                data: data,
            }
        )
    }

    // Grabbed info on this from here: https://medium.com/b2expand/abi-encoding-explanation-4f470927092d
    parseParam(param: any, argType: string): string {
        let parsed = ''
        // TODO: support more types
        switch(argType) {
            case "address":
                if(!Address.isValid(param)) {
                    throw new Error("bad address")
                }
                let addrLower = String(param).toLowerCase()
                let addrNoZx = addrLower.substring(2)
                parsed = addrNoZx.padStart(64, "0")
                break;
            case "uint256":
                let hex = Number(param).toString(16)
                parsed = hex.padStart(64, "0")
                break;
        }
        return parsed

    }

    // Ex:
    // function balanceOf(address _owner) public view returns (uint256 balance)
    // parsed is this:
    // balanceOf(address)
    parseABI(abi: string): {name: string, parsed: string, types: Array<string>, topic: string} {
        // first grab the function name
        let parenthLeftSplit = abi.split("(")
        let splitLeft = parenthLeftSplit[0]
        // function balanceOf
        let name = splitLeft.split(" ")[1]

        // Now lets get the argument names
        // address _to, uint256 _value
        let args: Array<string> = []
        let functionArgs = parenthLeftSplit[1].split(")")[0]
        functionArgs.replace(",", "")
        let functionArgsList = functionArgs.split(" ")

        // Take every other so we have address, uint256
        for (let i = 0; i < functionArgsList.length; i += 2) {
            args.push(functionArgsList[i])
        }

        // Now build to desired form, i.e. transfer(address,uint256)
        let parsedFunctionString = `${name}(${args.join(",")})`
        let hash = `0x${util.keccak256(parsedFunctionString).toString("hex", 0, 4)}`

        return {
            name: name,
            parsed: hash,
            types: args,
            topic: `0x${util.keccak256(parsedFunctionString).toString("hex")}`
        }
    }

}