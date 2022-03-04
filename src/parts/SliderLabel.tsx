const SliderLabel = ({
  selected,
  title,
  idx,
  type,
  click,
}: {
  type: "page" | "group";
  selected: boolean;
  title: string;
  idx: number;
  click?: (idx: number, title: string, selected: boolean) => any;
}) => {
  return (
    <span
      key={idx}
      id={`${type === "page" ? "num" : "group"}${idx}`}
      className={`slider_label ${selected ? "selected" : ""}`}
      onClick={() => click && click(idx, title, selected)}
    >
      {title}
    </span>
  );
};

export default SliderLabel;
