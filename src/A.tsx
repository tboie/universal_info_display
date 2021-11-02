import "./A.css";
import M, { T, T_SIDE, T_LOCK } from "./M";
import { useEffect } from "react";

// UNIVERSAL RESPONSIVE DASHBOARD DESIGNER - POC v1 (something to work with)

let SELECTED_UNIT = -1;
let SELECTED_CORNER: undefined | "tr" | "tl" | "br" | "bl" = undefined;
let POINTER_POS: undefined | { x: number; y: number } = undefined;
let POINTER_PREV_POS: undefined | { x: number; y: number } = undefined;
let POINTER_MOVE_TYPE: "RSZ" | "MOVE" | undefined = undefined;
let RESIZE_OBSERVERS: ResizeObserver[] = [];

const GET_POINTER_COORDS = (root: HTMLDivElement, ev: any) => {
  const R = root.getBoundingClientRect();
  return {
    x: R ? (ev.pageX / R.width) * 100 : 0,
    y: R ? (ev.pageY / R.height) * 100 : 0,
  };
};

const SET_SELECTED_CORNER = (i: number) => {
  const BOUNDARY_X = M[i].w * 0.25;
  const BOUNDARY_Y = M[i].h * 0.25;

  SELECTED_CORNER = undefined;
  if (POINTER_POS) {
    if (POINTER_POS.x < M[i].x + BOUNDARY_X) {
      if (POINTER_POS.y < M[i].y + BOUNDARY_Y) {
        SELECTED_CORNER = "tl";
      } else if (POINTER_POS.y > M[i].y + M[i].h - BOUNDARY_Y) {
        SELECTED_CORNER = "bl";
      }
    } else if (POINTER_POS.x > M[i].x + M[i].w - BOUNDARY_X) {
      if (POINTER_POS.y > M[i].y + M[i].h - BOUNDARY_Y) {
        SELECTED_CORNER = "br";
      } else if (POINTER_POS.y < M[i].y + BOUNDARY_Y) {
        SELECTED_CORNER = "tr";
      }
    }

    if (!SELECTED_CORNER) {
      POINTER_MOVE_TYPE = "MOVE";
    } else {
      POINTER_MOVE_TYPE = "RSZ";
    }
  }
};

const GET_DISTANCE = (x1: number, y1: number, x2: number, y2: number) => ({
  x: x1 - x2,
  y: y1 - y2,
});

const SAVE = (i: number, u: T) => Object.assign(M[i], u);

const GET_CONNECTED_UNITS = (i: number, s?: T_SIDE, r?: boolean) => {
  let units: number[] = [];
  if (s) {
    M[i].c[s].forEach((u) => {
      // right and left direction, not in corner
      if (s === "r" || s === "l") {
        if (!M[i].c.t.includes(u) && !M[i].c.b.includes(u)) {
          units.push(u);
          if (r) {
            units = units.concat(GET_CONNECTED_UNITS(u, s, r));
          }
        }
      }
      // top and bottom direction, not in corner
      else if (s === "t" || s === "b") {
        if (!M[i].c.r.includes(u) && !M[i].c.l.includes(u)) {
          units.push(u);
          if (r) {
            units = units.concat(GET_CONNECTED_UNITS(u, s, r));
          }
        }
      }
    });
  } else {
    for (const [key, value] of Object.entries(M[i].c)) {
      value.forEach((ii) => {
        if (!units.includes(ii)) {
          units.push(ii);
          if (r) {
            units = units.concat(GET_CONNECTED_UNITS(ii, key as T_SIDE, r));
          }
        }
      });
    }
  }
  return units;
};

const SET_UNIT = (
  i: number,
  t: "RSZ_BR" | "RSZ_TL" | "MOVE",
  u: T,
  dim: "w" | "h",
  d: number,
  a: number
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

  const ele = document.getElementById(`U${i}`) as HTMLElement;
  if (ele) {
    dim === "w"
      ? (ele.style.width = u.w + "%")
      : (ele.style.height = u.h + "%");
    ele.style.transform = `translate(${u.tX}%,${u.tY}%)`;
  }

  SAVE(i, u);
};

