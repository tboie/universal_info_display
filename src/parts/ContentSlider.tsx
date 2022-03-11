import { useState, useEffect } from "react";
import DetectableOverflow from "react-detectable-overflow";
import {
  chunkArr,
  chunkString,
  ViewSection,
  UniversalInfoDisplayItem,
  GroupFilter,
} from "./Shell";
import Slider from "./Slider";
import TitleBar from "./TitleBar";

const ContentSlider = ({
  contentType,
  items,
  pagesBool,
  setPagesBool,
  selectedPageIdx,
  setSelectedPageIdx,
  selectedGroup,
  sliderSelect,
}: ViewSection & {
  contentType: "text" | "item";
  items: UniversalInfoDisplayItem[];
  sliderSelect: any;
}) => {
  const [textChunks, setTextChunks] = useState(
    //this might be a problem when text type gets implemented
    contentType === "text" ? items : []
  );

  // callback on element change
  const overflowChanged = (isOverflowing: boolean, i: number) => {
    if (contentType === "text") {
      setPagesBool((prevState: any) => {
        let copy = [...prevState];
        copy[i] = isOverflowing;
        return copy;
      });
    }
  };

  const calc = () => {
    // Split text into pages using heights
    if (contentType === "text") {
      const winH = window.innerHeight;
      const allH = document
        .getElementById("all-text")
        ?.getBoundingClientRect().height;

      if (winH && allH) {
        const numScreens = Math.floor(allH / (winH - winH * 0.2));
        const charsPerScreen = parseInt(
          (textChunks[0].length / numScreens).toFixed(0)
        );
        const chunks = chunkString(textChunks[0], charsPerScreen);

        if (chunks) {
          setTextChunks(chunks);
        }
      }
    }

    // scroll speed/direction
    const container = document.getElementById(
      "universal_info_display_content_slider"
    );
    if (container) {
      let lastOffset = container.scrollLeft;
      let lastDate = new Date().getTime();

      container.addEventListener("scroll", (e) => {
        const delayInMs = e.timeStamp - lastDate;
        const ele = e.target as HTMLDivElement;

        const offset = ele.scrollLeft - lastOffset;
        globalThis.scrollSpeed = offset / delayInMs;

        if (lastOffset === ele.scrollLeft) {
          globalThis.scrollDirection = "stopped";
        } else if (lastOffset < ele.scrollLeft) {
          globalThis.scrollDirection = "left";
        } else if (lastOffset > ele.scrollLeft) {
          globalThis.scrollDirection = "right";
        }

        lastDate = e.timeStamp;
        lastOffset = ele.scrollLeft;
      });
    }
  };

  // move word to next page
  const proc = () => {
    // stop warnings
    setTimeout(() => {
      pagesBool.some((val, idx) => {
        if (val && textChunks[idx]) {
          const words = textChunks[idx].split(" ");

          if (idx !== textChunks.length - 1) {
            const newText2 =
              words[words.length - 1] + " " + textChunks[idx + 1];

            words.pop();
            const newText1 = words.join(" ");

            setTextChunks((prevState) =>
              prevState.map((txt, i) => {
                if (i === idx) {
                  return newText1;
                } else if (i === idx + 1) {
                  return newText2;
                } else {
                  return txt;
                }
              })
            );

            return true;
            // TODO: fix
          } else if (idx === textChunks.length - 1) {
            if (val) {
              setTextChunks((prevState) => {
                let newCopy = [...prevState];
                newCopy.push("[END]");
                return newCopy;
              });

              return true;
            }
          }
        }
      });
    });
  };

  useEffect(() => {
    calc();
  }, []);

  useEffect(() => {
    if (contentType === "text") {
      if (textChunks.length) {
        proc();
      }
    }
  }, [textChunks]);

  return (
    <>
      <TitleBar
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        totalPages={chunkArr(items, 9).length - 1}
      />
      <div
        id="universal_info_display_content_slider"
        className="content_slider"
      >
        {/* fix this when text implemented */}
        {contentType === "text" && <div id="all-text">{items}</div>}

        {
          /* initial page loader */
          contentType === "text" &&
            textChunks.map((txt, idx) => (
              <div key={idx} className={`page_loader`}>
                <DetectableOverflow
                  onChange={(overflowing) => overflowChanged(overflowing, idx)}
                  style={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflow: "scroll",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  {txt}
                </DetectableOverflow>
              </div>
            ))
        }

        {contentType === "text" &&
          pagesBool
            .filter((p) => p === false)
            .map((p, i) => (
              <Page
                key={i}
                num={i}
                text={textChunks[i]}
                selectedPageIdx={selectedPageIdx}
                setSelectedPageIdx={setSelectedPageIdx}
              />
            ))}

        {contentType === "item" &&
          chunkArr(items, 9).map((items, idx) => (
            <Page
              key={idx}
              num={idx}
              items={items}
              selectedPageIdx={selectedPageIdx}
              setSelectedPageIdx={setSelectedPageIdx}
            />
          ))}
      </div>
      <Slider
        type="page"
        titles={chunkArr(items, 9).map((item, idx) => idx.toString())}
        selected={[selectedPageIdx.toString()]}
        select={sliderSelect}
      />
    </>
  );
};

const Page = ({
  text,
  items,
  num,
  selectedPageIdx,
  setSelectedPageIdx,
}: {
  text?: string;
  items?: UniversalInfoDisplayItem[];
  num: number;
  selectedPageIdx: number;
  setSelectedPageIdx: (val: number) => void;
}) => {
  // IntersectionObservers for page snaps and page changes
  useEffect(() => {
    const handleSnapLeft = (entries: any, observer: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          if (globalThis.contentSliderPressed) {
            if (scrollDirection === "left") {
              if (scrollSpeed < 0.4) {
                const container = document.querySelector(
                  "#universal_info_display_content_slider"
                ) as HTMLElement;

                container.style.overflowX = "hidden";
                setTimeout(() => {
                  entry.target.scrollIntoView({
                    inline: "center",
                  });
                }, 10);
                setTimeout(() => {
                  container.style.overflowX = "scroll";
                }, 100);
              }
            }
          }
        }
      });
    };

    const handleSnapRight = (entries: any, observer: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          if (globalThis.contentSliderPressed) {
            if (scrollDirection === "right") {
              if (scrollSpeed * -1 < 0.4) {
                const container = document.querySelector(
                  "#universal_info_display_content_slider"
                ) as HTMLElement;

                container.style.overflowX = "hidden";
                setTimeout(() => {
                  entry.target.scrollIntoView({
                    inline: "center",
                  });
                }, 10);
                setTimeout(() => {
                  container.style.overflowX = "scroll";
                }, 100);
              }
            }
          }
        }
      });
    };

    const handlePageChange = (entries: any, observer: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          if (globalThis.contentSliderPressed) {
            const id = entry.target.id;
            const selected = parseInt(id.replace("content_page", ""));
            setSelectedPageIdx(selected);
          }
        }
      });
    };

    const container = document.querySelector(
      "#universal_info_display_content_slider"
    ) as HTMLElement;

    const optSnapLeft = {
      root: container,
      threshold: 0,
      rootMargin: "0% -93% 0% 0%",
    };
    const optPageChange = {
      root: container,
      threshold: 0,
      rootMargin: "-50%",
    };
    const optSnapRight = {
      root: container,
      threshold: 0,
      rootMargin: "0% 0% 0% -93%",
    };

    const obsPageChange = new IntersectionObserver(
      handlePageChange,
      optPageChange
    );
    const obsSnapLeft = new IntersectionObserver(handleSnapLeft, optSnapLeft);
    const obsSnapRight = new IntersectionObserver(
      handleSnapRight,
      optSnapRight
    );

    const ele = document.querySelectorAll(".content_page")[num];

    obsPageChange.observe(ele);
    obsSnapLeft.observe(ele);
    obsSnapRight.observe(ele);

    return () => {
      obsPageChange.disconnect();
      obsSnapLeft.disconnect();
      obsSnapRight.disconnect();
    };
  }, []);

  // Center page when changed
  useEffect(() => {
    if (!globalThis.contentSliderPressed) {
      const container = document.querySelector(
        "#universal_info_display_content_slider"
      ) as HTMLElement;

      container.style.overflowX = "hidden";
      setTimeout(() => {
        document
          .querySelectorAll(".content_page")
          [selectedPageIdx]?.scrollIntoView({
            inline: "center",
          });
      }, 10);
      setTimeout(() => {
        container.style.overflowX = "scroll";
      }, 100);
    }
  }, [selectedPageIdx]);

  return (
    <div
      id={`content_page${num}`}
      className="content_page"
      onTouchStart={(e) => {
        globalThis.contentSliderPressed = true;
        globalThis.pageSliderPressed = false;
        globalThis.groupSliderPressed = false;
        globalThis.choiceSliderPressed = false;
      }}
    >
      {text}
      {items?.length && <GridItems page={num} items={items} />}
    </div>
  );
};

const GridItems = ({
  page,
  items,
}: {
  page: number;
  items: UniversalInfoDisplayItem[];
}) => {
  return (
    <div className="item-grid">
      {items.map((item, idx) => {
        return (
          <div className={`item`} key={idx}>
            <img src={`${item.img}`} loading="lazy" alt=""></img>
            <span>{item["price"]}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ContentSlider;
