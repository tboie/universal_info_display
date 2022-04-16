import { isBuffer } from "util";
import { GroupFilter, Store } from "./Shell";

const TitleBar = ({
  selectedGroup,
  selectedPageIdx,
  totalPages,
  filter1,
  filter2,
  filter3,
  filter4,
  filter5,
  selectedStore,
  miles,
  fetching,
}: {
  selectedGroup: string;
  selectedPageIdx: number;
  totalPages: number;
  filter1?: GroupFilter;
  filter2?: GroupFilter;
  filter3?: GroupFilter;
  filter4?: GroupFilter;
  filter5?: GroupFilter;
  selectedStore?: Store;
  miles: number;
  fetching: boolean;
}) => {
  return (
    <div className="titlebar">
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
                let choiceStr = f?.name || "";
                return (
                  <>
                    <span className="choice-group">{choiceStr}</span>
                    {": "}
                    <span className="choice-values">
                      {(f.val as string[])
                        .join(", ")
                        .replace("I", "Indica")
                        .replace("S", "Sativa")
                        .replace("H", "Hybrid") || "All"}
                    </span>
                  </>
                );
              }
            })}
          </span>
          {totalPages > 0 && (
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
