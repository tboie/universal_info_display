export type T = {
  i?: number;
  t: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  l: { t?: number; r?: number; b?: number; l?: number };
  c: { t: number[]; r: number[]; b: number[]; l: number[] };
  bp: ("sm" | "lg")[];
  aR?: number;
  aB?: number;
  tX?: number;
  tY?: number;
};

export default [
  // top row
  {
    t: "s",
    x: 0,
    y: 0,
    w: 33.333,
    h: 50,
    z: 0,
    l: { t: 0, l: 0 },
    c: { t: [], r: [1], b: [3], l: [] },
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 33.333,
    y: 0,
    w: 33.333,
    h: 50,
    z: 0,
    l: { t: 0 },
    c: { t: [], r: [2], b: [3, 4, 5], l: [0] },
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 66.666,
    y: 0,
    w: 33.333,
    h: 50,
    z: 0,
    l: { t: 0, r: 100 },
    c: { t: [], r: [], b: [5], l: [1] },
    bp: ["sm", "lg"],
  },
  //bottom row
  {
    t: "s",
    x: 0,
    y: 50,
    w: 33.333,
    h: 50,
    z: 0,
    l: { b: 100, l: 0 },
    c: { t: [0], r: [4], b: [], l: [] },
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 33.333,
    y: 50,
    w: 33.333,
    h: 50,
    z: 0,
    l: { b: 100 },
    c: { t: [0, 1, 2], r: [5], b: [], l: [3] },
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 66.666,
    y: 50,
    w: 33.333,
    h: 50,
    z: 0,
    l: { r: 100, b: 100 },
    c: { t: [2], r: [], b: [], l: [4] },
    bp: ["sm", "lg"],
  },
] as T[];
