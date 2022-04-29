import { FilterType, Filter, Store, Choice } from "./Shell";

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
  map,
  toggleMap,
  selectedStore,
  setSelectedStore,
  fetching,
}: {
  filter1?: Filter;
  filter2?: Filter;
  filter3?: Filter;
  filter4?: Filter;
  filter5?: Filter;
  setFilter1: (val: any) => any;
  setFilter2: (val: any) => any;
  setFilter3: (val: any) => any;
  setFilter4: (val: any) => any;
  setFilter5: (val: any) => any;
  selectedFilterIdx: number;
  setSelectedFilterIdx: (val: number) => any;
  setSelectedPageIdx: (val: number) => any;
  map: boolean;
  toggleMap: () => any;
  selectedStore?: Store;
  setSelectedStore: (store?: Store) => any;
  fetching: boolean;
}) => {
  const isOn = (f: Filter) => {
    if (f.type === "choice") {
      return (f.val as Choice[]).some((c) => c.values.length);
    } else {
      return f.sort || f.name === "mi" ? true : false;
    }
  };

  const setFilter = (
    idx: number,
    type: FilterType,
    selected: boolean,
    name: string
  ) => {
    if (name === "mi") {
      if (selectedFilterIdx !== idx && !map) {
        toggleMap();
        setSelectedFilterIdx(idx);
      } else if (selectedFilterIdx === idx) {
        if (selectedStore) {
          setSelectedStore(undefined);
        } else {
          toggleMap();
          setSelectedFilterIdx(0);
        }
      } else if (selectedFilterIdx !== idx && map) {
        setSelectedFilterIdx(idx);
      }
    } else if (type === "choice") {
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
        val = selected ? f?.props[0] : f?.val;
      } else if (sort === "asc") {
        sort = selected ? "desc" : "asc";
        val = selected ? f?.props[1] : f?.val;
      } else if (sort === "desc") {
        sort = selected ? undefined : "desc";
        val = selected ? f?.props[0] : f?.val;
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
    <div className="filterbar">
      {[filter1, filter2, filter3, filter4, filter5].map(
        (f, idx) =>
          f &&
          !fetching && (
            <FilterButton
              key={idx}
              idx={idx + 1}
              type={f.type}
              text={
                (f?.val > -1 && f.sort && f.type === "range") ||
                (f.name === "mi" && !selectedStore)
                  ? (f.sort === "asc" ? ">" : "<") +
                    (f.name === "$" ? "$" : "") +
                    f.val +
                    (f.name !== "$" ? f.name : "")
                  : selectedStore && f.name === "mi"
                  ? "store"
                  : f.alias || f.name
              }
              on={isOn(f)}
              selected={
                selectedFilterIdx === idx + 1 ||
                (f.name === "mi" && (map || selectedStore ? true : false))
              }
              sort={f.sort}
              name={f.name}
              click={(idx, type, selected, name) =>
                setFilter(idx, type, selected, name)
              }
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
  name,
  click,
}: {
  idx: number;
  type: FilterType;
  text: string;
  on: boolean;
  selected: boolean;
  sort: "asc" | "desc" | undefined;
  name: string;
  click: (
    idx: number,
    type: FilterType,
    selected: boolean,
    name: string
  ) => any;
}) => {
  return (
    <div
      className={`filter_button ${name === "mi" ? "mi" : ""} ${
        selected ? "selected" : ""
      } ${on ? "on" : ""} ${sort === "asc" ? "asc" : ""} ${
        sort === "desc" ? "desc" : ""
      }`}
      onClick={() => {
        globalThis.pageSliderPressed = false;
        globalThis.groupSliderPressed = false;
        globalThis.choiceSliderPressed = false;
        globalThis.contentSliderPressed = false;

        click(idx, type, selected, name);
      }}
    >
      <span>{text}</span>
    </div>
  );
};

export default FilterButtonBar;
