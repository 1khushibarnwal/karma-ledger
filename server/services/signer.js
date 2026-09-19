const { ethers } = require("ethers");

// This is the backend's own wallet — its address is set as `trustedSigner` in the
// smart contract at deploy time. Anyone can call mintOrUpdateKarma() on-chain, but
// the contract rejects it unless the score payload is signed by this exact key.
// This is what stops a user from just minting themselves a fake 999 score.
function getSignerWallet() {
  const pk = process.env.SIGNER_PRIVATE_KEY;
  if (!pk) throw new Error("SIGNER_PRIVATE_KEY missing in server/.env");
  return new ethers.Wallet(pk);
}

/**
 * Produces a signature over exactly the same payload the contract reconstructs:
 * keccak256(abi.encodePacked(recipient, score, githubUsername, nonce, contractAddress))
 */
async function signKarmaPayload({ recipient, score, githubUsername, nonce, contractAddress }) {
  const wallet = getSignerWallet();

  const payloadHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "string", "uint256", "address"],
    [recipient, score, githubUsername, nonce, contractAddress]
  );

  // signMessage automatically applies the Ethereum Signed Message prefix,
  // matching MessageHashUtils.toEthSignedMessageHash() on the contract side.
  const signature = await wallet.signMessage(ethers.getBytes(payloadHash));
  return signature;
}

module.exports = { getSignerWallet, signKarmaPayload };
