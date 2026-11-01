// Opening animation: the 51 shows up on black, then the view pulls back to
// three of the hooded characters standing side by side, blacked out like
// shadows, with the 51 on the middle one. They are lifted up and off one after
// another as the site comes into view. Pure CSS (see globals.css), so it plays
// before hydration, never blocks clicks, and is skipped for people who prefer
// reduced motion.

// Character outline traced from the artwork: hood tip at the top left, round
// head, cloak shoulders, then the cloak runs on to a ragged hem (kept below the
// screen until the characters are lifted).
const FIGURE_PATH =
  "M29.3 0L32.4 0L32.6 0.3L33.7 0L35.5 0.8L36 1.3L37.5 1.8L40.1 1.8L40.9 2.1L42.4 3.1L42.9 3.1L43.2 3.6L43.7 3.6L45.2 4.4L45.8 4.9L47.6 5.4L48.8 5.4L52.2 7.7L54 8.2L54.2 8.7L55.8 9.3L56.6 9.8L57.1 10.5L58.1 11.1L58.6 11.8L59.1 11.8L59.6 12.3L60.7 12.6L62.7 14.1L67.9 17.2L69.7 18.8L72 19.8L72.8 20.3L73 20.8L73.5 20.8L74.6 21.9L75.6 22.4L79.2 25.2L81.2 26.2L84.3 29L85.9 30.1L86.6 31.1L87.4 31.4L88.9 33.7L90 34.2L91 35.2L92.8 38.6L93.8 41.4L95.4 43.2L95.6 44.2L96.7 45.8L96.7 46.5L97.4 48.1L97.4 48.8L98.2 50.4L98.2 51.2L98.7 51.7L99.2 54.8L99.5 55L99.2 55.3L99.7 56.8L100 60.7L99.7 60.9L99.7 63.8L99.5 64L99.5 65L99 66.6L98.7 70.4L98.5 70.7L98.2 72.5L95.4 80.5L94.9 82.8L94.1 84.1L93.3 87.4L91.5 90.5L91 93.8L90.2 95.1L90.2 95.9L90 96.1L90.5 97.7L91.3 98.5L91.8 100L92.3 100.5L92.3 101.8L92.5 102.1L92.3 104.1L91 106.4L91 106.9L92 107.7L92.8 108.7L92.8 109.8L93.1 110L92.8 112.1L90.7 116.2L90.5 117.7L91.1 129.7L91.7 149L87.5 147.8L84.3 150L81.1 148.5L77.9 148.3L74.7 149.6L71.5 149.1L68.3 148.6L65.1 149.6L61.9 149.6L58.7 149.1L55.5 149.4L52.3 149.3L49.1 149.8L45.9 148.4L42.7 148.7L39.5 149.5L36.3 149.5L33.1 147.9L29.9 149.4L26.7 148.9L23.5 150L20.3 149.7L17.1 148.1L13.9 149L10.7 150L7.5 149.5L5.5 149L6.1 129.7L6.7 117.7L6.7 115.9L6.4 115.7L6.7 114.4L6.2 112.6L5.7 111.8L5.7 110L6.2 109.5L6.4 108.2L9.5 104.6L9.5 100.3L10.3 99.2L10.3 98.5L11.3 97.2L11.6 95.9L10.3 93.1L9.5 92L9.5 91.3L8.5 89.2L8.5 88.7L8 88.4L7.7 87.4L5.4 83.5L5.4 82.8L4.9 82L4.9 81.5L4.1 80.7L3.6 78.9L3.6 77.9L2.1 74.6L2.1 72.8L1.8 72.5L1.3 68.9L0.8 68.1L0.8 66.6L0.3 64.8L0.3 61.7L0 61.4L0.3 56.6L0.5 56.3L0.5 52.4L0.8 52.2L0.8 48.6L2.6 43.7L3.1 42.9L3.1 41.9L4.1 38.6L5.7 35.5L5.9 34.2L6.9 32.4L7.5 30.6L8.7 28L10.8 25.7L11.3 24.2L12.3 22.6L12.3 18.5L12.6 18.3L12.3 18L12.6 17.2L12.3 14.7L12.6 14.1L12.3 13.9L12.3 11.3L12.1 11.1L12.1 8.7L11.8 8.5L12.1 7.7L11.8 5.1L13.1 1.8L14.1 1.3L15.4 1.3L17.5 0.5L17.7 0.8L19.3 0.8L20.6 0.3L21.1 0.5L21.3 0.3L25.7 0.5L26 0.3L29 0.3Z";

const FIGURES = [1, 2, 3];

export default function Intro() {
  return (
    <div aria-hidden="true" className="intro">
      <div className="intro-row intro-crowd">
        {FIGURES.map((n) => (
          <svg
            key={n}
            viewBox="0 0 100 150"
            className={`intro-slot intro-figure intro-lift-${n}`}
          >
            <path d={FIGURE_PATH} />
          </svg>
        ))}
      </div>
      {/* The same row again, never scaled, holding the 51: it stays put while
          the characters pull back into place, then leaves with the middle one. */}
      <div className="intro-row">
        <span className="intro-slot" />
        <span className="intro-slot intro-lift-2">
          <span className="intro-mark">51</span>
        </span>
        <span className="intro-slot" />
      </div>
    </div>
  );
}
