import { Filter, Store } from "./Shell";

type TitleBar = {
  selectedGroup: string;
  selectedPageIdx: number;
  totalPages: number;
  selectedStore?: Store;
  fetching: boolean;
  map: boolean;
  totalItems: number;
  close: () => void;
  showCloseIcon: boolean;
};

const TitleBar = ({
  selectedGroup,
  selectedPageIdx,
  totalPages,
  selectedStore,
  fetching,
  map,
  totalItems,
  close,
  showCloseIcon,
}: TitleBar) => {
  return (
    <div
      className={`titlebar ${
        !selectedGroup || fetching ? "no-pointer-events" : ""
      }`}
    >
      <span className="title">
        {selectedStore ? (
          selectedStore?.n.replaceAll("-", " ")
        ) : fetching ? (
          "Fetching " + selectedGroup
        ) : selectedGroup ? (
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
