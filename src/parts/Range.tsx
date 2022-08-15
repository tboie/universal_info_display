import "./Range.css";

import { Filter, FilterOp, FilterType } from "./Shell";
import { throttle } from "throttle-debounce-ts";

type PartRangeType = {
  idx: number;
  f: Filter;
  set: (idx: number, unit: string, val: number) => void;
  setF?: (f: Filter) => void;
  setRangeModal?: (val: boolean) => void;
};

let thumbState: "pressed" | "changed" | "ready" = "ready";

const Range = ({ idx, f, set, setF, setRangeModal }: PartRangeType) => {
  const getThumbRight = () => {
    // this works, but wasn't meant for this.
    const val = f.val as number;
    const min = f.props[0] as number;
    const max = f.props[1] as number;
    let res = ((val - min) * 100) / (max - min);
    if (!f.sort || f.sort === "asc") {
      res = 100 - res;
    }
    return res;
  };

  const getActiveWidth = () => {
    const val = f.val as number;
    const min = f.props[0] as number;
    const max = f.props[1] as number;
    let res = ((val - min) * 100) / (max - min);

    if (f.op === ">") {
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

    setF && setF({ ...f, sort: sort, val: val });

    //setSelectedPageIdx(1)
  };

  const toggleOp = () => {
    setF && setF({ ...f, op: f.op === ">" ? "<" : ">" });
  };

  return (
    <div
      className={`range_control ${f.sort === "asc" ? "asc" : ""}${
        f.sort === "desc" ? "desc" : ""
      } ${f.op === ">" ? "gt" : "lt"}`}
    >
      <div className={`range_wrapper`}>
        <span
          className="range_label min"
          onClick={(e) => {
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
            width: getActiveWidth() + "%",
          }}
        />

        <input
          type="range"
          onPointerDown={(e) => {
            // Custom thumb press to toggle sort ... last resort
            // lots of values taken from css, these can be retrieved from elements
            // TODO: optimize if works
            let valPercent = (100 - getThumbRight()) * 0.01;
            const inputWidth = e.currentTarget.getBoundingClientRect().width;
            const valLeft = valPercent * inputWidth;
            // input has 6% left/right margins
            const inputLeft = 0.06 * window.innerWidth;
            const thumbX = inputLeft + valLeft + 24; // border and padding

            const bound = 16;
            valPercent = 100 - getThumbRight();
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
            setRangeModal && setRangeModal(true);
          }}
          onPointerUp={(e) => {
            if (thumbState === "pressed") {
              toggleOp();
            }
            thumbState = "ready";
            setRangeModal && setRangeModal(false);
          }}
          onPointerLeave={(e) => {
            thumbState = "ready";
            setRangeModal && setRangeModal(false);
          }}
          min={f.props[0] as number}
          max={f.props[1] as number}
          value={f.val as number}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            thumbState = "changed";
            throttle(
              { delay: 15, leading: true, trailing: true },
              set(idx, f.name, e.currentTarget.valueAsNumber)
            );
          }}
        />

        <span
          className="thumb"
          style={{
            right: getThumbRight() + "%",
            transform: "translateX(" + getThumbRight() + "%)",
          }}
        >
          {f.op}
        </span>

        <span
          className="range_label max"
          onClick={(e) => {
            toggleSort();
          }}
        >
          {(f.name === "$" ? "$" : "") +
            (!f.sort || f.sort === "asc" ? f.props[1] : f.props[0]) +
            (f.name !== "$" ? f.name : "")}
        </span>
      </div>
    </div>
  );
};

export const RangeStatus = ({ f }: { f?: Filter }) => {
  const formatText = () => {
    let text = "";
    if (f) {
      text =
        f.op +
        (f.name === "$" ? "$" : "") +
        f.val.toString() +
        (f.name !== "$" ? f.name : "");
    }
    return text;
  };

  return (
    <div className={`status`}>
      <span>{formatText()}</span>
    </div>
  );
};

export default Range;
