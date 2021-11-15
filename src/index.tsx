import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

import "./index.css";
import U, {
  TOGGLE_MODIFY_ALL_UNITS,
  MODIFY_ALL_UNITS,
  SPLIT_UNIT,
  REMOVE_UNIT,
  TOGGLE_ALL_LOCKS,
  RESET_RESIZE_OBSERVERS,
} from "./A";
import DATA from "./D";

const DESIGNER = () => {
  const [UNITS, SET_UNITS] = useState(DATA);
  const [EDIT, SET_EDIT] = useState(true);

  const REMOVE = (i: number) => {
    REMOVE_UNIT(i);
    SET_UNITS(UNITS.filter((u) => u.i !== i));
  };

  const SPLIT = (i: number) => {
    const UNITS_COPY = [...UNITS];
    UNITS_COPY.push(SPLIT_UNIT(i));
    SET_UNITS(UNITS_COPY);
  };

  const TOGGLE_MODIFY_ALL = () => {
    TOGGLE_MODIFY_ALL_UNITS();
    if (MODIFY_ALL_UNITS) {
      document.getElementById("DB_BTN_MODIFY_ALL")?.classList.add("DB_BTN_ON");
    } else {
      document
        .getElementById("DB_BTN_MODIFY_ALL")
        ?.classList.remove("DB_BTN_ON");
    }
  };

  useEffect(() => {
    if (!EDIT) {
      RESET_RESIZE_OBSERVERS();
    }
  }, [EDIT]);

  return (
    <>
      {UNITS.map((u) => (
        <U
          key={u.i}
          {...u}
          remove={(i) => REMOVE(i)}
          split={(i) => SPLIT(i)}
          edit={EDIT}
        />
      ))}
      <button
        id="DB_BTN_LOCKS_ON"
        className="DB_BTN"
        onClick={() => TOGGLE_ALL_LOCKS(true)}
      >
        LK ALL
      </button>

      <button
        id="DB_BTN_LOCKS_OFF"
        className="DB_BTN"
        onClick={() => TOGGLE_ALL_LOCKS(false)}
      >
        LK OFF
      </button>
      <button
        id="DB_BTN_LOCKS_BORDER"
        className="DB_BTN"
        onClick={() => {
          TOGGLE_ALL_LOCKS(true);
          TOGGLE_ALL_LOCKS(false, true);
        }}
      >
        LK BRDR
      </button>
      <button
        id="DB_BTN_MODIFY_ALL"
        className="DB_BTN"
        onClick={() => TOGGLE_MODIFY_ALL()}
      >
        MOD ALL
      </button>
      <button
        id="DB_BTN_EDIT"
        className="DB_BTN"
        onClick={() => SET_EDIT(!EDIT)}
      >
        EDIT
      </button>
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
