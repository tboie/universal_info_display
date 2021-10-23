import "./A.css";
import M, { T, T_SIDE, T_LOCK } from "./M";

// UNIVERSAL RESPONSIVE DASHBOARD DESIGNER - POC v1 (something to work with)

let SELECTED_UNIT = -1;
let SELECTED_CORNER: undefined | "tr" | "tl" | "br" | "bl" = undefined;
let POINTER_POS: undefined | { x: number; y: number } = undefined;
let POINTER_PREV_POS: undefined | { x: number; y: number } = undefined;
let POINTER_MOVE_TYPE: "RSZ" | "MOVE" | undefined = undefined;

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

const MODIFY = (i: number, DIST: { x: number; y: number }) => {
  if (!M[i].updated) {
    const locks = M[i].tempL || {};

    if (POINTER_MOVE_TYPE === "RSZ" && SELECTED_UNIT === i && SELECTED_CORNER) {
      SET_UNIT_RESIZE_LOCKS(i, SELECTED_CORNER);
    }

    // Mouse Moving Left/Right
    if (DIST.x > 0 || DIST.x < 0) {
      // Lock on Right, No Lock Left
      if (typeof locks.r !== "undefined" && typeof locks.l === "undefined") {
        // @ts-ignore
        if (M[i].w - DIST.x > M[i].maxW) {
          // @ts-ignore
          DIST.x += M[i].w - DIST.x - M[i].maxW;
        }
        // @ts-ignore
        else if (M[i].w - DIST.x < M[i].minW) {
          // @ts-ignore
          DIST.x += M[i].w - DIST.x - M[i].minW;
        }

        SET_UNIT(i, "RSZ_TL", M[i], "w", DIST.x, M[i].aR || 0);
      }
      // Lock on Left, No Lock on Right
      else if (
        typeof locks.l !== "undefined" &&
        typeof locks.r === "undefined"
      ) {
        // @ts-ignore
        if (M[i].w + DIST.x > M[i].maxW) {
          //@ts-ignore
          DIST.x -= M[i].w + DIST.x - M[i].maxW;
        }
        //@ts-ignore
        else if (M[i].w + DIST.x < M[i].minW) {
          //@ts-ignore
          DIST.x -= M[i].w + DIST.x - M[i].minW;
        }

        SET_UNIT(i, "RSZ_BR", M[i], "w", DIST.x, M[i].aR || 0);
      }

      // No Lock Left or Right
      else if (
        typeof locks.l === "undefined" &&
        typeof locks.r === "undefined"
      ) {
        SET_UNIT(i, "MOVE", M[i], "w", DIST.x, M[i].aR || 0);
      }
    }
    // Mouse Moving Up/Down
    if (DIST.y > 0 || DIST.y < 0) {
      // Lock on Bottom, No Lock on Top
      if (typeof locks.b !== "undefined" && typeof locks.t === "undefined") {
        // @ts-ignore
        if (M[i].h - DIST.y > M[i].maxH) {
          // @ts-ignore
          DIST.y += M[i].h - DIST.h - M[i].maxH;
        }
        // @ts-ignore
        else if (M[i].h - DIST.y < M[i].minH) {
          // @ts-ignore
          DIST.y += M[i].h - DIST.y - M[i].minH;
        }

        SET_UNIT(i, "RSZ_TL", M[i], "h", DIST.y, M[i].aB || 0);
      }
      // Lock on Top, No Lock on Bottonm
      else if (
        typeof locks.t !== "undefined" &&
        typeof locks.b === "undefined"
      ) {
        // @ts-ignore
        if (M[i].h + DIST.y > M[i].maxH) {
          //@ts-ignore
          DIST.y -= M[i].h + DIST.y - M[i].maxH;
        }
        //@ts-ignore
        else if (M[i].h + DIST.y < M[i].minH) {
          //@ts-ignore
          DIST.y -= M[i].h + DIST.y - M[i].minH;
        }

        SET_UNIT(i, "RSZ_BR", M[i], "h", DIST.y, M[i].aB || 0);
      }
      // No Lock on Top or Bottom
      else if (
        typeof locks.b === "undefined" &&
        typeof locks.t === "undefined"
      ) {
        SET_UNIT(i, "MOVE", M[i], "h", DIST.y, M[i].aB || 0);
      }
    }

    // Set updated flag
    M[i].updated = true;

    // Modify connected units
    GET_CONNECTED_UNITS(i)
      .filter((idx) => !M[idx].updated)
      .forEach((ii) => MODIFY(ii, DIST));
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
  M.forEach((u, ii) => (M[ii].tempL = JSON.parse(JSON.stringify(M[ii].l))));

  const root = document.getElementById("root") as HTMLDivElement;
  if (root) {
    POINTER_POS = GET_POINTER_COORDS(root, ev);
    SET_SELECTED_CORNER(i);
  }
  ev.currentTarget.style.zIndex = "9999";
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
      if ((typeof lock[s] !== "undefined" && !on) || on === false) {
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
      const ele = document.querySelector(`#U${i} .${s}`)?.classList;
      if (ele && !temp) {
        typeof lock[s] !== "undefined" ? ele.add("on") : ele.remove("on");
      }
    });
  }
};

const RESET_POINTER = () => {
  const eleU = document.getElementById("U" + SELECTED_UNIT) as HTMLElement;
  if (eleU) {
    eleU.style.zIndex = M[SELECTED_UNIT].z.toString();
  }
  M.forEach((u, ii) =>
    TOGGLE_UNIT_LOCKS(ii, ["t", "r", "b", "l"], true, false)
  );
  SELECTED_UNIT = -1;
  SELECTED_CORNER = undefined;
  POINTER_POS = undefined;
  POINTER_PREV_POS = undefined;
  POINTER_MOVE_TYPE = undefined;
  console.log(M);
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

          MODIFY(SELECTED_UNIT, DIST);
        }
        POINTER_PREV_POS = GET_POINTER_COORDS(root, e);
        M.forEach((u) => (u.updated = false));
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
              typeof p.i !== "undefined" && TOGGLE_UNIT_LOCKS(p.i, [side]);
            }}
          ></div>
        );
      })
    }
  </div>
);

export default A;
