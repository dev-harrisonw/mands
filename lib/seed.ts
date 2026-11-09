import type { State } from "./types";

const people: [string, string][] = [
  ["kyle", "Kyle"],
  ["jo", "Jo"],
  ["sue", "Sue"],
  ["amy", "Amy"],
  ["erin", "Erin"],
  ["james", "James"],
  ["lucie", "Lucie"],
  ["leah", "Leah"],
  ["ava", "Ava"],
  ["emily", "Emily"],
  ["michelle", "Michelle"],
  ["sarah-p", "Sarah P"],
  ["sarah-w", "Sarah W"],
  ["mia", "Mia"],
  ["lee", "Lee"],
  ["kirstie", "Kirstie"],
];

const products = [
  {
    id: "custard-cream-cookie",
    name: "Chunked N’ Loaded Custard Cream Cookie",
    officialName: "Chunked N’ Loaded Custard Cream Cookie",
    image: "d7c1999de85cc35c93bd4742c4bfbfa8.jpg",
    weight: "107 g",
    msId: "61228996",
    path: "/food/chunked-n-loaded-custard-cream-cookie/p/fdp61228996",
  },
  {
    id: "chocolate-cornflake-cookie",
    name: "Chocolate Cornflake Cookie",
    officialName: "Chocolate and Cornflake Cookies",
    image: "4f77ef6f4c9e01156ce89b819b3f5a31.jpg",
    weight: "365 g",
    msId: "61272780",
    path: "/food/chocolate-and-cornflake-cookies/p/fdp61272780",
  },
  {
    id: "malt-caramel-cookie",
    name: "Chunked N' Loaded Chocolate, Malt Caramel Cookie",
    officialName: "Chunked N’ Loaded Milk Chocolate, Malt and Caramel Cookie",
    image: "14d53d18506f7a76b6ce2d09247b8d1a.jpg",
    weight: "105 g",
    msId: "61272730",
    path: "/food/chunked-n-loaded-milk-chocolate-malt-and-caramel-cookie/p/fdp61272730",
  },
  {
    id: "cheese-tasters",
    name: "Cheese Tasters",
    officialName: "Cheese Tasters",
    image: "206641361f880310dfea6b70d00b5c8e.jpg",
    weight: "30 g",
    msId: "20002044",
    path: "/food/cheese-tasters/p/fdp20002044",
  },
  {
    id: "cheese-twist",
    name: "Cheese Twist",
    officialName: "Cheddar and Onion Twist",
    image: "00992384550b09bd899a3ddeacc94722.jpg",
    weight: "85 g",
    msId: "21099731",
    path: "/food/cheddar-and-onion-twist/p/fdp21099731",
  },
  {
    id: "spicy-tomato-twist",
    name: "Spicy Tomato Twist",
    officialName: "Spicy Tomato and Cheddar Knot",
    image: "b1fabb617272298acd3fba7fe4dbd26f.jpg",
    weight: "120 g",
    msId: "61273834",
    path: "/food/spicy-tomato-and-cheddar-knot/p/fdp61273834",
  },
  {
    id: "sausage-ragu-rigatoni",
    name: "Sausage Ragu Rigatoni",
    officialName: "Sausage Ragu Rigatoni",
    image: "8f14e6f1c141b09eaa2fc4477ad6b063.jpg",
    weight: "400 g",
    msId: "21003687",
    path: "/food/sausage-ragu-rigatoni/p/fdp21003687",
  },
  {
    id: "spicy-buffalo-mac",
    name: "Spicy Buffalo Mac & Cheese",
    officialName: "Macaroni Cheese with Spicy Buffalo Sauce",
    image: "a13d14f5c398e4cff246c77cd84a67de.jpg",
    weight: "400 g",
    msId: "61271377",
    path: "/food/macaroni-cheese-with-spicy-buffalo-sauce/p/fdp61271377",
  },
  {
    id: "lemon-meringue-doughnut",
    name: "Dunked N’ Loaded Lemon Meringue Doughnut",
    officialName: "Dunked N’ Loaded Lemon Meringue Doughnut",
    image: "c867f1c9909356042e3be1ea37ff71dd.jpg",
    weight: "100 g",
    msId: "61227533",
    path: "/food/dunked-n-loaded-lemon-meringue-doughnut/p/fdp61227533",
  },
  {
    id: "pink-lady-apple-juice",
    name: "Pink Lady Apple Juice",
    officialName: "Collection Pressed Pink Lady Apple Juice",
    image: "354894e96cabd42dcc50f4a2d302da5a.jpg",
    weight: "350 ml",
    msId: "60619051",
    path: "/food/collection-pressed-pink-lady-apple-juice/p/fdp60619051",
  },
  {
    id: "chocolate-dot-cake",
    name: "Chocolate Dot Cake",
    officialName: "Chocolate Dot Cake",
    image: "9eb087022f0769522e7dc223ae99ddc4.jpg",
    weight: "110 g",
    msId: "61285844",
    path: "/food/chocolate-dot-cake/p/fdp61285844",
  },
  {
    id: "birthday-dot-cake",
    name: "Birthday Dot Cake",
    officialName: "Birthday Dot Cake",
    image: "f5b0bfaf8fab6a64b83c6dfdb1cbf006.jpg",
    weight: "120 g",
    msId: "61285843",
    path: "/food/birthday-dot-cake/p/fdp61285843",
  },
  {
    id: "chocolate-clementine-milkshake",
    name: "Chocolate & Clementine Milkshake",
    officialName: "Chocolate Orange Milkshake",
    image: "23218663edd1c779d55e3ebaeeb6a31e.jpg",
    weight: "750 ml",
    msId: "60758645",
    path: "/food/chocolate-orange-milkshake/p/fdp60758645",
  },
  {
    id: "wensleydale-sandwich",
    name: "Wensleydale & Carrot Chutney Sandwich",
    officialName: "Wensleydale and Carrot Chutney Sandwich",
    image: "69be8ed208a8db1cc1b002f33b6caf37.jpg",
    weight: "199 g",
    msId: "21105205",
    path: "/food/wensleydale-and-carrot-chutney-sandwich/p/fdp21105205",
  },
  {
    id: "chunky-country-vegetable-soup",
    name: "Chunky Country Vegetable Soup",
    officialName: "Chunky Country Vegetable Soup",
    image: "ccbcebc816c4dc6628859cd3788dbed0.jpg",
    weight: "600 g",
    msId: "21000051",
    path: "/food/chunky-country-vegetable-soup/p/fdp21000051",
  },
];

