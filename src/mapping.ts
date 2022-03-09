import {Transfer, Turf} from "../generated/Turf/Turf";
import {Wallet, Token, TokenTransfer} from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  let fromWallet = Wallet.load(event.params.from.toHex());
  if (!fromWallet) {
    fromWallet = new Wallet(event.params.from.toHex());
    fromWallet.save();
  }

  let toWallet = Wallet.load(event.params.to.toHex());
  if (!toWallet) {
    toWallet = new Wallet(event.params.to.toHex());
    toWallet.save();
  }

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

  const tokenTransfer = new TokenTransfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  tokenTransfer.createdAt = event.block.timestamp;
  tokenTransfer.token = token.id;
  tokenTransfer.from = fromWallet.id;
  tokenTransfer.to = toWallet.id;
  tokenTransfer.save();
}
