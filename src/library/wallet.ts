import { Mnemonic, HDKey, Address } from "cipher-ethereum";
import { randomBytes } from "crypto";

const bip44Path = "m/44'/60'/0'/0/0";

export type Wallet = {
    mnemonic: Mnemonic,
    address: string,
    privateKey: Buffer,
    publicKey: Buffer,
};

export function NewWalletFromMnemonic(mnemonic: string): Wallet {
    let parsedMnemonic = Mnemonic.parse(mnemonic);
    if (parsedMnemonic === null) {
        throw new Error('bad mnemonic')
    }
    let seed = parsedMnemonic.toSeed()
    let key = HDKey.parseMasterSeed(seed).derive(bip44Path)
    return {
        mnemonic: parsedMnemonic, 
        address: Address.from(key.publicKey).address,
        privateKey: key.privateKey!, 
        publicKey: key.publicKey,
    }
}

export function NewRandomWallet(): Wallet {
    const entropy = randomBytes(16);
    const mnemonic = Mnemonic.generate(entropy)!;
    return NewWalletFromMnemonic(mnemonic.phrase);
}

export function TestWallet(): Wallet {
    let phrase = process.env.WALLET_PHRASE
    return NewWalletFromMnemonic(phrase!)
}
