import { NewWalletFromMnemonic } from "./wallet"

test('creates wallet', () => {
    const phrase = 'bullet angle lawsuit razor total asset parrot talk resource pole adult divide'
    const address = '0xFE7A8E2EE3fFad4363AaA70Aaf1c4bAd444d7a69'

    let wallet = NewWalletFromMnemonic(phrase)
    expect(wallet.address).toBe(address)
});