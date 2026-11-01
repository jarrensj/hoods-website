// Opening animation: the hood from the artwork fills the screen with the white
// 51 on it. It dips as if grabbed, then is pulled up and away, shrinking into
// the hooded-51 silhouette as the site comes into view around it. Pure CSS
// (see globals.css), so it plays before hydration, never blocks clicks, and is
// skipped for people who prefer reduced motion.

// Hood outline traced loosely from the artwork (rounded crown on the left, back
// sloping down to the right) with a hand-drawn wobble baked into the points.
const HOOD_PATH =
  "M-0.3 90.3L-0.1 87.8L0.2 85.5L0.5 83.2L0.6 80.8L0.8 78.4L2.0 76.0L2.4 73.4L3.0 70.8L2.4 68.1L3.0 65.4L3.1 62.6L3.7 59.9L3.4 57.0L3.9 54.2L4.7 51.4L5.8 48.6L6.5 45.7L6.5 42.8L7.1 39.9L7.5 37.0L8.3 34.1L7.8 31.0L8.4 28.1L8.8 25.2L10.4 22.5L10.9 19.7L11.6 16.9L12.1 14.0L12.7 13.2L13.1 12.3L12.6 11.2L12.6 10.3L12.5 9.3L13.5 8.8L13.7 7.9L14.3 7.4L14.4 6.5L15.5 6.3L15.9 5.7L16.3 5.1L16.1 4.1L16.4 3.4L17.1 3.1L17.6 2.6L18.2 2.3L18.6 1.6L19.6 2.1L20.2 2.0L21.0 2.2L21.4 1.1L22.1 1.1L22.8 0.7L23.6 0.9L24.4 0.4L25.2 0.2L26.0 0.7L27.7 1.5L29.3 2.2L31.1 1.9L32.8 2.4L34.5 2.5L36.1 3.3L38.0 2.8L39.8 3.2L41.5 3.4L43.0 4.7L44.5 5.5L46.2 6.1L47.8 6.7L49.4 7.4L50.8 8.5L52.7 8.6L54.4 9.1L56.2 9.2L57.4 10.8L59.0 11.6L60.3 12.8L61.9 13.4L63.0 14.9L64.2 16.2L65.6 17.1L67.4 17.7L69.1 18.4L70.1 19.8L71.7 21.2L73.0 22.8L74.9 24.0L75.6 26.1L76.8 27.9L77.7 29.9L79.6 31.2L81.0 32.9L82.4 34.7L83.5 36.8L84.9 38.8L86.5 40.7L87.2 43.1L88.0 45.6L88.3 48.4L89.9 50.7L90.7 53.4L92.1 56.0L92.5 59.0L94.1 61.7L95.3 64.7L96.4 67.9L96.6 71.3L96.9 74.9L97.7 78.5L98.4 82.2L99.2 86.0L99.3 89.7L97.5 89.9L95.0 90.1L92.5 90.9L90.0 90.3L87.5 90.2L85.0 89.9L82.5 90.1L80.0 89.8L77.5 89.3L75.0 89.4L72.5 89.7L70.0 90.6L67.5 90.2L65.0 90.4L62.5 90.0L60.0 90.6L57.5 90.0L55.0 89.7L52.5 89.1L50.0 89.6L47.5 90.0L45.0 90.1L42.5 90.2L40.0 90.1L37.5 90.8L35.0 90.4L32.5 90.2L30.0 89.2L27.5 89.7L25.0 89.6L22.5 90.0L20.0 89.6L17.5 90.0L15.0 90.5L12.5 90.7L10.0 90.5L7.5 89.7L5.0 89.8L2.5 89.6Z";

export default function Intro() {
  return (
    <div aria-hidden="true" className="intro">
      <div className="intro-hood">
        <svg viewBox="0 0 100 90" className="intro-hood-shape">
          <path d={HOOD_PATH} />
        </svg>
        <span className="intro-mark">51</span>
      </div>
    </div>
  );
}