const SET_UNIT_RESIZE_LOCKS = (
  i: number,
  corner: "tl" | "tr" | "br" | "bl"
) => {
  let bY: "t" | "r" | "b" | "l" = corner[0] === "t" ? "b" : "t";
  let bX: "t" | "r" | "b" | "l" = corner[1] === "r" ? "l" : "r";

  TOGGLE_UNIT_LOCKS(i, [bY], true, true);
  GET_CONNECTED_UNITS(i, bY, true).forEach((u) => {
    TOGGLE_UNIT_LOCKS(u, ["t", "b", "l", "r"], true, true);

    GET_CONNECTED_UNITS(u, "l", true).forEach((uu) => {
      TOGGLE_UNIT_LOCKS(uu, ["t", "b", "l", "r"], true, true);
    });
    GET_CONNECTED_UNITS(u, "r", true).forEach((uu) => {
      TOGGLE_UNIT_LOCKS(uu, ["t", "b", "l", "r"], true, true);
    });
  });

  TOGGLE_UNIT_LOCKS(i, [bX], true, true);
  GET_CONNECTED_UNITS(i, bX, true).forEach((u) => {
    TOGGLE_UNIT_LOCKS(u, ["l", "r", "t", "b"], true, true);

    GET_CONNECTED_UNITS(u, "t", true).forEach((uu) => {
      TOGGLE_UNIT_LOCKS(uu, ["l", "r", "t", "b"], true, true);
    });
    GET_CONNECTED_UNITS(u, "b", true).forEach((uu) => {
      TOGGLE_UNIT_LOCKS(uu, ["l", "r", "t", "b"], true, true);
    });
  });

  GET_CONNECTED_UNITS(i, corner[0] as T_SIDE, true).forEach((u) => {
    TOGGLE_UNIT_LOCKS(u, [corner[1] === "l" ? "r" : "l"], true, true);
  });
  GET_CONNECTED_UNITS(i, corner[1] as T_SIDE, true).forEach((u) => {
    TOGGLE_UNIT_LOCKS(u, [corner[0] === "t" ? "b" : "t"], true, true);
  });
};

const GET_OPPOSITE_SIDE = (s: T_SIDE) => {
  if (s === "t") {
    return "b";
  } else if (s === "r") {
    return "l";
  } else if (s === "l") {
    return "r";
  } else {
    return "t";
  }
};

const SET_CONNECTIONS = (i: number) => {
  M.forEach((u) => {
    if (u.i !== i) {
      // disconnection
      if (GET_CONNECTED_UNITS(i).includes(u.i)) {
        if (UNIT_TOUCHES(M[i], M[u.i]).length === 0) {
          (["t", "r", "b", "l"] as T_SIDE[]).forEach((s) => {
            if (M[i].c[s].includes(u.i)) {
              M[i].c[s].splice(M[i].c[s].indexOf(u.i), 1);
            }
            if (M[u.i].c[s].includes(i)) {
              M[u.i].c[s].splice(M[u.i].c[s].indexOf(i), 1);
            }
          });
        }
      }
      // new connection
      else {
        UNIT_TOUCHES(M[i], M[u.i]).forEach((s) => {
          const os = GET_OPPOSITE_SIDE(s);
          M[i].c[s].push(u.i);
          if (!M[u.i].c[os].includes(i)) {
            M[u.i].c[os].push(i);
          }
        });
      }
    }
  });
};

