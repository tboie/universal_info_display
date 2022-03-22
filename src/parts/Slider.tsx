import { useEffect } from "react";

export type T_SLIDER_TYPE = "choice" | "group" | "page";

type T_SLIDER = {
  type: T_SLIDER_TYPE;
  titles: string[];
  selected: string[];
  select: (type: T_SLIDER_TYPE, title: string, on: boolean) => void;
  setSelectedPageIdx?: (val: number) => any;
};

type T_SLIDER_LABEL = {
  idx: number;
  type: T_SLIDER_TYPE;
  title: string;
  on: boolean;
  click: (type: T_SLIDER_TYPE, title: string, on: boolean) => void;
};

const Slider = ({
  type,
  titles,
  selected,
  select,
  setSelectedPageIdx,
}: T_SLIDER) => {
  useEffect(() => {
    let observer: IntersectionObserver;
    const container = document.querySelector(`.slider.${type}`);
    const labels = document.querySelectorAll(`.slider.${type} .slider_label`);

    if (container) {
      const handleIntersect: IntersectionObserverCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (type === "page" && globalThis.pageSliderPressed) {
              const ele = entry.target as HTMLElement;
              const idx =
                parseInt(ele.id.replace("slider_label_" + type, "")) - 1;
              const title = titles[idx];
              const selected = ele.classList.contains("selected");
              select(type, title, selected);
            }
          }
        });
      };

      const options = {
        root: container,
        threshold: 0,
        rootMargin: "-50%",
      };

      observer = new IntersectionObserver(handleIntersect, options);
      labels.forEach((label) => observer.observe(label));
    }

    return () => observer?.disconnect();
  }, [titles]);

  useEffect(() => {
    if (type === "page") {
      document
        .querySelector(`.slider.${type} .selected`)
        ?.scrollIntoView({ inline: "center" });
    }
  }, [selected]);

  return (
    <div className={`slider ${type} ${type === "page" ? "tick" : ""}`}>
      {titles.length ? (
        titles.map((t, idx) => (
          <Label
            idx={idx + 1}
            key={idx}
            type={type}
            title={t}
            on={selected.includes(t)}
            click={select}
          />
        ))
      ) : (
        <Label
          idx={0}
          key={"0"}
          type={"page"}
          title={"0"}
          on={true}
          click={select}
        />
      )}
      {type === "page" ? (
        <>
          <button
            id="btn_first"
            onClick={() => setSelectedPageIdx && setSelectedPageIdx(1)}
          >
            {"<<"}
          </button>
          <button
            id="btn_last"
            onClick={() =>
              setSelectedPageIdx && setSelectedPageIdx(titles.length)
            }
          >
            {">>"}
          </button>
        </>
      ) : null}
    </div>
  );
};

const Label = ({ idx, type, title, on, click }: T_SLIDER_LABEL) => {
  return (
    <span
      id={`slider_label_${type + idx}`}
      className={`slider_label ${on ? "selected" : ""}`}
      onClick={(e) => {
        click(type, title, on);
      }}
      onTouchStart={() => {
        globalThis.contentSliderPressed = false;
        if (type === "page") {
          globalThis.groupSliderPressed = false;
          globalThis.choiceSliderPressed = false;
          globalThis.pageSliderPressed = true;
        } else if (type === "group") {
          globalThis.pageSliderPressed = false;
          globalThis.choiceSliderPressed = false;
          globalThis.groupSliderPressed = true;
        } else if (type === "choice") {
          globalThis.pageSliderPressed = false;
          globalThis.groupSliderPressed = false;
          globalThis.choiceSliderPressed = true;
        }
      }}
    >
      {title}
    </span>
  );
};

export default Slider;
