import { useState } from "react";
import ContentSlider from "./ContentSlider";
import "./Item.css";

import { UniversalInfoDisplayItem } from "./Shell";
import Slider from "./Slider";
import TitleBar from "./TitleBar";

type PartItemType = {
  selectedItemIdx: number;
  item: UniversalInfoDisplayItem;
  close: (val: number) => any;
  selectedGroup: string;
};

const Item = ({
  selectedItemIdx,
  item,
  close,
  selectedGroup,
}: PartItemType) => {
  const [selectedPageIdx, setSelectedPageIdx] = useState(1);

  return (
    <div id="item">
      <TitleBar
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        totalPages={2}
        fetching={false}
        map={false}
        totalItems={1}
        close={() => {}}
        selectedItem={item}
      />
      <ContentSlider
        type={"item"}
        items={[]}
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        setSelectedPageIdx={setSelectedPageIdx}
      />

      {/*<img src={"/media/flower.gif"} alt="item" /> */}
      <button id="item_close" onClick={() => close(-1)}>
        X
      </button>
      <Slider
        type={"page"}
        titles={["0", "1"]}
        selected={[selectedPageIdx.toString()]}
        select={() => {}}
        setSelectedPageIdx={setSelectedPageIdx}
        fetching={false}
      />
    </div>
  );
};

export default Item;