const MODIFY = (i: number, DIST: { x: number; y: number }, SET: boolean) => {
  const locks = M[i].tempL || {};
  let type: "RSZ_TL" | "RSZ_BR" | "MOVE" | "" = "";

  // Mouse Moving Left/Right
  // Lock on Right, No Lock Left
  if (locks.r && !locks.l) {
    type = "RSZ_TL";

    if (M[i].w - DIST.x > M[i].maxW) {
      DIST.x += M[i].w - DIST.x - M[i].maxW;
    } else if (M[i].w - DIST.x < M[i].minW) {
      DIST.x += M[i].w - DIST.x - M[i].minW;
    }
  }
  // Lock on Left, No Lock on Right
  else if (locks.l && !locks.r) {
    type = "RSZ_BR";

    if (M[i].w + DIST.x > M[i].maxW) {
      DIST.x -= M[i].w + DIST.x - M[i].maxW;
    } else if (M[i].w + DIST.x < M[i].minW) {
      DIST.x -= M[i].w + DIST.x - M[i].minW;
    }
  }
  // No Lock Left or Right
  else if (!locks.l && !locks.r) {
    type = "MOVE";
  }

  if (type && SET) {
    SET_UNIT(i, type, M[i], "w", DIST.x, M[i].aR || 0);
  }

  type = "";
  // Mouse Moving Up/Down
  // Lock on Bottom, No Lock on Top
  if (locks.b && !locks.t) {
    type = "RSZ_TL";

    if (M[i].h - DIST.y > M[i].maxH) {
      DIST.y += M[i].h - DIST.y - M[i].maxH;
    } else if (M[i].h - DIST.y < M[i].minH) {
      DIST.y += M[i].h - DIST.y - M[i].minH;
    }
  }
  // Lock on Top, No Lock on Bottonm
  else if (locks.t && !locks.b) {
    type = "RSZ_BR";

    if (M[i].h + DIST.y > M[i].maxH) {
      DIST.y -= M[i].h + DIST.y - M[i].maxH;
    } else if (M[i].h + DIST.y < M[i].minH) {
      DIST.y -= M[i].h + DIST.y - M[i].minH;
    }
  }
  // No Lock on Top or Bottom
  else if (!locks.b && !locks.t) {
    type = "MOVE";
  }

  if (type && SET) {
    SET_UNIT(i, type, M[i], "h", DIST.y, M[i].aB || 0);
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
const PRESS_UNIT = (i: number, ele: HTMLElement) => {
  M.forEach((u, ii) => SET_UNIT_ANCHORS(ii));
  M.forEach((u, ii) => (M[ii].tempL = JSON.parse(JSON.stringify(M[ii].l))));

  const root = document.getElementById("root") as HTMLDivElement;
  if (root) {
    POINTER_POS = GET_POINTER_COORDS(root, ele);
    SET_SELECTED_CORNER(i);

    if (SELECTED_CORNER && POINTER_MOVE_TYPE === "RSZ") {
      // SET_UNIT_RESIZE_LOCKS(i, SELECTED_CORNER);
    }
  }
  ele.style.zIndex = "9999";
  ele.classList.add("selected");

  SELECTED_UNIT = i;
};

const TOGGLE_UNIT_LOCKS = (
  i: number,
  sides: ("t" | "r" | "b" | "l")[],
  temp?: boolean,
  on?: boolean
) => {
  const lock = temp ? M[i].tempL : M[i].l;
  if (lock) {
    sides.forEach((s) => {
      if ((lock[s] && !on) || on === false) {
        lock[s] = false;
      } else if (on || !lock[s]) {
        lock[s] = true;
      }
      const ele = document.querySelector(`#U${i} .${s}`)?.classList;
      if (ele && !temp) {
        lock[s] ? ele.add("on") : ele.remove("on");
      }
    });
  }
};

const RESET_POINTER = () => {
  const eleU = document.getElementById("U" + SELECTED_UNIT) as HTMLElement;
  if (eleU) {
    eleU.style.zIndex = M[SELECTED_UNIT].z.toString();
  }
  M.forEach((u, ii) => {
    M[u.i].d = undefined;
    TOGGLE_UNIT_LOCKS(ii, ["t", "r", "b", "l"], true, false);
    document.querySelector(`#U${u.i}`)?.classList.remove("selected");
  });
  SELECTED_UNIT = -1;
  SELECTED_CORNER = undefined;
  POINTER_POS = undefined;
  POINTER_PREV_POS = undefined;
  POINTER_MOVE_TYPE = undefined;
  console.log(M);
};

// unit b touches a
const UNIT_TOUCHES = (a: T, b: T) => {
  let sides: T_SIDE[] = [];

  // has horizontal gap
  if (a.x > b.x + b.w || b.x > a.x + a.w) return [];
  // has vertical gap
  if (a.y > b.y + b.h || b.y > a.y + a.h) return [];

  // TODO: verify
  if (a.x < b.x) {
    sides.push("r");
  }
  if (a.y < b.y) {
    sides.push("b");
  }
  if (b.y < a.y) {
    sides.push("t");
  }
  if (b.x < a.x) {
    sides.push("l");
  }

  return sides;
};

const REMOVE_ALL_CONNECTIONS = (i: number) => {
  M[i].c = { t: [], r: [], b: [], l: [] };
  // remove from all other unit connections
  M.forEach((u) => {
    for (const [key, value] of Object.entries(u.c)) {
      const idx = M[u.i]?.c[key as T_SIDE].indexOf(i);
      if (idx > -1) {
        M[u.i].c[key as T_SIDE].splice(idx, 1);
      }
    }
  });
};

const ADD_RESIZE_OBSERVER = (i: number) => {
  // Unit Dimensions Text Resize Observer
  RESIZE_OBSERVERS.push(
    new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          const span = entry.target.querySelectorAll(".dimension");
          if (span.length) {
            span[0].innerHTML = `${entry.contentRect.width.toFixed(2)}`;
            span[1].innerHTML = `${entry.contentRect.height.toFixed(2)}`;
          }
        }
      }
    })
  );
  const ele = document.getElementById("U" + i);
  if (ele) {
    RESIZE_OBSERVERS[i].observe(ele);
  }
};

