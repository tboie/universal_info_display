import { Store } from "./Shell";

const TitleBar = ({
  selectedGroup,
  selectedPageIdx,
  totalPages,
  f1Vals,
  f2Vals,
  f3Vals,
  f4Vals,
  f5Vals,
  selectedStore,
  miles,
  fetching,
}: {
  selectedGroup: string;
  selectedPageIdx: number;
  totalPages: number;
  f1Vals: string[];
  f2Vals: string[];
  f3Vals: string[];
  f4Vals: string[];
  f5Vals: string[];
  selectedStore?: Store;
  miles: number;
  fetching: boolean;
}) => {
  return (
    <div className="titlebar">
      {selectedGroup && (
        <span className="title">
          {selectedStore
            ? selectedStore?.n.replaceAll("-", " ")
            : `${
                fetching
                  ? "Fetching " + selectedGroup
                  : selectedGroup + " < " + miles + "mi"
              }`}
        </span>
      )}
      {!fetching && selectedGroup && (
        <>
          <span className="filters">
            {f1Vals
              .concat(f2Vals.concat(f3Vals.concat(f4Vals).concat(f5Vals)))
              .join(", ")}
          </span>
          <span className="numpages">
            {totalPages > 0 ? selectedPageIdx + "/" + totalPages : ""}
          </span>
        </>
      )}
    </div>
  );
};

export default TitleBar;
