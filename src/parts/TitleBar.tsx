import "./TitleBar.css";

import { Store, UniversalInfoDisplayItem } from "./Shell";

type PartTitleBarType = {
  selectedGroup: string;
  selectedPageIdx: number;
  totalPages: number;
  selectedStore?: Store;
  setSelectedStore?: (val: Store | undefined) => void;
  fetching: boolean;
  map: boolean;
  setMap?: (val: boolean) => void;
  totalItems: number;
  close: () => void;
  selectedItem?: UniversalInfoDisplayItem;
  setSelectedFilterIdx: (val: number) => void;
  goToPage?: (val: number) => void;
};

const TitleBar = ({
  selectedGroup,
  selectedPageIdx,
  totalPages,
  selectedStore,
  setSelectedStore,
  fetching,
  map,
  setMap,
  totalItems,
  close,
  selectedItem,
  setSelectedFilterIdx,
  goToPage,
}: PartTitleBarType) => {
  const getTitle = (): string | JSX.Element => {
    if (fetching) {
      return "Loading " + selectedGroup;
    } else if (map) {
      if (selectedStore) {
        return (
          <span
            onClick={(e) => {
              setMap && setMap(!map);
              setSelectedStore && setSelectedStore(undefined);
              goToPage && goToPage(1);
            }}
          >
            {"< Store: " + selectedStore.n}
          </span>
        );
      } else {
        return (
          <span
            onClick={(e) => {
              setMap && setMap(!map);
              setSelectedFilterIdx(-1);
              goToPage && goToPage(1);
            }}
          >
            {"< " + selectedGroup}
          </span>
        );
      }
    } else if (selectedStore && !selectedItem) {
      return (
        <span onClick={(e) => setMap && setMap(!map)}>
          {"< Store: " + selectedStore.n.replaceAll("-", " ")}
        </span>
      );
    } else if (selectedItem) {
      return (
        <span onClick={close}>
          {"< " + (selectedStore ? "Store" : selectedGroup)}
        </span>
      );
    } else if (selectedGroup) {
      return <span onClick={close}>{"< " + selectedGroup}</span>;
    } else {
      return "Cannabis Items Near You";
    }
  };

  return (
    <div
      className={`titlebar ${
        !selectedGroup || fetching ? "no-pointer-events" : ""
      }`}
      onPointerDown={(e) => {
        e.stopPropagation();
        globalThis.contentSliderPressed = false;
        globalThis.filterControlPressed = false;
        globalThis.pageSliderPressed = false;
      }}
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
