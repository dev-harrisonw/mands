export type Person = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  officialName: string | null;
  image: string | null;
  weight: string | null;
  msId: string | null;
  path: string | null;
  addedBy: string | null;
};

export type Rating = {
  productId: string;
  personId: string;
  score: number;
  addedAt: string | null;
};

export type Notice = {
  id: string;
  personId: string;
  personName: string;
  productId: string;
  productName: string;
  score: number | null;
  at: string;
};

export type State = {
  people: Person[];
  products: Product[];
  ratings: Rating[];
  notices: Notice[];
};

export type BoardRow = {
  id: string;
  name: string;
  officialName: string | null;
  image: string | null;
  weight: string | null;
  path: string | null;
  average: number | null;
  count: number;
  rank: number | null;
  yourScore: number | null;
};

export type ScoreLine = {
  personId: string;
  name: string;
  score: number;
  you: boolean;
  addedAt: string | null;
};

export type TasterStat = {
  id: string;
  name: string;
  count: number;
  average: number | null;
  high: number | null;
  low: number | null;
  rank: number | null;
  you: boolean;
};

export type MsHit = {
  msId: string;
  name: string;
  image: string | null;
  weight: string | null;
  path: string;
};

export type SearchHit = MsHit & {
  onBoardId: string | null;
};
