import { useEffect, useState, useRef } from "react";
import { sha256 } from "@noble/hashes/sha256";
import { ripemd160 } from "@noble/hashes/ripemd160";
import * as secp256k1 from "@noble/secp256k1";
import { base58check } from "@scure/base";
import { addressFromPublicKey, CHAIN_IDS } from "crypto-wallet";

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
      // setAddress(
      //   base58check(sha256).encode(
      //     concatBytes(
      //       new Uint8Array([COINS[coin].networkId]),
      //       await ripemd160(sha256(secp256k1.getPublicKey(privateKey, true)))
      //     )
      //   )
      // );
    }

    if (privateKey) {
      computeAddress();
    }
  }, [coin, privateKey]);
  return address;
}

export function useBalance(address) {
  const [balance, setBalance] = useState(null);
  const fetchBalance = async (address) => {
      if (!address) {
        return
      }
      let res = await fetch(
       // `https://dogefura.onrender.com/api/v1/address/balance/DL5eP2SCfL3eM55vXPern8gpjWrS6DNeSv`,
       `https://api.blockcypher.com/v1/doge/main/addrs/${address}/balance`,
        { mode: "cors" }
      );
      let reJson = await res.json();
      setBalance(parseInt(reJson.balance)/100000000);
  }
  useEffect(() => fetchBalance (address), [address]);
  useInterval(fetchBalance, 30000);
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
    if (typeof delay === 'number') {
      intervalRef.current = window.setInterval(tick, delay);
      return () => window.clearInterval(intervalRef.current);
    }
  }, [delay]);
  return intervalRef;
}

export function hex(str) {
  return new Uint8Array(Buffer.from(str.join("").replace(/\s+/g, ""), "hex"));
}