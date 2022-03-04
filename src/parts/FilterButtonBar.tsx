import { GroupFilter } from "./Shell";

const FilterButtonBar = ({
  filter1,
  filter2,
  setFilter1,
  setFilter2,
  selectedFilterIdx,
  setSelectedFilterIdx,
}: {
  filter1?: GroupFilter;
  filter2?: GroupFilter;
  setFilter1: (val: any) => any;
  setFilter2: (val: any) => any;
  selectedFilterIdx: number;
  setSelectedFilterIdx: (val: number) => any;
}) => {
  const isOn = (f: GroupFilter) => {
    return ((Array.isArray(f.val) && f.val.length) || f.val > 0) as boolean;
  };

  const setFilter = (idx: number, sort: "asc" | "desc" | undefined) => {
    setSelectedFilterIdx(!sort ? 0 : idx);
    if (idx === 1) {
      setFilter1({ ...filter1, sort: sort });
    } else if (idx === 2) {
      setFilter2({ ...filter2, sort: sort });
    }
  };

  return (
    <div id="universal_info_display_filter_bar">
      {[filter1, filter2].map(
        (f, idx) =>
          f && (
            <FilterButton
              key={idx}
              idx={idx + 1}
              text={f.name}
              on={isOn(f)}
              selected={selectedFilterIdx === idx + 1}
              sort={f.sort}
              click={(idx, sort) => setFilter(idx, sort)}
            />
          )
      )}
    </div>
  );
};

const FilterButton = ({
  idx,
  text,
  on,
  selected,
  sort,
  click,
}: {
  idx: number;
  text: string;
  on: boolean;
  selected: boolean;
  sort: "asc" | "desc" | undefined;
  click: (idx: number, sort: "asc" | "desc" | undefined) => any;
}) => {
  return (
    <div
      className="universal_info_display_filter_button"
      style={{
        border: selected ? "0.5rem solid white" : "",
        backgroundColor: on ? "white" : "lightgreen",
      }}
      onClick={() => {
        globalThis.itemsPressed = false;
        globalThis.numbersPressed = false;
        globalThis.groupsPressed = false;

        if (!selected) {
          click(idx, "asc");
        } else if (sort === "asc") {
          click(idx, "desc");
        } else if (sort === "desc") {
          click(idx, undefined);
        }
      }}
    >
      <span>
        {text}
        {sort === "asc" && String.fromCharCode(8593)}
        {sort === "desc" && String.fromCharCode(8595)}
      </span>
    </div>
  );
};

export default FilterButtonBar;
