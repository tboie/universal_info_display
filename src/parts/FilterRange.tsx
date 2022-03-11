import { useState } from "react";

const FilterRange = ({
  min,
  max,
  sort,
}: {
  min: number;
  max: number;
  sort?: "asc" | "desc";
}) => {
  const [val, setVal] = useState(min);
  return (
    <div
      id="universal_info_display_filter_control_range"
      className={`universal_info_display_filter_control ${
        sort === "asc" ? "asc" : ""
      }${sort === "desc" ? "desc" : ""}`}
    >
      <input
        type="range"
        min={min}
        max={max}
        value={val}
        onChange={(e) => setVal(e.currentTarget.valueAsNumber)}
      />
    </div>
  );
};

export default FilterRange;
