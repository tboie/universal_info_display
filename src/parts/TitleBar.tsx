const TitleBar = ({
  selectedGroup,
  selectedPageIdx,
  totalPages,
}: {
  selectedGroup: string;
  selectedPageIdx: number;
  totalPages: number;
}) => {
  return (
    <div id="universal_info_display_title_bar">
      <span>{selectedGroup || "Loading"}</span>
      <span>{selectedPageIdx + "/" + totalPages}</span>
    </div>
  );
};

export default TitleBar;
