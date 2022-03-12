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
  return (
    <div
      id="universal_info_display_filter_control_range"
      className={`universal_info_display_filter_control ${
        f.sort === "asc" ? "asc" : ""
      }${f.sort === "desc" ? "desc" : ""}`}
    >
      <input
        type="range"
        min={f.props[0]}
        max={f.props[1]}
        value={f.val}
        onChange={(e) => set(idx, e.currentTarget.valueAsNumber, f.sort)}
      />
    </div>
  );
};

export default FilterRange;
