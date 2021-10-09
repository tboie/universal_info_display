import "./A.css";
import M, { T } from "./M";

// UNIVERSAL RESPONSIVE DASHBOARD DESIGNER - POC v1 (something to work with)

let SELECTED_UNIT = -1;
let POINTER_POS: undefined | { x: number; y: number } = undefined;
let PREV_POINTER_POS: undefined | { x: number; y: number } = undefined;

const GET_POINTER_COORDS = (root: HTMLDivElement, ev: any) => {
  const R = root.getBoundingClientRect();
  return {
    x: R ? (ev.pageX / R.width) * 100 : 0,
    y: R ? (ev.pageY / R.height) * 100 : 0,
  };
};

const GET_DISTANCE = (x1: number, y1: number, x2: number, y2: number) => ({
  x: x1 - x2,
  y: y1 - y2,
});

const SAVE = (i: number, u: T) => Object.assign(M[i], u);

const GET_CONNECTED_UNITS = (i: number, s?: "t" | "r" | "b" | "l") => {
  let units: number[] = [];
  for (const [key, value] of Object.entries(M[i].c)) {
    (s ? key === s : true) &&
      value.length &&
      value.forEach((i) => !units.includes(i) && units.push(i));
  }
  return units;
};

const SET_UNIT = (
  i: number,
  t: "RSZ_BR" | "RSZ_TL" | "MOVE",
  u: T,
  dim: "w" | "h",
  d: number,
  a: number,
  ele: HTMLDivElement
) => {
  // bottom & right
  if (t === "RSZ_BR") {
    dim === "w"
      ? (u.tX = (u.x / (u.w += d)) * 100)
      : (u.tY = (u.y / (u.h += d)) * 100);
  }
  // top & left
  else if (t === "RSZ_TL") {
    dim === "w"
      ? (u.x = a - (u.w -= d)) && (u.tX = ((a - u.w) / u.w) * 100)
      : (u.y = a - (u.h -= d)) && (u.tY = ((a - u.h) / u.h) * 100);
  }
  // move
  else if (t === "MOVE") {
    dim === "w"
      ? (u.tX = ((u.x += d) * 100) / u.w)
      : (u.tY = ((u.y += d) * 100) / u.h);
  }

  dim === "w" ? (ele.style.width = u.w + "%") : (ele.style.height = u.h + "%");
  ele.style.transform = `translate(${u.tX}%,${u.tY}%)`;
  SAVE(i, u);
};

const MODIFY = (i: number) => {
  if (!M[i].updated && POINTER_POS && PREV_POINTER_POS) {
    const DIST = GET_DISTANCE(
      POINTER_POS.x,
      POINTER_POS.y,
      PREV_POINTER_POS.x,
      PREV_POINTER_POS.y
    );

    const ELE = document.getElementById(`U${i}`) as HTMLDivElement;

    let locks: { t?: number; r?: number; b?: number; l?: number } = {
      t: undefined,
      r: undefined,
      b: undefined,
      l: undefined,
    };

    // Use temp locks if exists
    if (M[i].tempL) {
      locks = M[i].tempL || {};
    }
    if (typeof locks.t === "undefined") {
      locks.t = M[i].l.t;
    }
    if (typeof locks.r === "undefined") {
      locks.r = M[i].l.r;
    }
    if (typeof locks.b === "undefined") {
      locks.b = M[i].l.b;
    }
    if (typeof locks.l === "undefined") {
      locks.l = M[i].l.l;
    }

    // Lols it works???????

    if (ELE) {
      // Mouse Moving Left/Right
      if (DIST.x < 0 || DIST.x > 0) {
        // Lock on Right
        if (typeof locks.r !== "undefined") {
          // No Lock on Left
          if (typeof locks.l === "undefined") {
            // @ts-ignore
            if (M[i].x + M[i].w > locks.r) {
              SET_UNIT(i, "RSZ_BR", M[i], "w", DIST.x, M[i].aR || 0, ELE);
            } else {
              SET_UNIT(i, "RSZ_TL", M[i], "w", DIST.x, M[i].aR || 0, ELE);
            }
          }
          // Lock on Left
          else {
            // @ts-ignore
            if (M[i].x > locks.l) {
              SET_UNIT(i, "RSZ_TL", M[i], "w", DIST.x, M[i].aR || 0, ELE);
            }
            // @ts-ignore
            if (M[i].x + M[i].w > locks.r) {
              SET_UNIT(i, "RSZ_BR", M[i], "w", DIST.x, M[i].aR || 0, ELE);
            }
          }
        }
        // Lock on Left
        else if (typeof locks.l !== "undefined") {
          // @ts-ignore
          if (M[i].x > locks.l) {
            SET_UNIT(i, "RSZ_TL", M[i], "w", DIST.x, M[i].aR || 0, ELE);
          } else {
            SET_UNIT(i, "RSZ_BR", M[i], "w", DIST.x, M[i].aR || 0, ELE);
          }
        }
        // No Lock Left or Right
        else {
          SET_UNIT(i, "MOVE", M[i], "w", DIST.x, M[i].aR || 0, ELE);
        }
      }

      // Mouse Moving Up/Down
      if (DIST.y < 0 || DIST.y > 0) {
        // Lock on Bottom
        if (typeof locks.b !== "undefined") {
          // No Lock on Top
          if (typeof locks.t === "undefined") {
            // @ts-ignore
            if (M[i].y + M[i].h > locks.b) {
              SET_UNIT(i, "RSZ_BR", M[i], "h", DIST.y, M[i].aB || 0, ELE);
            } else {
              SET_UNIT(i, "RSZ_TL", M[i], "h", DIST.y, M[i].aB || 0, ELE);
            }
          }
          // Lock on Top
          else {
            // @ts-ignore
            if (M[i].y > locks.t) {
              SET_UNIT(i, "RSZ_TL", M[i], "h", DIST.y, M[i].aB || 0, ELE);
            }
            // @ts-ignore
            if (M[i].y + M[i].h > locks.b) {
              SET_UNIT(i, "RSZ_BR", M[i], "h", DIST.y, M[i].aB || 0, ELE);
            }
          }
        }
        // Lock on Top
        else if (typeof locks.t !== "undefined") {
          // @ts-ignore
          if (M[i].y > locks.t) {
            SET_UNIT(i, "RSZ_TL", M[i], "h", DIST.y, M[i].aB || 0, ELE);
          } else {
            SET_UNIT(i, "RSZ_BR", M[i], "h", DIST.y, M[i].aB || 0, ELE);
          }
        }
        // No Lock on Top or Bottom
        else {
          /*
          if (DIST.y < 0) {
            M[i].l.b = M[i].y + M[i].h;
            M[i].c.b.forEach((i) => {
              if (!M[i].l.t) {
                M[i].l.t = M[i].y;
              }
            });
          }*/
          SET_UNIT(i, "MOVE", M[i], "h", DIST.y, M[i].aB || 0, ELE);
        }
      }
    }

    // Set updated flag
    M[i].updated = true;

    // Modify connected units
    GET_CONNECTED_UNITS(i)
      .filter((idx) => !M[idx].updated)
      .forEach((ii) => MODIFY(ii));
  }
};

