const TitleBar = ({
  selectedGroup,
  selectedPageIdx,
  totalPages,
  f1Vals,
  f2Vals,
  f3Vals,
  f4Vals,
  f5Vals,
}: {
  selectedGroup: string;
  selectedPageIdx: number;
  totalPages: number;
  f1Vals: string[];
  f2Vals: string[];
  f3Vals: string[];
  f4Vals: string[];
  f5Vals: string[];
}) => {
  return (
    <div id="universal_info_display_title_bar">
      <span>
        {f1Vals
          .concat(f2Vals.concat(f3Vals.concat(f4Vals).concat(f5Vals)))
          .join(", ") || selectedGroup}
      </span>
      <span>{selectedPageIdx + "/" + totalPages}</span>
    </div>
  );
};

export default TitleBar;
