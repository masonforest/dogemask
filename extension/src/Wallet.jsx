import clipboard from "./clipboard.svg";
import * as secp256k1 from "@noble/secp256k1";
import {useState} from "react";
import {sha256} from "@noble/hashes/sha256";
import Address from "./Address";
import {useAddress, useBalance, useUtxos, hex,
  fetchUnspentTransationOutputsBlockCypher,
} from "./utils";
import {
  addressToPublicKeyHash,
  numberToSatoshis,
  CHAIN_IDS,
  createSignedTransaction,
  addressFromPublicKey,
} from "doge-wallet";
import {base58check} from "@scure/base";
import React, {Component} from "react";
import Select from "react-select";

const options = [
  {value: "chocolate", label: "D6epyfmQS1eJTiM1sVdoqiX7fYouE1WWhD"},
];
const customStyles = {
  option: (provided, state) => ({
    ...provided,
    fontSize: "12px",
  }),
  singleValue: (provided, state) => ({
    ...provided,
    fontSize: "12px",
  }),
};

function arrayBufferToHex(arrayBuffer) {
  return Array.prototype.map
    .call(new Uint8Array(arrayBuffer), (n) => n.toString(16).padStart(2, "0"))
    .join("");
}

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
console.log("1")
    const unspentTransationOutputs = await fetchUnspentTransationOutputsBlockCypher(
      await addressFromPublicKey(CHAIN_IDS.DOGE, publicKey)
    );
console.log("2")
    const signedTransation = await createSignedTransaction({
      chainId: CHAIN_IDS.DOGE,
      unspentTransationOutputs,
      recipientAddress: recipient,
      value: numberToSatoshis(parseFloat(amount)),
      privateKey,
    });
console.log("3")
console.log(hex(signedTransation))
    const rawResponse = await fetch("https://dogefura.onrender.com/", {
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
    const content = await rawResponse.json();
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
