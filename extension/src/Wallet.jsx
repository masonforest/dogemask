import {useState} from "react";
import Address from "./Address";
import * as secp256k1 from "@noble/secp256k1";
import {NODE_URL} from "./constants";
import {useAddress, useBalance, useUtxos, hex,
  fetchUnspentTransationOutputsBlockCypher,
} from "./utils";
import {
  numberToSatoshis,
  CHAIN_IDS,
  createSignedTransaction,
  addressFromPublicKey,
} from "doge-wallet";

export default function Wallet(props) {
  const {privateKey} = props;
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const address = useAddress("DOGE", privateKey);
  const balance = useBalance(address);
  const send = async () => {
    setAmount("");
    setRecipient("");

    const publicKey = await secp256k1.getPublicKey(privateKey, true);
    const unspentTransationOutputs = await fetchUnspentTransationOutputsBlockCypher(
      await addressFromPublicKey(CHAIN_IDS.DOGE, publicKey)
    );
    const signedTransation = await createSignedTransaction({
      chainId: CHAIN_IDS.DOGE,
      unspentTransationOutputs,
      recipientAddress: recipient,
      value: numberToSatoshis(parseFloat(amount)),
      privateKey,
    });
    const rawResponse = await fetch(NODE_URL, {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        jsonrpc: "1.0",
        id: "1",
        method: "sendrawtransaction",
        params: [hex(signedTransation)],
      }),
    });
  };

  return (
    <>
      <div
        style={{alignItems: "center"}}
        className="d-flex flex-row mb-2"
      ></div>
      Your Dogecoin address:
      <Address address={address} />
      <div>Your Balance: {balance} DOGE</div>
      <h1 className="mt-4">Send</h1>
      <label className="form-label">Recipient:</label>
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="form-control"
      />
      <label className="form-label">Amount</label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="form-control"
      />
      <br />
      <button className="btn btn-primary" onClick={() => send()}>
        Send
      </button>
    </>
  );
}
