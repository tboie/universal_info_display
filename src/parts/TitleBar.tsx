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
}: PartTitleBarType) => {
  const getTitle = (): string | JSX.Element => {
    if (fetching) {
      return "Fetching " + selectedGroup;
    } else if (map) {
      if (selectedStore) {
        return (
          <span
            onClick={(e) => {
              setMap && setMap(!map);
              setSelectedStore && setSelectedStore(undefined);
            }}
          >
            {"< Store: " + selectedStore.n}
          </span>
        );
      } else {
        return (
          <span onClick={(e) => setMap && setMap(!map)}>
            {"< " + selectedGroup}
          </span>
        );
      }
    } else if (selectedStore) {
      return (
        <span onClick={(e) => setMap && setMap(!map)}>
          {"< Store: " + selectedStore.n.replaceAll("-", " ")}
        </span>
      );
    } else if (selectedItem) {
      return (
        <span onClick={close}>
          {"< " + selectedItem.s.replaceAll("-", " ")}
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
