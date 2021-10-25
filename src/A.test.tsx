import { render } from "@testing-library/react";
import U from "./A";
import M from "./M";

test("renders", () => {
  render(
    <>
      {M.map((m, i) => (
        <U key={i} {...m} remove={() => {}} />
      ))}
    </>
  );
});
