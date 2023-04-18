import { useEffect, useRef, useCallback } from "react";
import foxMask from "./images/fox-mask.png";
import doge from "./images/doge.png";
import "./styles/doge-eyes.css";
import "./styles/floating-labels.css";
export default function CreateWallet(props) {
  const { setPage } = props;
  const oauthTwitter = async () => {  
    //let res = await ((await fetch("/oauth_redirect")).json())
    //window.location = res.url
    const response = await fetch("http://localhost:3031/oauth_redirect", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({address:"DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L"}),
    });
    window.location = (await response.json()).url; 
  }
  return (
    <form
      className="d-flex flex-column mx-4"
      onSubmit={(e) => {
        e.preventDefault();
        oauthTwitter();
      }}
    >
      <h1>Create a Wallet</h1>
      <div id="doge-wrapper">
        <div id="eyes-wrapper">
          <Eye />
          <Eye />
        </div>
        <img alt="Fox Mask" id="fox-mask" src={foxMask} />
        <img alt="Doge" id="doge" src={doge} />
      </div>
      <div className="d-grid gap-2 mt-3">
        <button className="btn btn-primary" type="submit">
          Login With Twitter
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
