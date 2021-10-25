import React, { useState } from "react";
import ReactDOM from "react-dom";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

import "./N.css";
import U from "./A";
import M, { T } from "./M";

const DESIGNER = () => {
  const [UNITS, SET_UNITS] = useState(M);
  return (
    <>
      {UNITS.map((u) => (
        <U key={u.i} {...u} />
      ))}
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <DESIGNER />
    {/* PRODUCTION LOAD
      <>
        {M.map((m) => (
          <U key={m.i} {...m} />
        ))}
      </>
      */}
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
