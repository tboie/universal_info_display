import { Choice, Filter, Store } from "./Shell";

const TitleBar = ({
  selectedGroup,
  selectedPageIdx,
  totalPages,
  editFilters,
  setEditFilters,
  filter1,
  filter2,
  filter3,
  filter4,
  filter5,
  selectedStore,
  miles,
  fetching,
  map,
  aliases,
}: {
  selectedGroup: string;
  selectedPageIdx: number;
  totalPages: number;
  editFilters: boolean;
  setEditFilters: (val: boolean) => void;
  filter1?: Filter;
  filter2?: Filter;
  filter3?: Filter;
  filter4?: Filter;
  filter5?: Filter;
  selectedStore?: Store;
  miles: number;
  fetching: boolean;
  map: boolean;
  aliases: any;
}) => {
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

    return allChoices.length ? allChoices.join(", ") : "All";
  };
  return (
    <div
      className={`titlebar ${editFilters ? "edit-filters" : ""}`}
      onClick={() => setEditFilters(!editFilters)}
    >
      {selectedGroup && (
        <span className="title">
          {selectedStore ? (
            selectedStore?.n.replaceAll("-", " ")
          ) : fetching ? (
            "Fetching " + selectedGroup
          ) : (
            <>
              <span className="group">{selectedGroup}</span>
              {" < "}
              <span className="miles">{miles + "mi"}</span>
            </>
          )}
        </span>
      )}
      {!fetching && selectedGroup && (
        <>
          <span className="filters">
            {[filter1, filter2, filter3, filter4, filter5].map((f) => {
              if (f && f.type === "choice") {
                let choiceStr = f?.alias || f?.name || "";
                return (
                  <>
                    <span className="choice-group">{choiceStr}</span>
                    {": "}
                    <span className="choice-values">
                      {getChoiceText(f.val as Choice[])}
                    </span>
                  </>
                );
              }
            })}
          </span>
          {totalPages > 0 && !map && (
            <span className="numpages">
              <>
                <span className="numpages-current">{selectedPageIdx}</span>
                {"/"}
                <span className="numpages-total">{totalPages}</span>
              </>
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default TitleBar;
