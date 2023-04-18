import { useState } from "react";
import * as secp256k1 from "@noble/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { useAddress, useBalance,   hex,
  assertBytesEqual,
  getUnspentTransationOutputs } from "./utils";
import { addressToPublicKeyHash, numberToSatoshis, CHAIN_IDS, createSignedTransaction, addressFromPublicKey, fetchUnspentTransationOutputsBlockCypher, x } from "crypto-wallet";
import { base58check } from "@scure/base";
import useLocalStorage from "./useLocalStorage";

export default function Wallet() {
  const [privateKey] = useLocalStorage(
    "privateKey",
    secp256k1.utils.randomPrivateKey
  );
  const [recipient, setRecipient] = useState(
    "DPz2My2f8fFXDP2X8oir9588v61x5GVVUv"
  );
  const [amount, setAmount] = useState(".5");
  const address = useAddress("DOGE", privateKey);
  const balance = useBalance(address);
  const send = async () => {
    setAmount("")
    setRecipient("")

    const publicKey = await secp256k1.getPublicKey(privateKey, true);
    const unspentTransationOutputs = await fetchUnspentTransationOutputsBlockCypher(await addressFromPublicKey(CHAIN_IDS.DOGE, publicKey))
    const signedTransation = await createSignedTransaction({
      chainId: CHAIN_IDS.DOGE,
      unspentTransationOutputs,
      recipientAddress: recipient,
      value: numberToSatoshis(parseFloat(amount)),
      privateKey,
    });
    const rawResponse = await fetch("https://dogefura.onrender.com/", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        "jsonrpc": "1.0", "id": "1", "method": "sendrawtransaction", "params": [Buffer.from(signedTransation).toString("hex")]
      },
      ),
    });
    const content = await rawResponse.json();
  };

  return (
    <>
      <div>Your Dogecoin Address: {address}</div>
      <div>Your Balance: {balance} DOGE</div>

      <input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
      <input value={amount} onChange={(e) => setAmount(e.target.value)} />

      <br />
      <button className="btn btn-primary" onClick={() => send()}>
        Send
      </button>
    </>
  );
}
