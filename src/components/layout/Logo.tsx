import { siteConfig } from "@/data/siteConfig";

/**
 * Временный типографический wordmark.
 * Слот фиксирован по высоте, поэтому замена на фирменный SVG
 * не сдвинет ни хедер, ни футер: достаточно подставить <img>/<svg> сюда.
 */
export function Logo({ size = 17 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 13, height: 28 }}>
      <span className="mark" aria-hidden="true" />
      <span style={{ fontWeight: 800, letterSpacing: "0.04em", fontSize: size }}>
        {siteConfig.shortName}
      </span>
    </span>
  );
}
