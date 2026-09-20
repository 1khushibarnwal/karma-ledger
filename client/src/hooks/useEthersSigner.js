import { useMemo } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useConnectorClient } from "wagmi";

/**
 * wagmi speaks viem; services/web3.js speaks ethers. Rather than rewrite the
 * contract layer, adapt the connected wallet client into an ethers Signer so
 * mintKarma() and readOnChainKarma() keep working unchanged.
 */
function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}

export function useEthersSigner({ chainId } = {}) {
  const { data: client } = useConnectorClient({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : null), [client]);
}
