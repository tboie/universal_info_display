import { useEffect } from "react";

export type T_SLIDER_TYPE = "choice" | "group" | "page";

type T_SLIDER = {
  type: T_SLIDER_TYPE;
  titles: string[];
  selected: string[];
  select: (type: T_SLIDER_TYPE, title: string, on: boolean) => void;
};

type T_SLIDER_LABEL = {
  idx: number;
  type: T_SLIDER_TYPE;
  title: string;
  on: boolean;
  click: (type: T_SLIDER_TYPE, title: string, on: boolean) => void;
};

const Slider = ({ type, titles, selected, select }: T_SLIDER) => {
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
              const idx = parseInt(ele.id.replace("slider_label_" + type, ""));
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
    if (type === "page" && !globalThis.pageSliderPressed) {
      document
        .querySelector(`.slider.${type} .selected`)
        ?.scrollIntoView({ inline: "center" });
    }
  }, [selected]);

  return (
    <div className={`slider ${type}`}>
      {titles.map((t, idx) => (
        <Label
          idx={idx}
          key={idx}
          type={type}
          title={t}
          on={selected.includes(t)}
          click={select}
        />
      ))}
    </div>
  );
};

const Label = ({ idx, type, title, on, click }: T_SLIDER_LABEL) => {
  return (
    <span
      id={`slider_label_${type + idx}`}
      className={`slider_label ${on ? "selected" : ""}`}
      onClick={() => {
        if (type === "group") {
          click(type, title, on);
        }
      }}
      onTouchStart={() => {
        globalThis.contentSliderPressed = false;
        if (type === "page") {
          globalThis.groupSliderPressed = false;
          globalThis.pageSliderPressed = true;
        } else if (type === "group") {
          globalThis.pageSliderPressed = false;
          globalThis.groupSliderPressed = true;
        }
      }}
    >
      {title}
    </span>
  );
};

export default Slider;
