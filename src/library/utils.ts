import BN from "bn.js";

export function WeiToEth(weiAmount: BN) {
    if (weiAmount.isZero()) {
        return weiAmount
    }
    return parseInt(weiAmount.toString()) / 1e18
}

export function EthToWei(ethAmount: number) {
    return new BN((ethAmount * 1e18).toString(), 10)
}

export const gasPrice = new BN(20e9, 10)