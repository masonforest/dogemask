import {useState, useEffect} from "react";
import {addressFromPublicKey, CHAIN_IDS} from "doge-wallet";
import * as secp256k1 from "@noble/secp256k1";
import CreateWallet from "./CreateWallet";
import Wallet from "./Wallet";
import "bootstrap/dist/css/bootstrap.css";
import useLocalStorage from "./useLocalStorage";
import {API_URL} from "./constants"
import "./App.css";

function App() {
  const [page, setPage] = useState(null);
  const [privateKey, setPrivateKey] = useLocalStorage("privateKey");
  const fetchData = async () => {
    try {
      if(!privateKey) {
        setPage("CreateWallet");
        return;
      }
      const address = await addressFromPublicKey(
        CHAIN_IDS.DOGE,
        secp256k1.getPublicKey(privateKey, true)
      );
      const response = await fetch(API_URL + `?address=${address}`, {
        headers: {
          "Content-type": "application/json",
        },
      });

      if (response.status == 200) {
        const json = await response.json();
        setPage("Wallet");
      } else if (response.status == 404) {
        setPage("CreateWallet");
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  switch (page) {
    case "CreateWallet":
      return <CreateWallet setPrivateKey={setPrivateKey} setPage={setPage} />;
    case "Wallet":
      return <Wallet setPage={setPage} privateKey={privateKey} />;
    default:
      return null;
  }
}

export default App;
