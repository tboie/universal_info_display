import "./FilterBar.css";

import { FilterChoice, Filter, FilterType, Store } from "./Shell";

type PartFilterBarType = {
  selectedGroup: string;
  selectedFilterIdx: number;
  setSelectedFilterIdx: (idx: number) => void;
  filter0?: Filter;
  filter1?: Filter;
  filter2?: Filter;
  filter3?: Filter;
  filter4?: Filter;
  filter5?: Filter;
  filter6?: Filter;
  filter7?: Filter;
  fetching: boolean;
  map: boolean;
  toggleMap: (val: boolean) => void;
  aliases: any;
  selectedStore?: Store;
  setSelectedStore: (store?: Store) => void;
  clearFilters: (idx?: number) => void;
  search: boolean;
  setSearch: (on: boolean) => void;
  searchStr: string;
  setSearchStr: (val: string) => void;
  searchResultsLen?: number;
  goToPage: (val: number) => void;
};

const FilterBar = ({
  selectedGroup,
  selectedFilterIdx,
  setSelectedFilterIdx,
  filter0,
  filter1,
  filter2,
  filter3,
  filter4,
  filter5,
  filter6,
  filter7,
  fetching,
  map,
  toggleMap,
  aliases,
  selectedStore,
  setSelectedStore,
  clearFilters,
  search,
  setSearch,
  searchStr,
  setSearchStr,
  searchResultsLen,
  goToPage,
}: PartFilterBarType) => {
  const filters = [
    filter0,
    filter1,
    filter2,
    filter3,
    filter4,
    filter5,
    filter6,
    filter7,
  ];

  const filterOn = (f?: Filter) => {
    if (f) {
      if (f.type === "choice") {
        return (f.val as FilterChoice[]).some((c) => c.values.length);
      } else {
        if (f.name !== "mi") {
          // this works for all conditions
          if (f.op === "<") {
            return f.val !== f.props[1];
          } else {
            return f.val !== f.props[0];
          }
        } else {
          return true;
        }
      }
    }
    return false;
  };

  const getChoiceText = (choices: FilterChoice[]) => {
    const allChoices: string[] = [];
    choices.forEach((c) => {
      // sort numbers
      c.type === "number"
        ? c.values.sort((a: any, b: any) => a - b)
        : c.values.sort();

      // get each value text
      c.values.forEach((v) => {
        let alias: string = "";

        // use field alias if defined
        if (aliases && c.field && aliases[c.field] && aliases[c.field][v]) {
          alias = aliases[c.field][v];
        }

        // add unit to numbers
        if (c.type === "number") {
          v = v + c.field;
        }

        allChoices.push(alias || (v as string));
      });
    });

    return allChoices.length ? allChoices.join(", ") : "";
  };

  const formatRangeText = (f: Filter) => {
    let val = f.name;

    if (aliases && aliases[val] && aliases[val]["alias"]) {
      val = aliases[val]["alias"];
    }

    if (f && f.op) {
      if (filterOn(f)) {
        if (f.name === "$") {
          if (!f.sort) {
            val = f.op + f.name + f.val;
          } else if (f.sort === "asc") {
            val = f.op + f.name + f.val + "↑";
          } else {
            val = f.op + f.name + f.val + "↓";
          }
        } else {
          if (!f.sort) {
            val = f.op + f.val + f.name;
          } else if (f.sort === "asc") {
            val = f.op + f.val + f.name + "↑";
          } else {
            val = f.op + f.val + f.name + "↓";
          }
        }
      } else {
        if (f.sort === "asc") {
          val = f.name + "↑";
        } else if (f.sort === "desc") {
          val = f.name + "↓";
        }
      }
    }
    return val;
  };

  const setSelectedFilter = (
    idx: number,
    type: FilterType,
    selected: boolean,
    name: string
  ) => {
    if (name === "mi") {
      if (selectedFilterIdx !== idx && !map) {
        toggleMap(true);
        setSelectedFilterIdx(idx);
      } else if (selectedFilterIdx === idx) {
        if (selectedStore) {
          setSelectedStore(undefined);
        } else {
          toggleMap(false);
          setSelectedFilterIdx(-1);
          goToPage(1);
        }
      } else if (selectedFilterIdx !== idx && map) {
        setSelectedFilterIdx(idx);
      }
    } else if (type === "choice" || type === "range") {
      setSelectedFilterIdx(selectedFilterIdx === idx ? -1 : idx);
    }
  };

  const filterClick = (f: Filter) => {
    if (f.i === selectedFilterIdx) {
      const ctrlContainer = document.querySelector(
        ".filter-controls"
      ) as HTMLDivElement;

      if (ctrlContainer) {
        ctrlContainer.style.height = "";
      }
    }
    setSelectedFilter(f.i, f.type, f.i === selectedFilterIdx, f.name);
  };

  const filterDrag = (f: Filter) => {
    const ctrlContainer = document.querySelector(
      ".filter-controls"
    ) as HTMLDivElement;

    if (ctrlContainer) {
      if (!ctrlContainer.classList.contains("dragging")) {
        ctrlContainer.classList.add("dragging");
      }
    }
    if (globalThis.pointerActivated && selectedFilterIdx === -1) {
      setSelectedFilter(f.i, f.type, f.i === selectedFilterIdx, f.name);
    }
  };

  const filterDown = (e: any, f: Filter) => {
    globalThis.pointerPosDown = [e.pageX, e.pageY];
  };

  return (
    <div className={`filterbar`}>
      {!search && <img src="/media/search.svg" alt="search" />}
      {search && (
        <span
          className={`back`}
          onClick={(e) => {
            setSearch && setSearch(false);
            setSearchStr && setSearchStr("");
            //clearFilters();
          }}
        >{`<`}</span>
      )}

      <input
        id={`search-input`}
        className={`${search ? "on" : ""}`}
        type={`text`}
        onClick={(e) => {
          setSelectedFilterIdx(-1);
          setSearch && setSearch(true);
        }}
        onInput={(e) => {
          setSearchStr && setSearchStr(e.currentTarget.value);
        }}
        value={search ? searchStr : ""}
        placeholder={search ? `Search All ${selectedGroup}` : ""}
      />

      {search && searchStr && (
        <span className={`search-results`}>
          {searchResultsLen?.toLocaleString("en", { useGrouping: true }) +
            " items"}
        </span>
      )}

      {!search && searchStr && (
        <span className={`filters`}>
          <span
            className={`filter-vals on`}
            onClick={() => {
              setSearch && setSearch(true);
            }}
          >
            {searchStr}
          </span>
        </span>
      )}

      {!search && !searchStr && (
        <span className="filters">
          {filters.map((f) => {
            if (f) {
              if (f.type === "choice") {
                return (
                  <span
                    key={`status-${f.name}`}
                    className={`filter-vals ${
                      selectedFilterIdx === f.i ? "sel" : ""
                    } ${filterOn(f) ? "on" : ""}`}
                    onClick={(e) => filterClick(f)}
                    onPointerDown={(e) => filterDown(e, f)}
                    onTouchMove={(e) => filterDrag(f)}
                  >
                    {getChoiceText(f.val as FilterChoice[]) ||
                      f.alias ||
                      f.name}
                  </span>
                );
              } else if (f.type === "range") {
                return (
                  <span
                    key={`status-${f.name}`}
                    className={`filter-vals ${
                      selectedFilterIdx === f.i ? "sel" : ""
                    } ${filterOn(f) ? "on" : ""} ${f.sort ? "sort" : ""} ${
                      f.name === "mi" && map ? "map" : ""
                    }`}
                    onClick={(e) => filterClick(f)}
                    onTouchMove={(e) => filterDrag(f)}
                    onPointerDown={(e) => filterDown(e, f)}
                  >
                    {formatRangeText(f)}
                  </span>
                );
              }
            }
            return null;
          })}
        </span>
      )}

      <button
        className={"clear-filters"}
        onClick={(e) => {
          if (search) {
            setSearchStr && setSearchStr("");
          } else {
            if (selectedFilterIdx > -1) {
              clearFilters(selectedFilterIdx);
            } else {
              clearFilters();
            }
          }
        }}
      >
        X
      </button>
    </div>
  );
};

export default FilterBar;
