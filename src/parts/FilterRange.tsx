import { GroupFilter } from "./Shell";

const FilterRange = ({
  idx,
  f,
  set,
}: {
  idx: number;
  f: GroupFilter;
  set: (idx: number, val: number, sort?: "asc" | "desc") => any;
}) => {
  const setActiveWidth = () => {
    const val = f.val as number;
    const min = f.props[0] as number;
    const max = f.props[1] as number;
    const res = ((val - min) * 100) / (max - min) + "%";
    return res;
  };

  return (
    <div
      className={`range_control ${f.sort === "asc" ? "asc" : ""}${
        f.sort === "desc" ? "desc" : ""
      }`}
    >
      <div className="active" style={{ width: setActiveWidth() }} />
      <input
        type="range"
        min={f.props[0]}
        max={f.props[1]}
        value={typeof f.val === "undefined" ? f.props[0] : f.val}
        onChange={(e) => set(idx, e.currentTarget.valueAsNumber, f.sort)}
      />
    </div>
  );
};

export default FilterRange;
