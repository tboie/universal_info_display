import { UniversalInfoDisplayItem } from "./Shell";

const Item = ({
  item,
  close,
}: {
  item: UniversalInfoDisplayItem;
  close: (val: number) => any;
}) => {
  return (
    <div id="item">
      {item.id}
      <img src={item.img} />
      <button id="item_close" onClick={() => close(-1)}>
        Close
      </button>
    </div>
  );
};

export default Item;
