import { Filter, Store } from "./Shell";

type TitleBar = {
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
  selectedStore?: Store;
  miles: number;
  fetching: boolean;
  map: boolean;
  toggleMap: (val: boolean) => void;
  close: () => void;
  showCloseIcon: boolean;
};

const TitleBar = ({
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
  selectedStore,
  miles,
  fetching,
  map,
  toggleMap,
  close,
  showCloseIcon,
}: TitleBar) => {
  return (
    <div
      className={`titlebar ${editFilters ? "edit-filters" : ""} ${
        !selectedGroup || fetching ? "no-pointer-events" : ""
      }`}
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

      {(fetching || showCloseIcon) && (
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
