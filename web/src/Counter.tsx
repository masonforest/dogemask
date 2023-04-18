import {useState} from "preact/hooks";
import preactLogo from "./assets/preact.svg";
import viteLogo from "/vite.svg";
import {useQuery, useMutation, gql} from "@apollo/client";

export function Counter() {
  const oauthTwitter = async () => {  
    //let res = await ((await fetch("/oauth_redirect")).json())
    //window.location = res.url
    const response = await fetch("/oauth_redirect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({address:"DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L"}),
    });
    window.location = (await response.json()).url; 
  }
  return (
    <button
      onClick={() => oauthTwitter()}
    >
      count is
    </button>
  );
}
