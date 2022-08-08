import { filterOn, filtersOn } from "./ButtonBar";
import { FilterChoice, Filter, FilterType, Store } from "./Shell";

type StatusBar = {
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
};

const StatusBar = ({
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
}: StatusBar) => {
  const getChoiceText = (choices: FilterChoice[]) => {
    const allChoices: string[] = [];
    choices.forEach((c) => {
      c.values.forEach((v) => {
        allChoices.push(
          aliases && c.field && aliases[c.field] && aliases[c.field][v]
            ? aliases[c.field][v]
            : v
        );
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

  // TODO: add idx to Filter type
  const getFilterByIdx = (idx: number) => {
    if (idx === 1) {
      return filter1;
    } else if (idx === 2) {
      return filter2;
    } else if (idx === 3) {
      return filter3;
    } else if (idx === 4) {
      return filter4;
    } else if (idx === 5) {
      return filter5;
    }
    return undefined;
  };

  return (
    <div className={"statusbar"}>
      {!fetching && selectedGroup && (
        <div
          className={"search"}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <img src="/search.svg" />
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
                    } ${filterOn(getFilterByIdx(idx)) ? "on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
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
                    } ${filterOn(getFilterByIdx(idx)) ? "on" : ""} ${
                      getFilterByIdx(idx)?.sort ? "sort" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
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
          })}
        </span>
      )}

      {selectedGroup &&
        filtersOn([filter1, filter2, filter3, filter4, filter5]) && (
          <button
            className={"clear-filters"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              clearFilters();
            }}
          >
            X
          </button>
        )}
    </div>
  );
};

export default StatusBar;
