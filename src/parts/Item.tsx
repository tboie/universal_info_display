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

  const itemContent = [
    /*<img
      key={"test1"}
      className={`glow`}
      src={`/media/glow.png`}
      alt={`glow`}
    />,*/
    <img
      key={"test1"}
      className={`cover`}
      src={`/media/flower.gif`}
      alt={`item`}
    />,
    <p key={"test2"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    /*
    <p key={"test3"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test4"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test5"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <img
      key={"test6"}
      className={`cover`}
      src={`/media/flower.gif`}
      alt={`item`}
    />,
    <p key={"test7"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <img
      key={"test8"}
      className={`cover`}
      src={`/media/flower.gif`}
      alt={`item`}
    />,
    <p key={"test9"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test10"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test11"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <img
      key={"test12"}
      className={`cover`}
      src={`/media/flower.gif`}
      alt={`item`}
    />,
    <p key={"test13"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test14"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test15"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test16"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test17"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test18"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <img
      key={"test19"}
      className={`cover`}
      src={`/media/flower.gif`}
      alt={`item`}
    />,
    <p key={"test20"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test21"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    <p key={"test22"} className={`desc`}>
      {item?.desc || "NO DESC"}
    </p>,
    */
  ];

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
        type={"dynamic"}
        ItemContent={itemContent}
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        setSelectedPageIdx={setSelectedPageIdx}
      />
      <button id="item-close" onClick={() => close(-1)}>
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
