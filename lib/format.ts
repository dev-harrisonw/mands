export function formatAverage(value: number) {
  const text = (Math.round(value * 100) / 100).toFixed(2);
  return text.replace(/(\.\d)0$/, "$1");
}

export function formatScore(value: number) {
  return (Math.round(value * 2) / 2).toFixed(1);
}

export function formatWhen(iso: string | null) {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function ratingLabel(count: number) {
  return `${count} rating${count === 1 ? "" : "s"}`;
}

export function namesDiffer(name: string, officialName: string | null) {
  if (!officialName) return false;
  const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return norm(name) !== norm(officialName);
}

export function listNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function productImage(image: string | null, width = 800) {
  if (!image) return null;
  if (image.startsWith("https://")) {
    try {
      const url = new URL(image);
      if (url.protocol !== "https:") return null;
      return url.toString();
    } catch {
      return null;
    }
  }
  if (image.includes("..") || image.includes("/")) return null;
  const file = image.includes(".") ? image : `${image}.jpg`;
  if (!/^[\w.-]+$/.test(file)) return null;
  return `https://assets.digitalcontent.marksandspencer.app/image/upload/w_${width},q_auto,c_fill,f_auto/${file}`;
}

export function shopUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("https://www.marksandspencer.com/")) return path;
  if (path.startsWith("/food/")) return `https://www.marksandspencer.com${path}`;
  return null;
}

export function cleanImageInput(input: string) {
  const value = input.trim();
  if (!value) return null;
  return productImage(value);
}
