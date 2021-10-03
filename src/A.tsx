import S from "./A.module.scss";
import M, { T } from "./M";

// UNIVERSAL RESPONSIVE DASHBOARD DESIGNER - POC v1 (something to work with)
// TODO:
//  1) FIX
//  2) ORGANIZE
//  3) IMPLEMENT SIDE LOCKS

let POINTER_POS: undefined | { x: number; y: number } = undefined;
let PREV_POINTER_POS: undefined | { x: number; y: number } = undefined;
let SELECTED = "";
const RSZ_AREA_MIN = 25,
  RSZ_AREA_MAX = 75;

// TODO: USE ROOT DIV FUNCTIONALITY/COORDS FOR POINTER DATA
window.onload = () => {
  document.getElementById("root")?.addEventListener("pointermove", (e) => {});
  document.getElementById("root")?.addEventListener("pointerup", (e) => {});
};

const A = (p: T) => {
  let { i, t, x, y, w, h, z, c, bp, aB, aR, tX, tY } = p;

  const GET_DISTANCE = (x1: number, y1: number, x2: number, y2: number) => ({
    x: x1 - x2,
    y: y1 - y2,
  });

  const GET_POINTER_COORDS = (ev: React.PointerEvent<HTMLDivElement>) => {
    const R = document.getElementById("root")?.getBoundingClientRect();
    return {
      x: R ? ((ev.pageX - R.left) / R.width) * 100 : 0,
      y: R ? ((ev.pageY - R.top) / R.height) * 100 : 0,
    };
  };

  const SAVE = (i: number, u: T) => Object.assign(M[i], u);

  const GET_CONNECTED_UNITS = () => {
    let ret: number[] = [];

    if (SELECTED) {
      ret.push(parseInt(SELECTED));
      const conns = M[parseInt(SELECTED)].c;
      if (conns) {
        for (const [key, value] of Object.entries(conns)) {
          if (value.length) {
            value.forEach((v) => !ret.includes(v) && ret.push(v));
          }
        }
      }
    }
    return ret;
  };

  const SET_UNIT = (
    i: number,
    t: "RSZ_BR" | "RSZ_TL" | "MOVE",
    u: T,
    dim: "w" | "h",
    d: number,
    /*
    s1: "t" | "r",
    s2: "b" | "l",
    */
    a: number,
    ele: HTMLDivElement
  ) => {
    // bottom right
    if (t === "RSZ_BR") {
      dim === "w"
        ? (u.w += d) && (u.tX = (u.x / u.w) * 100)
        : (u.h += d) && (u.tY = (u.y / u.h) * 100);
    }
    // top left
    else if (t === "RSZ_TL") {
      dim === "w"
        ? (u.w -= d) && (u.x = a - u.w) && (u.tX = ((a - u.w) / u.w) * 100)
        : (u.h -= d) && (u.y = a - u.h) && (u.tY = ((a - u.h) / u.h) * 100);
    }
    // move
    /*
      else if (
        (d > 0 && !c[dim === "w" ? s1 : s2].length) ||
        (d < 0 && !c[dim === "w" ? s2 : s1].length)
      ) {
        dim === "w" ? (tX = ((x += d) * 100) / w) : (tY = ((y += d) * 100) / h);
      }
      */

    dim === "w"
      ? (ele.style.width = u.w + "%")
      : (ele.style.height = u.h + "%");
    ele.style.transform = `translate(${u.tX}%,${u.tY}%)`;
    SAVE(i, u);
  };

  const MODIFY = (ev: React.PointerEvent<HTMLDivElement>) => {
    const ROOT = document.getElementById("root");
    if (ev.currentTarget.id !== "root" && ROOT) {
      POINTER_POS = GET_POINTER_COORDS(ev);
      if (POINTER_POS && PREV_POINTER_POS) {
        GET_CONNECTED_UNITS().forEach((v) => {
          if (POINTER_POS && PREV_POINTER_POS) {
            const DIST = GET_DISTANCE(
              POINTER_POS.x,
              POINTER_POS.y,
              PREV_POINTER_POS.x,
              PREV_POINTER_POS.y
            );

            const mX = ((POINTER_POS.x - M[v].x) / M[v].w) * 100;
            const mY = ((POINTER_POS.y - M[v].y) / M[v].h) * 100;
            const ELE = document.getElementById(v.toString()) as HTMLDivElement;

            // TODO: MAKE THIS WORK
            if (ELE) {
              if (DIST.x !== 0 && mX <= M[v].x + RSZ_AREA_MIN) {
                SET_UNIT(v, "RSZ_TL", M[v], "w", DIST.x, M[v].aR || 0, ELE);
              }
              if (DIST.y !== 0 && mY <= M[v].y + RSZ_AREA_MIN) {
                SET_UNIT(v, "RSZ_TL", M[v], "h", DIST.y, M[v].aB || 0, ELE);
              }
              if (DIST.x !== 0 && mX >= M[v].x + M[v].w - RSZ_AREA_MAX) {
                SET_UNIT(v, "RSZ_BR", M[v], "w", DIST.x, M[v].aR || 0, ELE);
              }
              if (DIST.y !== 0 && mY >= M[v].y + M[v].h - RSZ_AREA_MAX) {
                SET_UNIT(v, "RSZ_BR", M[v], "h", DIST.y, M[v].aB || 0, ELE);
              }
            }
          }
        });
      }
      PREV_POINTER_POS = GET_POINTER_COORDS(ev);
    }
  };

  const STOP_PRESS = (ev: React.PointerEvent<HTMLDivElement>) => {
    ev.stopPropagation();
    ev.preventDefault();
  };

  return (
    <div
      id={`${i}`}
      className={`${S.A} ${bp.map((bp) => S[bp]).join(" ")}`}
      style={{
        transform: `translate(${(x * 100) / w}%,${(y * 100) / h}%)`,
        width: `${w}%`,
        height: `${h}%`,
        zIndex: z,
      }}
      onPointerDown={(ev) => {
        STOP_PRESS(ev);

        if (typeof i !== "undefined") {
          PREV_POINTER_POS = undefined;
          SELECTED = `${i}`;
          GET_CONNECTED_UNITS().forEach((v) => {
            // SET ANCHORS AND TRANSLATE VALS TO DATA
            // TODO: OPTIMIZE?
            const unit_tX = (M[v].x * 100) / M[v].w;
            const unit_tY = (M[v].y * 100) / M[v].h;
            const unit_aR = (M[v].w * unit_tX) / 100 + M[v].w;
            const unit_aB = (M[v].h * unit_tY) / 100 + M[v].h;

            Object.assign(M[v], { tX: unit_tX });
            Object.assign(M[v], { tY: unit_tY });
            Object.assign(M[v], { aR: unit_aR });
            Object.assign(M[v], { aB: unit_aB });
          });
        }
      }}
      // USE ROOT DIV LISTENER EVENTS INSTEAD
      onPointerUp={(ev) => {
        STOP_PRESS(ev);
        SELECTED = "";
        PREV_POINTER_POS = undefined;
      }}
      onPointerLeave={() => SELECTED && (SELECTED = "")}
      onPointerMove={(ev) => SELECTED === ev.currentTarget.id && MODIFY(ev)}
    />
  );
};

export default A;
