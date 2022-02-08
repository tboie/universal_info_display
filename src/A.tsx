import "./A.css";
import D, { T, T_SIDE } from "./D";
import { useEffect, useState } from "react";
import { debounce } from "ts-debounce";

// UNIVERSAL RESPONSIVE DASHBOARD DESIGNER - POC v1 (something to work with)

const CORNER_SIZE = 0.25;

export let MODIFY_ALL_UNITS = false;
export const TOGGLE_MODIFY_ALL_UNITS = () =>
  (MODIFY_ALL_UNITS = !MODIFY_ALL_UNITS);

const POINTER_SNAP_THRESHOLD = 2.5;

let POINTER_MOVE_TYPE: "RSZ" | "MOVE" | undefined = undefined;
let POINTER_POS: undefined | { x: number; y: number } = undefined;
let POINTER_PREV_POS: undefined | { x: number; y: number } = undefined;
let POINTER_PRESS_POS: undefined | { x: number; y: number } = undefined;
let POINTER_SNAP_TRIGGER = false;

export let RESIZE_OBSERVERS: ResizeObserver[] = [];
export const RESET_RESIZE_OBSERVERS = () => (RESIZE_OBSERVERS = []);

let SELECTED_UNIT = -1;
let SELECTED_CORNER: undefined | "tr" | "tl" | "br" | "bl" = undefined;

const GET_POINTER_COORDS = (root: HTMLDivElement, ev: any) => {
  const R = root.getBoundingClientRect();
  return {
    x: R ? (ev.pageX / R.width) * 100 : 0,
    y: R ? (ev.pageY / R.height) * 100 : 0,
  };
};