const scores: Record<string, Record<string, number>> = {
  "custard-cream-cookie": { kyle: 10, amy: 5.5, lucie: 10, leah: 9, ava: 9 },
  "chocolate-cornflake-cookie": {
    kyle: 7,
    jo: 4,
    sue: 3,
    amy: 6,
    erin: 8.5,
    leah: 8.5,
    ava: 9,
    emily: 5,
    mia: 7,
  },
  "malt-caramel-cookie": { jo: 8.5, amy: 7.5 },
  "cheese-tasters": { kyle: 9, sue: 7, amy: 9, erin: 7, lucie: 7, ava: 7, mia: 2 },
  "cheese-twist": { kyle: 8, sue: 10, amy: 7, lucie: 10, ava: 9, mia: 6 },
  "spicy-tomato-twist": { sue: 9, amy: 8, lucie: 8 },
  "sausage-ragu-rigatoni": { kyle: 9.5, jo: 7, erin: 7, lucie: 6 },
  "spicy-buffalo-mac": { kyle: 9.5, amy: 9, lucie: 4 },
  "lemon-meringue-doughnut": { kyle: 7 },
  "pink-lady-apple-juice": { kyle: 10, jo: 1, erin: 10, lucie: 4, mia: 10 },
  "chocolate-dot-cake": { kyle: 8.5, lucie: 10 },
  "birthday-dot-cake": { kyle: 9, "sarah-p": 8 },
  "chocolate-clementine-milkshake": { jo: 10, lucie: 7 },
  "wensleydale-sandwich": { amy: 10, erin: 9, lucie: 6, ava: 10 },
  "chunky-country-vegetable-soup": { "sarah-p": 10 },
};

export function seedState(): State {
  const state: State = {
    people: people.map(([id, name]) => ({ id, name })),
    products: products.map((product) => ({ ...product, addedBy: null })),
    ratings: Object.entries(scores).flatMap(([productId, byPerson]) =>
      Object.entries(byPerson).map(([personId, score]) => ({
        productId,
        personId,
        score,
        addedAt: null,
      })),
    ),
    notices: [],
  };

  const personIds = new Set(state.people.map((person) => person.id));
  const productIds = new Set(state.products.map((product) => product.id));
  for (const rating of state.ratings) {
    if (!personIds.has(rating.personId)) {
      throw new Error(`Unknown taster ${rating.personId}`);
    }
    if (!productIds.has(rating.productId)) {
      throw new Error(`Unknown product ${rating.productId}`);
    }
  }

  return state;
}
