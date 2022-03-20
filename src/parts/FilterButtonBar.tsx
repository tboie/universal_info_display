import { FilterType, GroupFilter } from "./Shell";

const FilterButtonBar = ({
  filter1,
  filter2,
  filter3,
  filter4,
  filter5,
  setFilter1,
  setFilter2,
  setFilter3,
  setFilter4,
  setFilter5,
  selectedFilterIdx,
  setSelectedFilterIdx,
  setSelectedPageIdx,
}: {
  filter1?: GroupFilter;
  filter2?: GroupFilter;
  filter3?: GroupFilter;
  filter4?: GroupFilter;
  filter5?: GroupFilter;
  setFilter1: (val: any) => any;
  setFilter2: (val: any) => any;
  setFilter3: (val: any) => any;
  setFilter4: (val: any) => any;
  setFilter5: (val: any) => any;
  selectedFilterIdx: number;
  setSelectedFilterIdx: (val: number) => any;
  setSelectedPageIdx: (val: number) => any;
}) => {
  const isOn = (f: GroupFilter) => {
    return (Array.isArray(f.val) && f.val.length) || f.sort ? true : false;
  };

  const setFilter = (idx: number, type: FilterType, selected: boolean) => {
    if (type === "choice") {
      setSelectedFilterIdx(selectedFilterIdx === idx ? 0 : idx);
    } else if (type === "range") {
      let f;

      if (idx === 1) {
        f = filter1;
      } else if (idx === 2) {
        f = filter2;
      } else if (idx === 3) {
        f = filter3;
      } else if (idx === 4) {
        f = filter4;
      } else if (idx === 5) {
        f = filter5;
      }

      let sort = f?.sort;
      let val;
      if (!sort) {
        sort = selected ? "desc" : "asc";
        val = selected ? f?.props[1] : f?.val;
      } else if (sort === "asc") {
        sort = selected ? "desc" : "asc";
        val = selected ? f?.props[0] : f?.val;
      } else if (sort === "desc") {
        sort = selected ? undefined : "desc";
        val = selected ? f?.props[1] : f?.val;
      }

      setSelectedFilterIdx(sort ? idx : 0);
      setSelectedPageIdx(1);
      if (idx === 1) {
        setFilter1({ ...filter1, sort: sort, val: val });
      } else if (idx === 2) {
        setFilter2({ ...filter2, sort: sort, val: val });
      } else if (idx === 3) {
        setFilter3({ ...filter3, sort: sort, val: val });
      } else if (idx === 4) {
        setFilter4({ ...filter4, sort: sort, val: val });
      } else if (idx === 5) {
        setFilter5({ ...filter5, sort: sort, val: val });
      }
    }
  };

  return (
    <div id="universal_info_display_filter_bar">
      {[filter1, filter2, filter3, filter4, filter5].map(
        (f, idx) =>
          f && (
            <FilterButton
              key={idx}
              idx={idx + 1}
              type={f.type}
              text={
                f?.val && f.sort && f.type === "range"
                  ? (f.sort === "asc" ? "<" : ">") +
                    (f.name === "$" ? "$" : "") +
                    f.val +
                    (f.name !== "$" ? f.name : "")
                  : f.name
              }
              on={isOn(f)}
              selected={selectedFilterIdx === idx + 1}
              sort={f.sort}
              click={(idx, type, selected) => setFilter(idx, type, selected)}
            />
          )
      )}
    </div>
  );
};

const FilterButton = ({
  idx,
  type,
  text,
  on,
  selected,
  sort,
  click,
}: {
  idx: number;
  type: FilterType;
  text: string;
  on: boolean;
  selected: boolean;
  sort: "asc" | "desc" | undefined;
  click: (idx: number, type: FilterType, selected: boolean) => any;
}) => {
  return (
    <div
      className={`filter_button ${selected ? "selected" : ""} ${
        on ? "on" : ""
      } ${sort === "asc" ? "asc" : ""} ${sort === "desc" ? "desc" : ""}`}
      onClick={() => {
        globalThis.pageSliderPressed = false;
        globalThis.groupSliderPressed = false;
        globalThis.choiceSliderPressed = false;
        globalThis.contentSliderPressed = false;

        click(idx, type, selected);
      }}
    >
      <span>{text}</span>
    </div>
  );
};

export default FilterButtonBar;
