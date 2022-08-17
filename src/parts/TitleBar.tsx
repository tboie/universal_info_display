import "./TitleBar.css";

import { Store, UniversalInfoDisplayItem } from "./Shell";

type PartTitleBarType = {
  selectedGroup: string;
  selectedPageIdx: number;
  totalPages: number;
  selectedStore?: Store;
  fetching: boolean;
  map: boolean;
  totalItems: number;
  close: () => void;
  selectedItem?: UniversalInfoDisplayItem;
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
  selectedItem,
}: PartTitleBarType) => {
  const getTitle = (): string | JSX.Element => {
    if (fetching) {
      return "Fetching " + selectedGroup;
    } else if (selectedStore) {
      return selectedStore.n.replaceAll("-", " ");
    } else if (selectedItem) {
      return selectedItem.n;
    } else if (selectedGroup) {
      return (
        <span className="group" onClick={(e) => close()}>
          {selectedGroup}
        </span>
      );
    } else {
      return "Cannabis Items Near You";
    }
  };

  return (
    <div
      className={`titlebar ${
        !selectedGroup || fetching ? "no-pointer-events" : ""
      }`}
    >
      <span className="title">{getTitle()}</span>

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
    </div>
  );
};

export default TitleBar;
