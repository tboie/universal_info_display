import { Choice, Filter } from "./Shell";

type StatusBar = {
  selectedGroup: string;
  editFilters: boolean;
  setEditFilters: (val: boolean) => void;
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
};

const StatusBar = ({
  selectedGroup,
  editFilters,
  setEditFilters,
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
}: StatusBar) => {
  const toggleFilter = (idx: number, field: string) => {
    if (!editFilters) {
      setEditFilters(true);
      setSelectedFilterIdx(idx);
    } else {
      if (selectedFilterIdx === idx) {
        setEditFilters(false);
        setSelectedFilterIdx(0);
      } else {
        setSelectedFilterIdx(idx);
      }
    }

    if (field === "mi") {
      toggleMap(!map);
    } else if (map) {
      toggleMap(false);
    }
  };

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

  return (
    <div
      className={"statusbar"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        setEditFilters(!editFilters);
        setSelectedFilterIdx(editFilters ? 0 : selectedFilterIdx);
        if (map) {
          toggleMap(false);
        }
      }}
    >
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
          {!filtersOn && (
            <span className={`filter-vals ${editFilters ? "sel" : ""}`}>
              All
            </span>
          )}

          {[filter1, filter2, filter3, filter4, filter5].map((f, idx) => {
            idx++;
            if (f) {
              if (f.type === "choice") {
                const selectedChoices = getChoiceText(f.val as Choice[]);
                if (selectedChoices) {
                  return (
                    <span
                      key={`status-${f.name}`}
                      className={`filter-vals ${
                        editFilters && selectedFilterIdx === idx ? "sel" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleFilter(idx, f.name);
                      }}
                    >
                      {getChoiceText(f.val as Choice[])}
                    </span>
                  );
                }
              } else if (f.type === "range" && (f.sort || f.name === "mi")) {
                return (
                  <span
                    key={`status-${f.name}`}
                    className={`filter-vals ${
                      editFilters && selectedFilterIdx === idx ? "sel" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleFilter(idx, f.name);
                    }}
                  >
                    {f.sort === "asc" ? ">" : "<"}
                    {f.name !== "$" ? f.val + f.name : f.name + f.val}
                    {f.name !== "mi" ? (f.sort === "asc" ? "↑" : "↓") : ""}
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
