import {useEffect, useState, useRef} from "react";
import {sha256} from "@noble/hashes/sha256";
import {ripemd160} from "@noble/hashes/ripemd160";
import * as secp256k1 from "@noble/secp256k1";
import {base58check} from "@scure/base";
import useFetch from "./useFetch.js";
import {addressFromPublicKey, CHAIN_IDS} from "doge-wallet";
import { hexToBytes } from '@noble/hashes/utils';

export async function fetchUnspentTransationOutputsBlockCypher(address) {
  const response = await fetch(
    `https://api.blockcypher.com/v1/doge/main/addrs/${address}?unspentOnly=true&includeScript=true`,
    { cache: "no-cache" }
  );
  const json = await response.json();
  return json.txrefs.map(({ tx_hash, tx_output_n, script, value }, i) => {
    return {
      hash: hexToBytes(tx_hash).reverse(),
      index: tx_output_n,
      script: hexToBytes(script),
      value: BigInt(parseInt(value)),
    };
  });
}

function isUint8a(bytes) {
  return bytes instanceof Uint8Array;
}

function concatBytes(...arrays) {
  if (!arrays.every(isUint8a)) throw new Error("Uint8Array list expected");
  if (arrays.length === 1) return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}
const COINS = {
  BTC: {
    networkId: 0,
  },
  DOGE: {
    networkId: 30,
  },
};
export function useAddress(coin, privateKey) {
  const [address, setAddress] = useState(null);
  useEffect(() => {
    async function computeAddress() {
      setAddress(
        await addressFromPublicKey(
          CHAIN_IDS.DOGE,
          secp256k1.getPublicKey(privateKey, true)
        )
      );
    }

    if (privateKey) {
      computeAddress();
    }
  }, [coin, privateKey]);
  return address;
}

export function useUtxos(address) {
  // const response = useFetch(`https://lobby3-cors-anywhere.herokuapp.com/https://dogechain.info/api/v1/unspent/${address}`)
  // if (response) {
  // console.log(response)
  //   return response.unspent_outputs
  // }
  const [utxos, setUtxos] = useState(null);
  useEffect(() => {
    async function fetchUtxos() {
      let res = await fetch(
        `https://dogefura.herokuapp.com/api/v1/unspent/${address}`,
        {mode: "cors"}
      );
      let reJson = await res.json();
      setUtxos(reJson.unspent_outputs);
    }
    if (address) {
      fetchUtxos();
    }
  }, [address]);
  return utxos;
}

export function useBalance(address) {
  const [balance, setBalance] = useState(null);
  const fetchBalance = async (address) => {
    if (!address) {
      return;
    }
    let res = await fetch(
      // `https://dogefura.onrender.com/api/v1/address/balance/DL5eP2SCfL3eM55vXPern8gpjWrS6DNeSv`,
      `https://api.blockcypher.com/v1/doge/main/addrs/${address}/balance`,
      {mode: "cors"}
    );
    let reJson = await res.json();
    setBalance(parseInt(reJson.balance) / 100000000);
  };
  useEffect(() => fetchBalance(address), [address]);
  useInterval(() => fetchBalance(address), 30000);
  return balance;
}
function useInterval(callback, delay) {
  const intervalRef = useRef(null);
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === "number") {
      intervalRef.current = window.setInterval(tick, delay);
      tick();
      return () => window.clearInterval(intervalRef.current);
    }
  }, [delay]);
  return intervalRef;
}
const byteToHex = [];

for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, "0");
  byteToHex.push(hexOctet);
}

export function hex(arrayBuffer) {
  const buff = new Uint8Array(arrayBuffer);
  const hexOctets = []; // new Array(buff.length) is even faster (preallocates necessary array size), then use hexOctets[i] instead of .push()

  for (let i = 0; i < buff.length; ++i) hexOctets.push(byteToHex[buff[i]]);

  return hexOctets.join("");
}
