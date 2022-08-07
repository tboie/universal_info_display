import { Filter } from "./Shell";
import { throttle } from "throttle-debounce-ts";

let thumbState: "pressed" | "changed" | "ready" = "ready";

const Range = ({
  idx,
  f,
  set,
  setFilter1,
  setFilter2,
  setFilter3,
  setFilter4,
  setFilter5,
}: {
  idx: number;
  f: Filter;
  set: (idx: number, unit: string, val: number, sort?: "asc" | "desc") => void;
  setFilter1: (f: Filter) => void;
  setFilter2: (f: Filter) => void;
  setFilter3: (f: Filter) => void;
  setFilter4: (f: Filter) => void;
  setFilter5: (f: Filter) => void;
}) => {
  const setActiveWidth = () => {
    const val = f.val as number;
    const min = f.props[0] as number;
    const max = f.props[1] as number;
    let res = ((val - min) * 100) / (max - min);
    if (!f.sort || f.sort === "asc") {
      res = 100 - res;
    }
    return res;
  };

  const toggleSort = () => {
    let sort = f.sort;
    let val = f.val;
    if (!sort) {
      sort = "asc";
    } else if (sort === "desc") {
      sort = undefined;
    } else {
      sort = "desc";
    }

    if (idx === 1) {
      setFilter1({ ...f, sort: sort, val: val });
    } else if (idx === 2) {
      setFilter2({ ...f, sort: sort, val: val });
    } else if (idx === 3) {
      setFilter3({ ...f, sort: sort, val: val });
    } else if (idx === 4) {
      setFilter4({ ...f, sort: sort, val: val });
    } else if (idx === 5) {
      setFilter5({ ...f, sort: sort, val: val });
    }

    //setSelectedPageIdx(1)
  };

  const toggleOp = () => {
    if (idx === 1) {
      setFilter1({ ...f, op: f.op === ">" ? "<" : ">" });
    } else if (idx === 2) {
      setFilter2({ ...f, op: f.op === ">" ? "<" : ">" });
    } else if (idx === 3) {
      setFilter3({ ...f, op: f.op === ">" ? "<" : ">" });
    } else if (idx === 4) {
      setFilter4({ ...f, op: f.op === ">" ? "<" : ">" });
    } else if (idx === 5) {
      setFilter5({ ...f, op: f.op === ">" ? "<" : ">" });
    }
  };

  return (
    <div
      className={`range_control ${f.name === "mi" ? "mi" : ""} ${
        f.sort === "asc" ? "asc" : ""
      }${f.sort === "desc" ? "desc" : ""} ${f.op === ">" ? "gt" : "lt"}`}
    >
      <span
        className="range_label min"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleSort();
        }}
      >
        {(f.name === "$" ? "$" : "") +
          (!f.sort || f.sort === "asc" ? f.props[0] : f.props[1]) +
          (f.name !== "$" ? f.name : "")}
      </span>

      <div
        className="active"
        style={{
          width: setActiveWidth() + "%",
        }}
      />

      <input
        type="range"
        onPointerDown={(e) => {
          // Custom thumb press to toggle sort ... last resort
          // lots of values taken from css, these can be retrieved from elements
          // TODO: optimize if works
          const input = e.currentTarget;
          let valPercent = (100 - setActiveWidth()) * 0.01;
          const inputWidth = e.currentTarget.getBoundingClientRect().width;
          const valLeft = valPercent * inputWidth;
          const inputLeft = 0.06 * window.innerWidth;
          const thumbX = inputLeft + valLeft + 24; // border and padding

          const bound = 16;
          valPercent = 100 - setActiveWidth();
          // see component inline transform styling for a more precise approach
          if (valPercent <= 50) {
            if (thumbX > e.pageX - bound && thumbX < e.pageX) {
              thumbState = "pressed";
            }
          } else if (valPercent > 50) {
            if (thumbX < e.pageX + bound && thumbX > e.pageX) {
              thumbState = "pressed";
            }
          }
        }}
        onPointerUp={(e) => {
          if (thumbState === "pressed") {
            toggleOp();
          }
          thumbState = "ready";
        }}
        onPointerLeave={(e) => {
          thumbState = "ready";
        }}
        min={f.props[0] as number}
        max={f.props[1] as number}
        value={f.val as number}
        onChange={(e) => {
          e.stopPropagation();
          e.preventDefault();
          thumbState = "changed";
          throttle(
            { delay: 15, leading: true, trailing: true },
            set(idx, f.name, e.currentTarget.valueAsNumber, f.sort)
          );
        }}
      />

      <span
        className="thumb"
        style={{
          right: setActiveWidth() + "%",
          transform: "translateX(" + setActiveWidth() + "%)",
        }}
      >
        {f.op}
      </span>

      <span
        className="range_label max"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleSort();
        }}
      >
        {(f.name === "$" ? "$" : "") +
          (!f.sort || f.sort === "asc" ? f.props[1] : f.props[0]) +
          (f.name !== "$" ? f.name : "")}
      </span>
    </div>
  );
};

export default Range;
