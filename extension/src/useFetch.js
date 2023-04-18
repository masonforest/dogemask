import { useState, useEffect } from "react";
export default function useFetch(url) {
  const [resJSON, setResJSON] = useState(null);
  useEffect(() => {
    async function doFetch() {
      let res = await fetch(url, { mode: "cors" });
      setResJSON(await res.json());
    }
    doFetch();
  });
  return resJSON;
}
