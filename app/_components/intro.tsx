// Opening animation: the page starts under a black cover with the white 51
// from the artwork. The cover dips as if grabbed, is pulled up and off, and
// uncovers the site. Pure CSS (see globals.css), so it plays before hydration,
// never blocks clicks, and is skipped for people who prefer reduced motion.
export default function Intro() {
  return (
    <div aria-hidden="true" className="intro">
      <div className="intro-cover">
        <div className="intro-cloth" />
        <span className="intro-mark">51</span>
      </div>
    </div>
  );
}
