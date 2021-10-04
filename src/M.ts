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
  {
    t: "s",
    x: 0,
    y: 0,
    w: 50,
    h: 50,
    z: 0,
    l: { t: 0, r: 50, l: 0 },
    c: { t: [], r: [1, 3], b: [2, 3], l: [] },
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 50,
    y: 0,
    w: 50,
    h: 50,
    z: 0,
    l: { t: 0, r: 100, l: 50 },
    c: { t: [], r: [], b: [2, 3], l: [0, 2] },
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 0,
    y: 50,
    w: 50,
    h: 50,
    z: 0,
    l: { l: 0, b: 100 },
    c: { t: [0, 1], r: [1, 3], b: [], l: [] },
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 50,
    y: 50,
    w: 50,
    h: 50,
    z: 0,
    l: { r: 100, b: 100 },
    c: { t: [1, 2], r: [], b: [], l: [0, 2] },
    bp: ["sm", "lg"],
  },
] as T[];