const SET_SELECTED_CORNER = (i: number) => {
  const BOUNDARY_X = D[i].w * CORNER_SIZE;
  const BOUNDARY_Y = D[i].h * CORNER_SIZE;

  SELECTED_CORNER = undefined;
  if (POINTER_POS) {
    if (POINTER_POS.x < D[i].x + BOUNDARY_X) {
      if (POINTER_POS.y < D[i].y + BOUNDARY_Y) {
        SELECTED_CORNER = "tl";
      } else if (POINTER_POS.y > D[i].y + D[i].h - BOUNDARY_Y) {
        SELECTED_CORNER = "bl";
      }
    } else if (POINTER_POS.x > D[i].x + D[i].w - BOUNDARY_X) {
      if (POINTER_POS.y > D[i].y + D[i].h - BOUNDARY_Y) {
        SELECTED_CORNER = "br";
      } else if (POINTER_POS.y < D[i].y + BOUNDARY_Y) {
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

const SAVE = (i: number, u: T) => Object.assign(D[i], u);

const GET_CONNECTED_UNITS = (i: number, s?: T_SIDE, r?: boolean) => {
  let units: number[] = [];
  if (s) {
    D[i].c[s].forEach((u) => {
      // right and left direction, not in corner
      if (s === "r" || s === "l") {
        if (!D[i].c.t.includes(u) && !D[i].c.b.includes(u)) {
          units.push(u);
          if (r) {
            units = units.concat(GET_CONNECTED_UNITS(u, s, r));
          }
        }
      }
      // top and bottom direction, not in corner
      else if (s === "t" || s === "b") {
        if (!D[i].c.r.includes(u) && !D[i].c.l.includes(u)) {
          units.push(u);
          if (r) {
            units = units.concat(GET_CONNECTED_UNITS(u, s, r));
          }
        }
      }
    });
  } else {
    for (const [key, value] of Object.entries(D[i].c)) {
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
  SET_UNIT_ANCHORS(i);
};

const SET_UNIT_RESIZE_LOCKS = (
  i: number,
  corner: "tl" | "tr" | "br" | "bl",
  all?: boolean
) => {
  const oY: "t" | "r" | "b" | "l" = corner[0] === "b" ? "t" : "b";

  // lock seleced unit from opposite Y
  TOGGLE_UNIT_LOCKS(i, [oY], true, true);

  if (all) {
    // all left/right units have opposite Y locked
    GET_CONNECTED_UNITS(i, "l", true).forEach((u) => {
      TOGGLE_UNIT_LOCKS(u, [oY], true, true);
    });
    GET_CONNECTED_UNITS(i, "r", true).forEach((u) => {
      TOGGLE_UNIT_LOCKS(u, [oY], true, true);
    });

    // all opposite units opposite Y have t/b locked
    GET_CONNECTED_UNITS(i, oY, true).forEach((u) => {
      TOGGLE_UNIT_LOCKS(u, ["t", "b"], true, true);

      GET_CONNECTED_UNITS(u, "l", true).forEach((uu) => {
        TOGGLE_UNIT_LOCKS(uu, ["t", "b"], true, true);
      });
      GET_CONNECTED_UNITS(u, "r", true).forEach((uu) => {
        TOGGLE_UNIT_LOCKS(uu, ["t", "b"], true, true);
      });
    });
  }

  const oX: "t" | "r" | "b" | "l" = corner[1] === "r" ? "l" : "r";

  // lock seleced unit from opposite X
  TOGGLE_UNIT_LOCKS(i, [oX], true, true);

  if (all) {
    // all left/right units have opposite X locked
    GET_CONNECTED_UNITS(i, "t", true).forEach((u) => {
      TOGGLE_UNIT_LOCKS(u, [oX], true, true);
    });
    GET_CONNECTED_UNITS(i, "b", true).forEach((u) => {
      TOGGLE_UNIT_LOCKS(u, [oX], true, true);
    });

    // all opposite units opposite X have r/l locked
    GET_CONNECTED_UNITS(i, oX, true).forEach((u) => {
      TOGGLE_UNIT_LOCKS(u, ["l", "r"], true, true);

      GET_CONNECTED_UNITS(u, "t", true).forEach((uu) => {
        TOGGLE_UNIT_LOCKS(uu, ["l", "r"], true, true);
      });
      GET_CONNECTED_UNITS(u, "b", true).forEach((uu) => {
        TOGGLE_UNIT_LOCKS(uu, ["l", "r"], true, true);
      });
    });
  }
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
  D.forEach((u) => {
    if (u.i !== i) {
      // disconnection
      if (GET_CONNECTED_UNITS(i).includes(u.i)) {
        if (UNIT_TOUCHES(D[i], D[u.i]).length === 0) {
          (["t", "r", "b", "l"] as T_SIDE[]).forEach((s) => {
            if (D[i].c[s].includes(u.i)) {
              D[i].c[s].splice(D[i].c[s].indexOf(u.i), 1);
            }
            if (D[u.i].c[s].includes(i)) {
              D[u.i].c[s].splice(D[u.i].c[s].indexOf(i), 1);
            }
          });
        }
      }
      // new connection
      else {
        UNIT_TOUCHES(D[i], D[u.i]).forEach((s) => {
          const os = GET_OPPOSITE_SIDE(s);
          D[i].c[s].push(u.i);
          if (!D[u.i].c[os].includes(i)) {
            D[u.i].c[os].push(i);
          }
        });
      }
    }
  });
};

const RESIZE_UNIT = (u: T, dim: "w" | "h", val: number) => {
  if (val >= 0 && (dim === "w" ? D[u.i].x : D[u.i].y) + val <= 100) {
    Object.assign(D[u.i], dim === "w" ? { w: val } : { h: val });
    REMOVE_ALL_CONNECTIONS(u.i);
    SET_UNIT_ANCHORS(u.i);
    SET_UNIT(u.i, "RSZ_BR", D[u.i], dim, 0, (dim === "w" ? u.aR : u.aB) || 0);
    SET_CONNECTIONS(u.i);
  }
};

const MODIFY = (
  i: number,
  P_DIST: { x: number; y: number },
  TYPE: "DIST" | "SET" | "LOCKS_ON" | "LOCKS_OFF"
) => {
  const locks = D[i].tempL || {};
  let type: "RSZ_TL" | "RSZ_BR" | "MOVE" | "" = "";
  let DIST = { ...P_DIST };

  // min/max lock toggles
  if (TYPE === "LOCKS_ON" || "LOCKS_OFF") {
    if (D[i].w === D[i].minW || D[i].w === D[i].maxW) {
      if (locks.l && !locks.r) {
        TOGGLE_UNIT_LOCKS(i, ["r"], true, TYPE === "LOCKS_ON");

        GET_CONNECTED_UNITS(i, "r").forEach((u) => {
          TOGGLE_UNIT_LOCKS(u, ["l"], true, TYPE === "LOCKS_ON");
        });
      } else if (!locks.l && locks.r) {
        TOGGLE_UNIT_LOCKS(i, ["l"], true, TYPE === "LOCKS_ON");

        GET_CONNECTED_UNITS(i, "l").forEach((u) => {
          TOGGLE_UNIT_LOCKS(u, ["r"], true, TYPE === "LOCKS_ON");
        });
      }
    }

    if (D[i].h === D[i].minH || D[i].h === D[i].maxH) {
      if (locks.t && !locks.b) {
        TOGGLE_UNIT_LOCKS(i, ["b"], true, TYPE === "LOCKS_ON");

        GET_CONNECTED_UNITS(i, "b").forEach((u) => {
          TOGGLE_UNIT_LOCKS(u, ["t"], true, TYPE === "LOCKS_ON");
        });
      } else if (!locks.t && locks.b) {
        TOGGLE_UNIT_LOCKS(i, ["t"], true, TYPE === "LOCKS_ON");

        GET_CONNECTED_UNITS(i, "t").forEach((u) => {
          TOGGLE_UNIT_LOCKS(u, ["b"], true, TYPE === "LOCKS_ON");
        });
      }
    }
  }

  // Mouse Moving Left/Right
  // Lock on Right, No Lock Left
  if (locks.r && !locks.l) {
    type = "RSZ_TL";

    if (TYPE === "DIST") {
      if (D[i].w - DIST.x > D[i].maxW) {
        DIST.x += D[i].w - DIST.x - D[i].maxW;
      } else if (D[i].w - DIST.x < D[i].minW) {
        DIST.x += D[i].w - DIST.x - D[i].minW;
      } else if (!MODIFY_ALL_UNITS && i === SELECTED_UNIT && DIST.x < 0) {
        D.some((u) => {
          if (!u.deleted) {
            const isTouching = UNIT_TOUCHES(D[i], D[u.i]).includes("l");
            const willTouch = UNIT_TOUCHES(
              { ...D[i], x: D[i].x + DIST.x - POINTER_SNAP_THRESHOLD },
              D[u.i]
            ).includes("l");

            if (!isTouching && willTouch) {
              DIST.x = 0;
              DIST.y = 0;
              const diff = D[u.i].x + D[u.i].w - D[i].x;
              SET_UNIT(i, "RSZ_TL", D[i], "w", diff, D[i].aR || 0);
              Object.assign(POINTER_PRESS_POS, POINTER_POS);
              POINTER_SNAP_TRIGGER = true;
              return true;
            }
          }
          return false;
        });
      }

      if (D[i].x + DIST.x < 0) {
        DIST.x -= D[i].x + DIST.x;
      }
    }
  }
  // Lock on Left, No Lock on Right
  else if (locks.l && !locks.r) {
    type = "RSZ_BR";

    if (TYPE === "DIST") {
      if (D[i].w + DIST.x > D[i].maxW) {
        DIST.x -= D[i].w + DIST.x - D[i].maxW;
      } else if (D[i].w + DIST.x < D[i].minW) {
        DIST.x -= D[i].w + DIST.x - D[i].minW;
      } else if (!MODIFY_ALL_UNITS && i === SELECTED_UNIT && DIST.x > 0) {
        D.some((u) => {
          if (!u.deleted) {
            const isTouching = UNIT_TOUCHES(D[i], D[u.i]).includes("r");
            const willTouch = UNIT_TOUCHES(
              {
                ...D[i],
                w: D[i].w + DIST.x + POINTER_SNAP_THRESHOLD,
              },
              D[u.i]
            ).includes("r");

            if (!isTouching && willTouch) {
              DIST.x = 0;
              DIST.y = 0;
              const diff = D[u.i].x - (D[i].x + D[i].w);
              SET_UNIT(i, "RSZ_BR", D[i], "w", diff, D[i].aR || 0);
              Object.assign(POINTER_PRESS_POS, POINTER_POS);
              POINTER_SNAP_TRIGGER = true;
              return true;
            }
          }
          return false;
        });
      }

      if (D[i].x + D[i].w + DIST.x > 100) {
        DIST.x += 100 - (D[i].x + D[i].w + DIST.x);
      }
    }
  }
  // No Lock Left or Right
  else if (!locks.l && !locks.r) {
    type = "MOVE";

    if (TYPE === "DIST") {
      if (D[i].x + DIST.x < 0) {
        DIST.x -= D[i].x + DIST.x;
      }
      if (D[i].x + D[i].w + DIST.x > 100) {
        DIST.x += 100 - (D[i].x + D[i].w + DIST.x);
      }
    }
  }

  if (type && TYPE === "SET") {
    SET_UNIT(i, type, D[i], "w", DIST.x, D[i].aR || 0);
  }

  type = "";
  // Mouse Moving Up/Down
  // Lock on Bottom, No Lock on Top
  if (locks.b && !locks.t) {
    type = "RSZ_TL";

    if (TYPE === "DIST") {
      if (D[i].h - DIST.y > D[i].maxH) {
        DIST.y += D[i].h - DIST.y - D[i].maxH;
      } else if (D[i].h - DIST.y < D[i].minH) {
        DIST.y += D[i].h - DIST.y - D[i].minH;
      } else if (!MODIFY_ALL_UNITS && i === SELECTED_UNIT && DIST.y < 0) {
        D.some((u) => {
          if (!u.deleted) {
            const isTouching = UNIT_TOUCHES(D[i], D[u.i]).includes("t");
            const willTouch = UNIT_TOUCHES(
              { ...D[i], y: D[i].y + DIST.y - POINTER_SNAP_THRESHOLD },
              D[u.i]
            ).includes("t");

            if (!isTouching && willTouch) {
              DIST.y = 0;
              DIST.x = 0;
              const diff = D[u.i].y + D[u.i].h - D[i].y;
              SET_UNIT(i, "RSZ_TL", D[i], "h", diff, D[i].aB || 0);
              Object.assign(POINTER_PRESS_POS, POINTER_POS);
              POINTER_SNAP_TRIGGER = true;
              return true;
            }
          }
          return false;
        });
      }

      if (D[i].y + DIST.y < 0) {
        DIST.y -= D[i].y + DIST.y;
      }
    }
  }
  // Lock on Top, No Lock on Bottonm
  else if (locks.t && !locks.b) {
    type = "RSZ_BR";

    if (TYPE === "DIST") {
      if (D[i].h + DIST.y > D[i].maxH) {
        DIST.y -= D[i].h + DIST.y - D[i].maxH;
      } else if (D[i].h + DIST.y < D[i].minH) {
        DIST.y -= D[i].h + DIST.y - D[i].minH;
      } else if (!MODIFY_ALL_UNITS && i === SELECTED_UNIT && DIST.y > 0) {
        D.some((u) => {
          if (!u.deleted) {
            const isTouching = UNIT_TOUCHES(D[i], D[u.i]).includes("b");
            const willTouch = UNIT_TOUCHES(
              {
                ...D[i],
                h: D[i].h + DIST.y + POINTER_SNAP_THRESHOLD,
              },
              D[u.i]
            ).includes("b");

            if (!isTouching && willTouch) {
              DIST.y = 0;
              DIST.x = 0;
              const diff = D[u.i].y - (D[i].y + D[i].h);
              SET_UNIT(i, "RSZ_BR", D[i], "h", diff, D[i].aB || 0);
              Object.assign(POINTER_PRESS_POS, POINTER_POS);
              POINTER_SNAP_TRIGGER = true;
              return true;
            }
          }
          return false;
        });
      }

      if (D[i].y + D[i].h + DIST.y > 100) {
        DIST.y += 100 - (D[i].y + D[i].h + DIST.y);
      }
    }
  }
  // No Lock on Top or Bottom
  else if (!locks.b && !locks.t) {
    type = "MOVE";

    if (TYPE === "DIST") {
      if (D[i].y + DIST.y < 0) {
        DIST.y -= D[i].y + DIST.y;
      }
      if (D[i].y + D[i].h + DIST.y > 100) {
        DIST.y += 100 - (D[i].y + D[i].h + DIST.y);
      }
    }
  }

  if (type && TYPE === "SET") {
    SET_UNIT(i, type, D[i], "h", DIST.y, D[i].aB || 0);
  }

  if (TYPE === "DIST") {
    Object.assign(D[i], { d: DIST });

    if (DIST.x !== P_DIST.x || DIST.y !== P_DIST.y) {
      return true;
    }
  }

  return false;
};

// SET UNIT POSITION ANCHORS AND TRANSLATE COORDINATES
const SET_UNIT_ANCHORS = (i: number) => {
  const unit_tX = (D[i].x * 100) / D[i].w;
  const unit_tY = (D[i].y * 100) / D[i].h;
  const unit_aR = (D[i].w * unit_tX) / 100 + D[i].w;
  const unit_aB = (D[i].h * unit_tY) / 100 + D[i].h;

  Object.assign(D[i], { tX: unit_tX });
  Object.assign(D[i], { tY: unit_tY });
  Object.assign(D[i], { aR: unit_aR });
  Object.assign(D[i], { aB: unit_aB });
};

const SET_UNIT_ZINDEX = (i: number, pos: number | "top") => {
  if (pos === "top") {
    D.filter((u) => u.i !== i)
      .sort((a, b) => a.z - b.z)
      .forEach((u, idx) => {
        Object.assign(u, { z: idx + 1 });
        const ele = document.getElementById("U" + u.i);
        if (ele) {
          ele.style.zIndex = u.z.toString();
        }
      });
  }
  Object.assign(D[i], { z: pos === "top" ? D.length : pos });
  const ele = document.getElementById("U" + i);
  if (ele) {
    ele.style.zIndex = D[i].z.toString();
  }
};

// UNIT PRESSED
const PRESS_UNIT = (
  i: number,
  ele: HTMLElement,
  ev: React.PointerEvent<HTMLDivElement>
) => {
  D.forEach((u, ii) => SET_UNIT_ANCHORS(ii));
  D.forEach((u, ii) => (D[ii].tempL = JSON.parse(JSON.stringify(D[ii].l))));

  const root = document.getElementById("root") as HTMLDivElement;
  if (root) {
    POINTER_PRESS_POS = GET_POINTER_COORDS(root, ev);
    POINTER_POS = { ...POINTER_PRESS_POS };
    SET_SELECTED_CORNER(i);

    if (SELECTED_CORNER && POINTER_MOVE_TYPE === "RSZ") {
      SET_UNIT_RESIZE_LOCKS(i, SELECTED_CORNER, MODIFY_ALL_UNITS);
    }
  }

  SET_UNIT_ZINDEX(i, "top");
  ele.querySelector(".edit")?.classList.add("selected");
  SELECTED_UNIT = i;
};

const TOGGLE_UNIT_LOCKS = (
  i: number,
  sides: ("t" | "r" | "b" | "l")[],
  temp?: boolean,
  on?: boolean
) => {
  const lock = temp ? D[i].tempL : D[i].l;
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

export const TOGGLE_ALL_LOCKS = (on: boolean, ignorePerimeter?: boolean) => {
  D.forEach((u) => {
    let l: T_SIDE[] = ["t", "r", "b", "l"];
    if (ignorePerimeter) {
      Math.floor(u.x) === 0 && l.splice(l.indexOf("l"), 1);
      Math.floor(u.y) === 0 && l.splice(l.indexOf("t"), 1);
      Math.ceil(u.x + u.w) === 100 && l.splice(l.indexOf("r"), 1);
      Math.ceil(u.y + u.h) === 100 && l.splice(l.indexOf("b"), 1);
    }
    TOGGLE_UNIT_LOCKS(u.i, l, false, on);
  });
};

const RESET_POINTER = () => {
  D.forEach((u) => {
    Object.assign(D[u.i], { d: undefined });
    TOGGLE_UNIT_LOCKS(u.i, ["t", "r", "b", "l"], true, false);
    document.querySelector(`#U${u.i} .edit`)?.classList.remove("selected");
  });
  SELECTED_UNIT = -1;
  SELECTED_CORNER = undefined;
  POINTER_POS = undefined;
  POINTER_PREV_POS = undefined;
  POINTER_PRESS_POS = undefined;
  POINTER_SNAP_TRIGGER = false;
  POINTER_MOVE_TYPE = undefined;
  console.log(D);
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

// remove from all other unit connections
const REMOVE_ALL_CONNECTIONS = (i: number) => {
  D[i].c = { t: [], r: [], b: [], l: [] };
  D.forEach((u) => {
    for (const [key, value] of Object.entries(u.c)) {
      const idx = D[u.i]?.c[key as T_SIDE].indexOf(i);
      if (idx > -1) {
        D[u.i].c[key as T_SIDE].splice(idx, 1);
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
          const input = entry.target.querySelectorAll(".dimension");
          if (input.length) {
            (input[0] as HTMLInputElement).value = D[i].w.toFixed(3);
            (input[1] as HTMLInputElement).value = D[i].h.toFixed(3);
          }
        }
      }
    })
  );
  const ele = document.querySelector(`#U${i}`);
  if (ele) {
    RESIZE_OBSERVERS[i].observe(ele);
  }
};

const REMOVE_RESIZE_OBSERVER = (i: number) => {
  const ele = document.getElementById(`#U${i}`);
  if (ele) {
    RESIZE_OBSERVERS[i].disconnect();
    RESIZE_OBSERVERS[i].unobserve(ele);
  }
};

export const ADD_UNIT = (U: T) => {
  D.push(U);
  SET_CONNECTIONS(U.i);
  return D[D.length - 1];
};

// Cuts Unit Width by 1/2, Adds new unit as other 1/2
// Returns new unit
export const SPLIT_UNIT = (i: number) => {
  REMOVE_ALL_CONNECTIONS(i);
  // Reduce width by 1/2
  SET_UNIT(i, "RSZ_BR", D[i], "w", (D[i].w / 2) * -1, D[i].aR || 0);
  TOGGLE_UNIT_LOCKS(i, ["r"], false, false);
  return ADD_UNIT({
    ...D[i],
    i: D.length,
    t: "s",
    x: D[i].x + D[i].w,
    l: {
      l: false,
      r: Math.ceil(D[i].x + D[i].w * 2) >= 100,
      t: Math.floor(D[i].y) <= 0,
      b: Math.ceil(D[i].y + D[i].h) >= 100,
    },
    c: {
      t: [] as number[],
      r: [] as number[],
      b: [] as number[],
      l: [] as number[],
    },
    bp: D[i].bp,
  });
};

export const REMOVE_UNIT = (i: number) => {
  REMOVE_ALL_CONNECTIONS(i);

  /* for now, it's just removed from dom using state
     and data connections, then a deleted flag is set.
     many functions reference the units by array index.
   */

  D[i].deleted = true;
  //D.splice(i, 1);
};

window.onload = () => {
  const root = document.getElementById("root") as HTMLDivElement;
  if (root) {
    root.addEventListener("pointermove", (e) => {
      POINTER_POS = GET_POINTER_COORDS(root, e);

      if (POINTER_PRESS_POS && SELECTED_UNIT > -1) {
        const SNAP_DIST = GET_DISTANCE(
          POINTER_PRESS_POS.x,
          POINTER_PRESS_POS.y,
          POINTER_POS.x,
          POINTER_POS.y
        );

        if (
          (POINTER_SNAP_TRIGGER &&
            (Math.abs(SNAP_DIST.x) >= POINTER_SNAP_THRESHOLD ||
              Math.abs(SNAP_DIST.y) >= POINTER_SNAP_THRESHOLD)) ||
          !POINTER_SNAP_TRIGGER
        ) {
          POINTER_SNAP_TRIGGER = false;

          if (POINTER_PREV_POS) {
            const DIST = GET_DISTANCE(
              POINTER_POS.x,
              POINTER_POS.y,
              POINTER_PREV_POS.x,
              POINTER_PREV_POS.y
            );

            // Use lowest dist x/y when min/max bound hit
            let boundHit = false;
            let UNITS = D.filter((u) => !u.deleted);

            if (!MODIFY_ALL_UNITS) {
              UNITS = UNITS.filter((u) => u.i === SELECTED_UNIT);
            }

            UNITS.forEach((u) => {
              if (MODIFY(u.i, DIST, "DIST")) {
                boundHit = true;
              }
            });

            if (boundHit) {
              // @ts-ignore
              const DX = UNITS.map((u) => u.d.x);
              // @ts-ignore
              const DY = UNITS.map((u) => u.d.y);

              UNITS.forEach((u) => {
                Object.assign(u, {
                  d: {
                    x: DIST.x > 0 ? Math.min(...DX) : Math.max(...DX),
                    y: DIST.y > 0 ? Math.min(...DY) : Math.max(...DY),
                  },
                });
              });
            }

            UNITS.forEach((u) => u.d && MODIFY(u.i, u.d, "LOCKS_OFF"));
            UNITS.forEach((u) => u.d && MODIFY(u.i, u.d, "SET"));
            UNITS.forEach((u) => u.d && MODIFY(u.i, u.d, "LOCKS_ON"));
          }

          POINTER_PREV_POS = GET_POINTER_COORDS(root, e);
        }
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
// D.forEach((u) => (u.oW = u.w) && (u.oH = u.h));

const U = (
  p: T & { remove: (i: number) => void; split: (i: number) => void } & {
    edit: boolean;
  }
) => {
  useEffect(() => {
    if (p.edit) {
      ADD_RESIZE_OBSERVER(p.i);
    }
    return () => REMOVE_RESIZE_OBSERVER(p.i);
  }, [p.edit, p.i]);

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
        PRESS_UNIT(p.i, ev.currentTarget, ev);
      }}
    >
      <UniversalItemDisplay />
      {/*!p.edit && <img className="img-test" src="/logo512.png" alt="" />*/}
      {p.edit && (
        <div className="edit">
          {["tl", "tr", "bl", "br"].map((c) => (
            <span
              key={c}
              className={`corner ${c}`}
              style={{
                width: `${CORNER_SIZE * 100}%`,
                height: `${CORNER_SIZE * 100}%`,
              }}
            ></span>
          ))}

          {(["w", "h"] as ("w" | "h")[]).map((dim) => (
            <input
              key={dim}
              className="dimension"
              type="number"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.currentTarget.focus();
                e.currentTarget.select();
              }}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  const val = parseFloat(e.currentTarget.value);
                  RESIZE_UNIT(p, dim, val);
                }
              }}
            />
          ))}

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
          {[
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
                className={`lock ${side} ${p.l[side] ? "on" : ""}`}
                style={pos}
                onClick={(ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                  TOGGLE_UNIT_LOCKS(p.i, [side]);
                }}
                onPointerDown={(ev) => {
                  ev.stopPropagation();
                  ev.preventDefault();
                }}
              ></div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/*
    //@ts-ignore
    const scrollLeft = e.currentTarget?.scrollLeft;
    //@ts-ignore
    const width = e.currentTarget?.getBoundingClientRect().width;
    let allWidth = width * (data.length - 1);
    const percent = (scrollLeft / allWidth) * 100;

    const numberContainer = document.querySelector(
      "#universal_item_display_number_container"
    );

    if (numberContainer) {
      allWidth = width * 2;
      //const left = numberContainer.scrollLeft;
      //numberContainer.scrollTo(allWidth, 0);
    }
    */

const data = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24,
];
let itemsPressed = false;
let numbersPressed = false;
const UniversalItemDisplay = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const eles = document.querySelectorAll(".item_container");
    eles.forEach((ele) => {
      ele.addEventListener("touchstart", () => {
        itemsPressed = true;
        numbersPressed = false;
      });
    });

    const numberContainer = document.querySelector(
      "#universal_item_display_number_container"
    ) as HTMLElement;

    if (numberContainer) {
      numberContainer.addEventListener("touchstart", () => {
        itemsPressed = false;
        numbersPressed = true;
      });
    }
  }, []);

  return (
    <div id="universal_item_display" className="universal_item_display">
      <ItemSlider selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx} />
      <NumberSlider selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx} />
    </div>
  );
};

let observer: IntersectionObserver;

const ItemSlider = ({
  selectedIdx,
  setSelectedIdx,
}: {
  selectedIdx: number;
  setSelectedIdx: any;
}) => {
  useEffect(() => {
    const handleIntersect = (entries: any, observer: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          if (itemsPressed) {
            const id = entry.target.id;
            const selected = parseInt(id.substr(5, id.length));
            setSelectedIdx(selected);
          }
        }
      });
    };

    const options = {
      root: document.querySelector(
        "#universal_item_display_slider"
      ) as HTMLElement,
      threshold: 0,
      rootMargin: "-50%",
    };

    let observer: IntersectionObserver;
    observer = new IntersectionObserver(handleIntersect, options);

    const boxElements = document.querySelectorAll(".item_container");
    data.forEach((num) => {
      const boxElement = boxElements[num];
      observer.observe(boxElement);
    });
  }, []);

  useEffect(() => {
    const container = document.querySelector(
      "#universal_item_display_slider"
    ) as HTMLElement;
    const ele = document.querySelectorAll(".item_container")[
      selectedIdx
    ] as HTMLElement;

    if (container && ele && !itemsPressed) {
      container.style.overflowX = "hidden";
      ele.scrollIntoView();
      setTimeout(function () {
        container.style.overflowX = "scroll";
      }, 10);
    }
  }, [selectedIdx]);

  useEffect(() => {
    return () => observer.disconnect();
  }, []);

  return (
    <div id="universal_item_display_slider" className="item_slider">
      {data.map((sq) => (
        <div key={sq} id={`slide${sq.toString()}`} className="item_container">
          <GridItems page={sq} />
        </div>
      ))}
    </div>
  );
};

const NumberSlider = ({
  selectedIdx,
  setSelectedIdx,
}: {
  selectedIdx: number;
  setSelectedIdx: any;
}) => {
  useEffect(() => {
    const handleIntersect = (entries: any, observer: any) => {
      entries.forEach((entry: any, idx: number) => {
        if (entry.isIntersecting) {
          if (numbersPressed) {
            const id = entry.target.id;
            const selected = parseInt(id.substr(3, id.length));
            setSelectedIdx(selected);
          }
        }
      });
    };

    const options = {
      root: document.querySelector(
        "#universal_item_display_number_container"
      ) as HTMLElement,
      threshold: 0,
      rootMargin: "-50%",
    };

    let observer: IntersectionObserver;
    observer = new IntersectionObserver(handleIntersect, options);

    const boxElements = document.querySelectorAll(".number");
    data.forEach((num) => {
      const boxElement = boxElements[num];
      observer.observe(boxElement);
    });
  }, []);

  useEffect(() => {
    const container = document.querySelector(
      "#universal_item_display_number_container"
    );
    const ele = document.querySelectorAll(".number")[selectedIdx];

    if (container && ele && !numbersPressed) {
      // @ts-ignore
      container.style.overflowX = "hidden";
      ele.scrollIntoView({ inline: "center" });
      setTimeout(function () {
        // @ts-ignore
        container.style.overflowX = "scroll";
      }, 10);
    }
  }, [selectedIdx]);

  useEffect(() => {
    return () => observer.disconnect();
  }, []);

  return (
    <div id="universal_item_display_number_container" className="number_slider">
      {data.map((num) => {
        return (
          <span
            key={num}
            id={`num${num}`}
            className={`number ${num === data.length - 1 ? "last" : ""} ${
              num === selectedIdx ? "selected" : ""
            }`}
          >
            {num}
          </span>
        );
      })}
    </div>
  );
};

const GridItems = ({ page }: { page: number }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <div className="item-grid">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
        return (
          <div className={`item`}>
            <img src="/loop1.gif"></img>
            <span>{`${page}${num}`}</span>
          </div>
        );
      })}
    </div>
  );
};

export default U;
