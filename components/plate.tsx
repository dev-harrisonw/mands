import { productImage } from "@/lib/format";

export function Plate({
  image,
  name,
  alt,
  size = 800,
  eager = false,
  className = "",
}: {
  image: string | null;
  name: string;
  alt: string;
  size?: number;
  eager?: boolean;
  className?: string;
}) {
  const src = productImage(image, size);
  if (!src) {
    return (
      <div
        className={`grid place-items-center bg-blush font-display text-2xl text-muted ${className}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        {name.slice(0, 1)}
      </div>
    );
  }

  return (
    // Catalogue photos and pasted image links aren't limited to one host.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`bg-blush object-cover ${className}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
