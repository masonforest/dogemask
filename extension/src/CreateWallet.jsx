import {useEffect, useRef, useCallback} from "react";
import {addressFromPublicKey, CHAIN_IDS} from "doge-wallet";
import foxMask from "./images/fox-mask.png";
import * as secp256k1 from "@noble/secp256k1";
import doge from "./images/doge.png";
import {API_URL} from "./constants"
export default function CreateWallet(props) {
  const {setPrivateKey} = props;
  // const oauthTwitter = async () => {
  //   //let res = await ((await fetch("/oauth_redirect")).json())
  //   //window.location = res.url
  //   const response = await fetch("http://localhost:3031/oauth_redirect", {
  //     method: "POST",
  //     mode: "cors",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({address:"DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L"}),
  //   });
  //
  //   window.location = (await response.json()).url;
  //   console.log(window.location)
  // }
  return (
    <form
      className="d-flex flex-column mx-4"
      onSubmit={async (e) => {
        const privateKey = secp256k1.utils.randomPrivateKey();
        e.preventDefault();
        // oauthTwitter();
        const address = await addressFromPublicKey(
          CHAIN_IDS.DOGE,
          secp256k1.getPublicKey(privateKey, true)
        );

        setPrivateKey(privateKey);
        try {
          await chrome.tabs.create({url: `${API_URL}?address=${address}`});
        } catch (e) {
          window.location = `${API_URL}?address=${address}`;
        }
      }}
    >
      <h1 className="text-center">Login with Twitter</h1>
      <div id="doge-wrapper">
        <div id="eyes-wrapper">
          <Eye />
          <Eye />
        </div>
        <img alt="Fox Mask" id="fox-mask" src={foxMask} />
        <img alt="Doge" id="doge" src={doge} />
      </div>
      {/*<div className="form-floating mt-3">
        <input
          type="password"
          className="form-control"
          id="floatingPassword"
          placeholder="Password"
        />
        <label htmlFor="floatingPassword">Password</label>
      </div>*/}
      <div className="d-grid gap-2 mt-3">
        <button className="btn btn-primary" type="submit">
          Login with Twitter
        </button>
      </div>
    </form>
  );
}

export function Eye() {
  const eyeEl = useRef(null);
  const handleMouseMove = useCallback(
    (event) => {
      if (eyeEl.current) {
        var x =
          eyeEl.current.getBoundingClientRect().left +
          eyeEl.current.getBoundingClientRect().width / 2;
        var y =
          eyeEl.current.getBoundingClientRect().top +
          eyeEl.current.getBoundingClientRect().height / 2;
        var rad = Math.atan2(event.pageX - x, event.pageY - y);
        var rot = rad * (180 / Math.PI) * -1 + 180;
        eyeEl.current.style.transform = `rotate(${rot}deg)`;
      }
    },
    [eyeEl]
  );
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return <div ref={eyeEl} className="eye"></div>;
}
