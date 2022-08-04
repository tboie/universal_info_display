import { Filter, Store } from "./Shell";

type TitleBar = {
  selectedGroup: string;
  selectedPageIdx: number;
  totalPages: number;
  editFilters: boolean;
  setEditFilters: (val: boolean) => void;
  selectedFilterIdx: number;
  setSelectedFilterIdx: (idx: number) => void;
  filter1?: Filter;
  filter2?: Filter;
  filter3?: Filter;
  filter4?: Filter;
  filter5?: Filter;
  selectedStore?: Store;
  miles: number;
  fetching: boolean;
  map: boolean;
  toggleMap: (val: boolean) => void;
  totalItems: number;
  close: () => void;
  showCloseIcon: boolean;
};

const TitleBar = ({
  selectedGroup,
  selectedPageIdx,
  totalPages,
  editFilters,
  setEditFilters,
  selectedFilterIdx,
  setSelectedFilterIdx,
  filter1,
  filter2,
  filter3,
  filter4,
  filter5,
  selectedStore,
  miles,
  fetching,
  map,
  toggleMap,
  totalItems,
  close,
  showCloseIcon,
}: TitleBar) => {
  return (
    <div
      className={`titlebar ${editFilters ? "edit-filters" : ""} ${
        !selectedGroup || fetching ? "no-pointer-events" : ""
      }`}
    >
      <span className="title">
        {selectedStore ? (
          selectedStore?.n.replaceAll("-", " ")
        ) : fetching ? (
          "Fetching " + selectedGroup
        ) : selectedGroup ? (
          <>
            <span
              className="group"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                close && close();
              }}
            >
              {selectedGroup}
            </span>
            {" < "}
            <span
              className="miles"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!map) {
                  setEditFilters(true);
                  setSelectedFilterIdx(
                    [filter1, filter2, filter3, filter4, filter5].findIndex(
                      (f) => f && f.name === "mi"
                    ) + 1
                  );
                  toggleMap(true);
                } else {
                  setEditFilters(false);
                  setSelectedFilterIdx(0);
                  toggleMap(false);
                }
              }}
            >
              {miles + "mi"}
            </span>
          </>
        ) : (
          <span className="group">Cannabis Items Near You</span>
        )}
      </span>

      {selectedGroup && !fetching && (
        <span className="total">
          {!map ? (
            <>
              <span className="current-page">{selectedPageIdx}</span>
              {"/"}
              <span className="total-pages">{totalPages}</span>
            </>
          ) : (
            <span className="total-items">
              {totalItems.toLocaleString("en", { useGrouping: true }) +
                " items"}
            </span>
          )}
        </span>
      )}

      {(showCloseIcon || fetching) && (
        <span
          className="close"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            close();
          }}
        >
          X
        </span>
      )}
    </div>
  );
};

export default TitleBar;