const REMOVE_RESIZE_OBSERVER = (i: number) => {
  const ele = document.getElementById("U" + i);
  if (ele) {
    RESIZE_OBSERVERS[i].disconnect();
    RESIZE_OBSERVERS[i].unobserve(ele);
  }
};

export const ADD_UNIT = (U: T) => {
  M.push(U);
  SET_CONNECTIONS(U.i);
  return M[M.length - 1];
};

// Cuts Unit Width by 1/2, Adds new unit as other 1/2
// Returns new unit
export const SPLIT_UNIT = (i: number) => {
  REMOVE_ALL_CONNECTIONS(i);
  // Reduce width by 1/2
  SET_UNIT(i, "RSZ_BR", M[i], "w", (M[i].w / 2) * -1, M[i].aR || 0);
  TOGGLE_UNIT_LOCKS(i, ["r"], false, false);
  return ADD_UNIT({
    ...M[i],
    i: M.length,
    t: "s",
    x: M[i].x + M[i].w,
    l: {
      l: false,
      r: Math.ceil(M[i].x + M[i].w + M[i].w) >= 100,
      t: M[i].y <= 0,
      b: Math.ceil(M[i].y + M[i].h) >= 100,
    },
    c: {
      t: [] as number[],
      r: [] as number[],
      b: [] as number[],
      l: [] as number[],
    },
    bp: M[i].bp,
  });
};

export const REMOVE_UNIT = (i: number) => {
  REMOVE_ALL_CONNECTIONS(i);

  /* for now, it's just removed from dom using state
     and data connections, then a deleted flag is set.
     many functions reference the units by array index.
   */

  M[i].deleted = true;
  //M.splice(i, 1);
};

window.onload = () => {
  const root = document.getElementById("root") as HTMLDivElement;
  if (root) {
    root.addEventListener("pointermove", (e) => {
      if (SELECTED_UNIT > -1) {
        POINTER_POS = GET_POINTER_COORDS(root, e);
        if (POINTER_POS && POINTER_PREV_POS) {
          const DIST = GET_DISTANCE(
            POINTER_POS.x,
            POINTER_POS.y,
            POINTER_PREV_POS.x,
            POINTER_PREV_POS.y
          );

          const UNITS = M.filter(
            (u) => !u.deleted && Object.assign(M[u.i], { d: { ...DIST } })
          );
          UNITS.forEach((u) => u.d && MODIFY(u.i, u.d, false));
          UNITS.forEach((u) => u.d && MODIFY(u.i, u.d, true));
        }
        POINTER_PREV_POS = GET_POINTER_COORDS(root, e);
      }
    });
    root.addEventListener("pointerup", (e) => {
      RESET_POINTER();
    });
    root.addEventListener("pointerleave", (e) => {
      RESET_POINTER();
    });
  }
};

// Save original w/h to oW/oH
// TODO: implement
// M.forEach((u) => (u.oW = u.w) && (u.oH = u.h));

const U = (
  p: T & { remove: (i: number) => void; split: (i: number) => void }
) => {
  useEffect(() => {
    ADD_RESIZE_OBSERVER(p.i);
    return () => REMOVE_RESIZE_OBSERVER(p.i);
  }, []);

  return (
    <div
      id={`U${p.i}`}
      className={`U ${p.bp.join(" ")}`}
      style={{
        transform: `translate(${(p.x * 100) / p.w}%,${(p.y * 100) / p.h}%)`,
        width: `${p.w}%`,
        height: `${p.h}%`,
        zIndex: p.z,
      }}
      onPointerDown={(ev) => {
        ev.stopPropagation();
        ev.preventDefault();
        PRESS_UNIT(p.i, ev.currentTarget);
      }}
    >
      <span className="dimension" />
      <span className="dimension" />

      <span
        className="split"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          p.split(p.i);
        }}
      >
        SPLT
      </span>
      <span
        className="delete"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          p.remove(p.i);
        }}
      >
        DEL
      </span>
      {
        // quickly testing...
        [
          { top: 0, left: 0, right: 0 },
          { right: 0, top: 0, bottom: 0 },
          { bottom: 0, right: 0, left: 0 },
          { left: 0, top: 0, bottom: 0 },
        ].map((pos, idx) => {
          const sides = ["t", "r", "b", "l"];
          const side = sides[idx] as T_SIDE;
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
                TOGGLE_UNIT_LOCKS(p.i, [side]);
              }}
            ></div>
          );
        })
      }
    </div>
  );
};

export default U;
