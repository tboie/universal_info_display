import { Choice, Filter, FilterType, Store } from "./Shell";

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
  filtersOn: boolean;
  selectedStore?: Store;
  setSelectedStore: (store?: Store) => any;
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
  filtersOn,
  selectedStore,
  setSelectedStore,
}: StatusBar) => {
  const getChoiceText = (choices: Choice[]) => {
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

  const formatRangeText = (f: Filter) => {
    let val = f.name;

    if (f) {
      if (f.name === "mi") {
        val = "<" + f.val + f.name;
      } else {
        if (f.sort) {
          if (f.name !== "$") {
            if (f.sort === "asc") {
              val = ">" + f.val + f.name + "↑";
            } else {
              val = "<" + f.val + f.name + "↓";
            }
          } else {
            if (f.sort === "asc") {
              val = ">" + f.name + f.val + "↑";
            } else {
              val = "<" + f.name + f.val + "↓";
            }
          }
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
                    {getChoiceText(f.val as Choice[]) || f.alias || f.name}
                  </span>
                );
              } else if (f.type === "range") {
                return (
                  <span
                    key={`status-${f.name}`}
                    className={`filter-vals ${
                      selectedFilterIdx === idx ? "sel" : ""
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
    </div>
  );
};

export default StatusBar;
