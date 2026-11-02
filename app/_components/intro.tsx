import type { CSSProperties } from "react";

// Opening animation: the 51 shows up on black, then the view pulls back to all
// 51 hooded characters as black shadows: one in front wearing the 51 and a
// crowd of 50 behind. They are lifted up and off, back rows first, as the site
// comes into view. Pure CSS (see globals.css), so it plays before hydration,
// never blocks clicks, and is skipped for people who prefer reduced motion.

// Character outline traced from the artwork: hood tip at the top left, round
// head, cloak shoulders, then a little more cloak below the bust ending in a
// ragged hem (kept below the screen until the characters are lifted).
const FIGURE_PATH =
  "M29.3 0L32.4 0L32.6 0.3L33.7 0L35.5 0.8L36 1.3L37.5 1.8L40.1 1.8L40.9 2.1L42.4 3.1L42.9 3.1L43.2 3.6L43.7 3.6L45.2 4.4L45.8 4.9L47.6 5.4L48.8 5.4L52.2 7.7L54 8.2L54.2 8.7L55.8 9.3L56.6 9.8L57.1 10.5L58.1 11.1L58.6 11.8L59.1 11.8L59.6 12.3L60.7 12.6L62.7 14.1L67.9 17.2L69.7 18.8L72 19.8L72.8 20.3L73 20.8L73.5 20.8L74.6 21.9L75.6 22.4L79.2 25.2L81.2 26.2L84.3 29L85.9 30.1L86.6 31.1L87.4 31.4L88.9 33.7L90 34.2L91 35.2L92.8 38.6L93.8 41.4L95.4 43.2L95.6 44.2L96.7 45.8L96.7 46.5L97.4 48.1L97.4 48.8L98.2 50.4L98.2 51.2L98.7 51.7L99.2 54.8L99.5 55L99.2 55.3L99.7 56.8L100 60.7L99.7 60.9L99.7 63.8L99.5 64L99.5 65L99 66.6L98.7 70.4L98.5 70.7L98.2 72.5L95.4 80.5L94.9 82.8L94.1 84.1L93.3 87.4L91.5 90.5L91 93.8L90.2 95.1L90.2 95.9L90 96.1L90.5 97.7L91.3 98.5L91.8 100L92.3 100.5L92.3 101.8L92.5 102.1L92.3 104.1L91 106.4L91 106.9L92 107.7L92.8 108.7L92.8 109.8L93.1 110L92.8 112.1L90.7 116.2L90.5 117.7L90.9 123.7L91.7 129L87.5 128L84.3 129.8L81.1 128.6L77.9 128.4L74.7 129.5L71.5 129.1L68.3 128.7L65.1 129.5L61.9 129.5L58.7 129.1L55.5 129.4L52.3 129.3L49.1 129.6L45.9 128.5L42.7 128.7L39.5 129.4L36.3 129.4L33.1 128.1L29.9 129.4L26.7 128.9L23.5 129.8L20.3 129.6L17.1 128.2L13.9 129L10.7 129.8L7.5 129.4L5.5 129L6.3 123.7L6.7 117.7L6.7 115.9L6.4 115.7L6.7 114.4L6.2 112.6L5.7 111.8L5.7 110L6.2 109.5L6.4 108.2L9.5 104.6L9.5 100.3L10.3 99.2L10.3 98.5L11.3 97.2L11.6 95.9L10.3 93.1L9.5 92L9.5 91.3L8.5 89.2L8.5 88.7L8 88.4L7.7 87.4L5.4 83.5L5.4 82.8L4.9 82L4.9 81.5L4.1 80.7L3.6 78.9L3.6 77.9L2.1 74.6L2.1 72.8L1.8 72.5L1.3 68.9L0.8 68.1L0.8 66.6L0.3 64.8L0.3 61.7L0 61.4L0.3 56.6L0.5 56.3L0.5 52.4L0.8 52.2L0.8 48.6L2.6 43.7L3.1 42.9L3.1 41.9L4.1 38.6L5.7 35.5L5.9 34.2L6.9 32.4L7.5 30.6L8.7 28L10.8 25.7L11.3 24.2L12.3 22.6L12.3 18.5L12.6 18.3L12.3 18L12.6 17.2L12.3 14.7L12.6 14.1L12.3 13.9L12.3 11.3L12.1 11.1L12.1 8.7L11.8 8.5L12.1 7.7L11.8 5.1L13.1 1.8L14.1 1.3L15.4 1.3L17.5 0.5L17.7 0.8L19.3 0.8L20.6 0.3L21.1 0.5L21.3 0.3L25.7 0.5L26 0.3L29 0.3Z";

// The outline as a mask, so each character is just a tinted box.
const FIGURE_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130"><path d="${FIGURE_PATH}"/></svg>`,
)}")`;

// Crowd rows, back to front: how many stand in each row on wide screens and on
// tall ones (50 each), and how far apart the rows are, in % of screen height.
const WIDE = { rows: [9, 9, 9, 8, 8, 7], spacing: 14 };
const TALL = { rows: [7, 7, 6, 6, 6, 5, 5, 4, 4], spacing: 10 };

// Seeded, so the crowd is the same on every load and on server and client.
function random(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// x: centre in % of screen width. y: bottom of the bust in % of screen height.
// w: width in vw. back: 0 for the front row up to 1 for the back row.
function layout({ rows, spacing }: typeof WIDE, seed: number) {
  const rand = random(seed);
  return rows.flatMap((count, r) => {
    const back = rows.length - 1 - r;
    return Array.from({ length: count }, (_, i) => ({
      x: ((i + 0.5) / count) * 100 + (rand() - 0.5) * (40 / count),
      y: back * spacing + (rand() - 0.5) * 2,
      w: (120 / count) * (0.92 + rand() * 0.16),
      back: back / (rows.length - 1),
    }));
  });
}

const round = (n: number) => Math.round(n * 100) / 100;
const wide = layout(WIDE, 51);
const tall = layout(TALL, 15);
const extra = random(7);
const CROWD = wide.map((spot, i) => ({
  "--wx": round(spot.x),
  "--wy": round(spot.y),
  "--ww": round(spot.w),
  "--wb": round(spot.back),
  "--tx": round(tall[i].x),
  "--ty": round(tall[i].y),
  "--tw": round(tall[i].w),
  "--tb": round(tall[i].back),
  "--flip": extra() < 0.4 ? -1 : 1,
  "--tilt": `${round((extra() - 0.5) * 28)}deg`,
  "--jitter": round(extra()),
})) as CSSProperties[];

export default function Intro() {
  return (
    <div
      aria-hidden="true"
      className="intro"
      style={{ "--figure-mask": FIGURE_MASK } as CSSProperties}
    >
      <div className="intro-crowd">
        {CROWD.map((style, i) => (
          <span key={i} className="intro-figure" style={style} />
        ))}
        <span className="intro-figure intro-lead" />
      </div>
      {/* The front character's spot again, never scaled, holding the 51: it
          stays put while the crowd pulls back, then leaves with that character. */}
      <span className="intro-lead intro-lead-mark">
        <span className="intro-mark">51</span>
      </span>
    </div>
  );
}
