import "./FilterBar.css";

import { FilterChoice, Filter, FilterType, Store } from "./Shell";

type PartFilterBarType = {
  selectedGroup: string;
  selectedFilterIdx: number;
  setSelectedFilterIdx: (idx: number) => void;
  filter1?: Filter;
  filter2?: Filter;
  filter3?: Filter;
  filter4?: Filter;
  filter5?: Filter;
  fetching: boolean;
  map: boolean;
  toggleMap: (val: boolean) => void;
  aliases: any;
  selectedStore?: Store;
  setSelectedStore: (store?: Store) => any;
  clearFilters: () => void;
  search?: string;
  setSearch?: (str?: string) => void;
};

const FilterBar = ({
  selectedGroup,
  selectedFilterIdx,
  setSelectedFilterIdx,
  filter1,
  filter2,
  filter3,
  filter4,
  filter5,
  fetching,
  map,
  toggleMap,
  aliases,
  selectedStore,
  setSelectedStore,
  clearFilters,
  search,
  setSearch,
}: PartFilterBarType) => {
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

  const filtersOn = (filters: (Filter | undefined)[]) => {
    return filters.some((f) => {
      return filterOn(f);
    });
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

  // prob re-write this
  const formatRangeText = (f: Filter) => {
    let val = f.name;

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
          setSelectedFilterIdx(0);
        }
      } else if (selectedFilterIdx !== idx && map) {
        setSelectedFilterIdx(idx);
      }
    } else if (type === "choice" || "range") {
      setSelectedFilterIdx(selectedFilterIdx === idx ? 0 : idx);
    }
  };

  return (
    <div className={"filterbar"}>
      {!fetching && selectedGroup && (
        <div className={"search"}>
          <img src="/media/search.svg" alt="search" />
        </div>
      )}

      {!fetching && selectedGroup && (
        <span className="filters">
          {[filter1, filter2, filter3, filter4, filter5].map((f, idx) => {
            idx++;
            if (f) {
              if (f.type === "choice") {
                return (
                  <span
                    key={`status-${f.name}`}
                    className={`filter-vals ${
                      selectedFilterIdx === idx ? "sel" : ""
                    } ${filterOn(f) ? "on" : ""}`}
                    onClick={(e) => {
                      setSelectedFilter(
                        idx,
                        f.type,
                        selectedFilterIdx === idx,
                        f.name
                      );
                    }}
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
                      selectedFilterIdx === idx ? "sel" : ""
                    } ${filterOn(f) ? "on" : ""} ${f?.sort ? "sort" : ""}`}
                    onClick={(e) => {
                      setSelectedFilter(
                        idx,
                        f.type,
                        selectedFilterIdx === idx,
                        f.name
                      );
                    }}
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

      {selectedGroup &&
        filtersOn([filter1, filter2, filter3, filter4, filter5]) && (
          <button
            className={"clear-filters"}
            onClick={(e) => {
              clearFilters();
            }}
          >
            X
          </button>
        )}
    </div>
  );
};

export default FilterBar;