// SET UNIT POSITION ANCHORS AND TRANSLATE COORDINATES
const SET_UNIT_ANCHORS = (i: number) => {
  const unit_tX = (M[i].x * 100) / M[i].w;
  const unit_tY = (M[i].y * 100) / M[i].h;
  const unit_aR = (M[i].w * unit_tX) / 100 + M[i].w;
  const unit_aB = (M[i].h * unit_tY) / 100 + M[i].h;

  Object.assign(M[i], { tX: unit_tX });
  Object.assign(M[i], { tY: unit_tY });
  Object.assign(M[i], { aR: unit_aR });
  Object.assign(M[i], { aB: unit_aB });
};

// UNIT PRESSED
const PRESS_UNIT = (ev: React.PointerEvent<HTMLDivElement>, i: number) => {
  ev.stopPropagation();
  ev.preventDefault();
  M.forEach((u, ii) => SET_UNIT_ANCHORS(ii));
  SELECTED_UNIT = i;
};

const TOGGLE_LOCK = (i: number, s: "t" | "r" | "b" | "l", temp?: boolean) => {
  const lock = temp ? M[i].tempL : M[i].l;

  if (lock) {
    if (typeof lock[s] !== "undefined") {
      lock[s] = undefined;
    } else if (s === "t") {
      lock[s] = M[i].y;
    } else if (s === "b") {
      lock[s] = M[i].y + M[i].h;
    } else if (s === "l") {
      lock[s] = M[i].x;
    } else if (s === "r") {
      lock[s] = M[i].x + M[i].w;
    }
    document.querySelector(`#U${i} .${s}`)?.classList.toggle("on");
  }
};

window.onload = () => {
  const root = document.getElementById("root") as HTMLDivElement;
  if (root) {
    root.addEventListener("pointermove", (e) => {
      if (SELECTED_UNIT > -1) {
        POINTER_POS = GET_POINTER_COORDS(root, e);
        MODIFY(SELECTED_UNIT);
        PREV_POINTER_POS = GET_POINTER_COORDS(root, e);
        M.forEach((u) => (u.updated = false));
      }
    });
    root.addEventListener("pointerup", (e) => {
      SELECTED_UNIT = -1;
      POINTER_POS = undefined;
      PREV_POINTER_POS = undefined;
      console.log(M);
    });
    root.addEventListener("pointerleave", (e) => {
      SELECTED_UNIT = -1;
      POINTER_POS = undefined;
      PREV_POINTER_POS = undefined;
      console.log(M);
    });
  }
};

// Save original w/h to oW/oH
M.forEach((u) => (u.oW = u.w) && (u.oH = u.h));

const A = (p: T) => (
  <div
    id={`U${p.i}`}
    className={`A ${p.bp.join(" ")}`}
    style={{
      transform: `translate(${(p.x * 100) / p.w}%,${(p.y * 100) / p.h}%)`,
      width: `${p.w}%`,
      height: `${p.h}%`,
      zIndex: p.z,
    }}
    onPointerDown={(ev) =>
      PRESS_UNIT(ev, typeof p.i !== "undefined" ? p.i : -1)
    }
  >
    {
      // quickly testing...
      [
        { top: 0, left: 0, right: 0 },
        { right: 0, top: 0, bottom: 0 },
        { bottom: 0, right: 0, left: 0 },
        { left: 0, top: 0, bottom: 0 },
      ].map((pos, idx) => {
        const sides = ["t", "r", "b", "l"];
        const side = sides[idx] as "t" | "r" | "b" | "l";
        return (
          <div
            key={idx}
            className={`lock ${side} ${
              typeof p.l[side] !== "undefined" ? "on" : ""
            }`}
            style={pos}
            onClick={(ev) => {
              ev.stopPropagation();
              ev.preventDefault();
              typeof p.i !== "undefined" && TOGGLE_LOCK(p.i, side);
            }}
          ></div>
        );
      })
    }
  </div>
);

export default A;
