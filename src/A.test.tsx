import { render } from "@testing-library/react";
import U from "./A";
import M from "./D";

test("renders", () => {
  render(
    <>
      {M.map((m, i) => (
        <U key={i} {...m} remove={() => {}} split={() => {}} edit={true} />
      ))}
    </>
  );
});
