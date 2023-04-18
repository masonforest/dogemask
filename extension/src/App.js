import { useState } from "react";
import CreateWallet from "./CreateWallet";
import Wallet from "./Wallet";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

function App() {
  const [page, setPage] = useState("Wallet");
  switch (page) {
    case "CreateWallet":
      return <CreateWallet setPage={setPage} />;
    case "Wallet":
      return <Wallet setPage={setPage} />;
    default:
      return null;
  }
}

export default App;
