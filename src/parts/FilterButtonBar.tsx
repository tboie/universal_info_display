import { FilterType, GroupFilter } from "./Shell";

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

  const setFilter = (idx: number, type: FilterType) => {
    if (type === "choice") {
      setSelectedFilterIdx(selectedFilterIdx === idx ? 0 : idx);
    } else if (type === "range") {
      const f = idx === 1 ? filter1 : filter2;
      let sort = f?.sort;
      if (!sort) {
        sort = "asc";
      } else if (sort === "asc") {
        sort = "desc";
      } else {
        sort = undefined;
      }
      setSelectedFilterIdx(sort ? idx : 0);
      idx === 1
        ? setFilter1({ ...filter1, sort: sort })
        : setFilter2({ ...filter2, sort: sort });
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
              type={f.type}
              text={f.name}
              on={isOn(f)}
              selected={selectedFilterIdx === idx + 1}
              sort={f.sort}
              click={(idx, type) => setFilter(idx, type)}
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
  click: (idx: number, type: FilterType) => any;
}) => {
  return (
    <div
      className="universal_info_display_filter_button"
      style={{
        border: selected ? "0.5rem solid white" : "",
        backgroundColor: on ? "white" : "lightgreen",
      }}
      onClick={() => {
        globalThis.pageSliderPressed = false;
        globalThis.groupSliderPressed = false;
        globalThis.choiceSliderPressed = false;
        globalThis.contentSliderPressed = false;

        click(idx, type);
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
