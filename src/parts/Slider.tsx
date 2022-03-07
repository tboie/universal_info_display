import { useEffect } from "react";

export type T_SLIDER_TYPE = "choice" | "group" | "page";

type T_SLIDER = {
  type: T_SLIDER_TYPE;
  titles: string[];
  selected: string[];
  sort?: "asc" | "desc";
  select: (type: T_SLIDER_TYPE, title: string, on: boolean) => void;
};

type T_SLIDER_LABEL = {
  type: T_SLIDER_TYPE;
  title: string;
  on: boolean;
  click: (type: T_SLIDER_TYPE, title: string, on: boolean) => void;
};

const Slider = ({ type, titles, selected, select }: T_SLIDER) => {
  useEffect(() => {
    let observer: IntersectionObserver;

    if (type === "group" || type === "page") {
      const container = document.querySelector(`.slider.${type}`);
      const labels = document.querySelectorAll(`.slider.${type} .slider_label`);

      if (container) {
        const handleIntersect: IntersectionObserverCallback = (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const ele = entry.target as HTMLElement;
              select(type, ele.innerText, ele.classList.contains("selected"));
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
    }

    return () => observer.disconnect();
  }, [titles]);

  return (
    <div className={`slider ${type}`}>
      {titles.map((t, idx) => (
        <Label
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

const Label = ({ type, title, on, click }: T_SLIDER_LABEL) => {
  return (
    <span
      className={`slider_label ${on ? "selected" : ""}`}
      onClick={() => click(type, title, on)}
    >
      {title}
    </span>
  );
};

export default Slider;
