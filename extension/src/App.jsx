import {useState, useEffect} from "react";
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
      const response = await fetch(API_URL, {
        credentials: "include",
        headers: {
          "Content-type": "application/json",
        },
      });

      if (response.status == 200) {
        const json = await response.json();
        setPage("Wallet");
      } else if (response.status == 401) {
        setPage("Wallet");
        // setPage("CreateWallet");
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
