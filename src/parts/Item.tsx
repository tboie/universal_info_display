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
  const [contentNodes, setContentNodes] = useState(getContentNodes());

  function getContentNodes() {
    return [
      <img
        key={"test1"}
        className={`glow`}
        src={`/media/glow.png`}
        alt={`glow`}
      />,
      <img
        key={"test2"}
        className={`cover`}
        src={`/media/flower.gif`}
        alt={`item`}
      />,
      <p key={"test3"} className={`desc`}>
        {item?.desc || "NO DESC"}
      </p>,
      <p key={"test4"} className={`desc`}>
        {item?.desc || "NO DESC"}
      </p>,
      <p key={"test5"} className={`desc`}>
        {item?.desc || "NO DESC"}
      </p>,
      <p key={"test6"} className={`desc`}>
        {item?.desc || "NO DESC"}
      </p>,
      <img
        key={"test7"}
        className={`glow`}
        src={`/media/glow.png`}
        alt={`glow`}
      />,
      <img
        key={"test8"}
        className={`cover`}
        src={`/media/flower.gif`}
        alt={`item`}
      />,

      <p key={"test9"} className={`desc`}>
        {item?.desc || "NO DESC"}
      </p>,
      <img
        key={"test10"}
        className={`glow`}
        src={`/media/glow.png`}
        alt={`glow`}
      />,
      <img
        key={"test11"}
        className={`cover`}
        src={`/media/flower.gif`}
        alt={`item`}
      />,
      <p key={"test12"} className={`desc`}>
        {item?.desc || "NO DESC"}
      </p>,
      <p key={"test13"} className={`desc`}>
        {item?.desc || "NO DESC"}
      </p>,
      <p key={"test14"} className={`desc`}>
        {item?.desc || "NO DESC"}
      </p>,
      <img
        key={"test15"}
        className={`glow`}
        src={`/media/glow.png`}
        alt={`glow`}
      />,
      <img
        key={"test16"}
        className={`cover`}
        src={`/media/flower.gif`}
        alt={`item`}
      />,
    ];
  }

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
        contentNodes={contentNodes}
        setContentNodes={setContentNodes}
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
