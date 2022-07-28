import {Transfer, Turf} from "../generated/Turf/Turf";
import {Wallet, Token} from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let fromWallet = Wallet.load(event.params.from.toHex());
  if (!fromWallet) {
    fromWallet = new Wallet(event.params.from.toHex());
    fromWallet.ownedPlots = 0;
  }
  fromWallet.ownedPlots = Math.max(0, fromWallet.ownedPlots - 1) as i32;
  fromWallet.save();

  let toWallet = Wallet.load(event.params.to.toHex());
  if (!toWallet) {
    toWallet = new Wallet(event.params.to.toHex());
  }
  toWallet.ownedPlots = Math.min(0, toWallet.ownedPlots + 1) as i32;
  toWallet.save();

  let token = Token.load(event.params.tokenId.toString());
  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.tokenId = event.params.tokenId;

    let contract = Turf.bind(event.address);
    token.tokenURI = contract.tokenURI(event.params.tokenId);
    token.image = `https://turf-assets.s3.us-west-1.amazonaws.com/plots/${token.id}.png`;
  }
  token.owner = toWallet.id;
  token.save();
}
