import { GroupFilter } from "./Shell";
import { throttle } from "throttle-debounce-ts";

const FilterRange = ({
  idx,
  f,
  set,
}: {
  idx: number;
  f: GroupFilter;
  set: (idx: number, unit: string, val: number, sort?: "asc" | "desc") => any;
}) => {
  const setActiveWidth = () => {
    const val = f.val as number;
    const min = f.props[0] as number;
    const max = f.props[1] as number;
    let res = ((val - min) * 100) / (max - min);
    if (f.sort === "asc") {
      res = 100 - res;
    }
    return res + "%";
  };

  return (
    <div
      className={`range_control ${f.sort === "asc" ? "asc" : ""}${
        f.sort === "desc" ? "desc" : ""
      }`}
    >
      <span className="range_label min">
        {(f.name === "$" ? "$" : "") +
          f.props[0] +
          (f.name !== "$" ? f.name : "")}
      </span>

      <div className="active" style={{ width: setActiveWidth() }} />
      <input
        type="range"
        min={f.props[0]}
        max={f.props[1]}
        value={f.val}
        onChange={(e) =>
          throttle(
            { delay: 15, leading: true, trailing: true },
            set(idx, f.name, e.currentTarget.valueAsNumber, f.sort)
          )
        }
      />
      <span className="range_label max">
        {(f.name === "$" ? "$" : "") +
          f.props[1] +
          (f.name !== "$" ? f.name : "")}
      </span>
    </div>
  );
};

export default FilterRange;
