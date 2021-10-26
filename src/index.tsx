import React, { useState } from "react";
import ReactDOM from "react-dom";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

import "./N.css";
import U, { SPLIT_UNIT, REMOVE_UNIT } from "./A";
import M from "./M";

const DESIGNER = () => {
  const [UNITS, SET_UNITS] = useState(M);

  const REMOVE = (i: number) => {
    REMOVE_UNIT(i);
    SET_UNITS(UNITS.filter((u) => u.i !== i));
  };

  const SPLIT = (i: number) => {
    const newUnits = [...UNITS];
    newUnits.push(SPLIT_UNIT(i));
    SET_UNITS(newUnits);
  };

  return (
    <>
      {UNITS.map((d) => (
        <U key={d.i} {...d} remove={(i) => REMOVE(i)} split={(i) => SPLIT(i)} />
      ))}
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    {/* DESIGNER */ <DESIGNER />}
    {/* PRODUCTION
      <>
        {M.map((d) => (
          <U key={d.i} {...d} />
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
