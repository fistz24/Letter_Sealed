import { useEffect, useRef, useState } from "react";
import { isLetterComplete, nextRevealProgress } from "../../../shared/letter";
type DoodleName = "calendar" | "chevron" | "feather" | "gift" | "heart" | "inbox" | "lock" | "mail" | "menu" | "music" | "pencil" | "rotate" | "sparkle" | "stamp" | "close";

function DoodleIcon({ name, size = 17 }: { name: DoodleName; size?: number }) {
  const paths: Record<DoodleName, React.ReactNode> = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 18h3" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    feather: <path d="M20 4C12 3 6 8 5 16c-.2 2 1 3 3 2 7-2 10-7 12-14ZM4 21l7-7M7 17l-3-1M10 13l-3-2" />,
    gift: <><rect x="3" y="9" width="18" height="12" rx="2" /><path d="M12 9v12M3 13h18M12 9H8a2.5 2.5 0 1 1 2.5-2.5C12 6.5 12 9 12 9Zm0 0h4a2.5 2.5 0 1 0-2.5-2.5C12 6.5 12 9 12 9Z" /></>,
    heart: <path d="M12 20S4 15.5 4 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.5 12 20 12 20Z" />,
    inbox: <><path d="M4 5h16l2 12H2L4 5Z" /><path d="M2 17h5l2 2h6l2-2h5M8 10h8" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    mail: <><path d="m3 6 9 7 9-7" /><rect x="3" y="5" width="18" height="15" rx="2" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    music: <><path d="M9 18V6l10-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
    pencil: <><path d="m4 20 1-5L16 4a2 2 0 0 1 3 3L8 19l-4 1Z" /><path d="m14 6 4 4M4 20l3-1" /></>,
    rotate: <path d="M20 11a8 8 0 0 0-14-4L4 9m0-5v5h5M4 13a8 8 0 0 0 14 4l2-2m0 5v-5h-5" />,
    sparkle: <path d="m12 3 1.5 6.5L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-2.5L12 3ZM20 4v3M21.5 5.5h-3" />,
    stamp: <><path d="M6 20h12M7 17h10l-1-3c0-2-1-3-4-3s-4 1-4 3l-1 3Z" /><path d="M8 8a4 4 0 0 1 8 0" /><path d="M5 20h14v2H5z" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return <svg className="doodle-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const sampleLetter = `Hey future me,\n\nYou made it here. I hope you are still making room for small, bright things — a warm drink, a song you forgot you loved, a walk with nowhere to be.\n\nKeep going gently.\n\nLove,\nMe`;

function playPencilSound(audioRef: React.MutableRefObject<AudioContext | null>) {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const audio = audioRef.current ?? new AudioContextClass();
  audioRef.current = audio;
  if (audio.state === "suspended") void audio.resume();

  const now = audio.currentTime;
  const buffer = audio.createBuffer(1, audio.sampleRate * 0.055, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.22;
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 1650 + Math.random() * 500;
  filter.Q.value = 1.1;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start(now);
}

function PostalMark({ label, accent = "coral" }: { label: string; accent?: "coral" | "blue" | "yellow" }) {
  return (
    <span className={`postal-mark postal-mark-${accent}`} aria-hidden="true">
      {label}
    </span>
  );
}

function PaperSheet({ text, onChange, onType }: { text: string; onChange: (value: string) => void; onType: () => void }) {
  return (
    <div className="letter-paper-wrap">
      <div className="paper-clip" aria-hidden="true" />
      <div className="letter-paper">
        <div className="paper-topline">
          <span>LETTER No. 0047</span>
          <span>✦ made with feeling</span>
        </div>
        <div className="paper-date">A little note for later</div>
        <textarea
          aria-label="Letter message"
          value={text}
          onChange={(event) => {
            onChange(event.target.value);
            onType();
          }}
          spellCheck="true"
        />
        <div className="paper-signature">your handwriting, your time</div>
      </div>
    </div>
  );
}

function CreateView({ onOpenPreview }: { onOpenPreview: () => void }) {
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("future me");
  const [date, setDate] = useState("2027-01-01");
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);
  const lastSound = useRef(0);

  const onType = () => {
    if (!soundOn) return;
    const now = Date.now();
    if (now - lastSound.current > 46) {
      lastSound.current = now;
      playPencilSound(audioRef);
    }
  };

  return (
    <section className="workspace create-workspace">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow"><DoodleIcon name="pencil" size={14} /> write a little something</p>
          <h1>Put it on paper.</h1>
          <p className="lede">A note for someone you love, or a small promise to the person you’re becoming.</p>
        </div>
        <div className="scribble-heart" aria-hidden="true">♡</div>
      </div>

      <div className="composer-grid">
        <div className="paper-column">
          <PaperSheet text={message} onChange={setMessage} onType={onType} />
          <div className="paper-footer-note"><DoodleIcon name="feather" size={15} /> The nicest things are worth writing down.</div>
        </div>
        <aside className="letter-settings">
          <div className="settings-card">
            <div className="card-kicker"><DoodleIcon name="stamp" size={15} /> seal the details</div>
            <label htmlFor="recipient">This one is for</label>
            <div className="input-with-icon"><DoodleIcon name="heart" size={16} /><input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} /></div>
            <label htmlFor="date">Open on</label>
            <div className="input-with-icon"><DoodleIcon name="calendar" size={16} /><input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="tiny-rule" />
            <div className="sound-row">
              <div><DoodleIcon name="music" size={16} /><span>Pencil sounds</span></div>
              <button className={`toggle ${soundOn ? "is-on" : ""}`} type="button" aria-pressed={soundOn} onClick={() => setSoundOn((value) => !value)}><span /></button>
            </div>
            <button className="seal-button" type="button" onClick={onOpenPreview}><DoodleIcon name="lock" size={17} /> seal this letter <DoodleIcon name="chevron" size={17} /></button>
            <p className="privacy-note"><DoodleIcon name="sparkle" size={13} /> Your letter stays private until its day arrives.</p>
          </div>
          <div className="postcard-tip"><DoodleIcon name="mail" size={18} /><div><strong>Make it feel mailed.</strong><span>Add a line break, a little doodle, or the thing you almost didn’t say.</span></div></div>
        </aside>
      </div>
    </section>
  );
}

function PreviewView({ onBack }: { onBack: () => void }) {
  const [revealed, setRevealed] = useState(24);
  const [turning, setTurning] = useState(false);
  const isComplete = isLetterComplete(revealed);
  const turn = () => {
    if (isComplete || turning) return;
    setTurning(true);
    window.setTimeout(() => {
      setRevealed((value) => nextRevealProgress(value));
      setTurning(false);
    }, 150);
  };
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "r") turn();
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  });

  return (
    <section className="workspace reveal-workspace">
      <div className="reveal-topbar"><button className="back-link" type="button" onClick={onBack}><DoodleIcon name="close" size={16} /> close preview</button><span className="preview-label"><DoodleIcon name="lock" size={14} /> sealed until Jan 01, 2027</span></div>
      <div className="reveal-intro"><p className="eyebrow"><DoodleIcon name="gift" size={14} /> a letter has arrived</p><h1>Turn the little wheel.</h1><p>Keep turning to bring the words up from the page. Take your time.</p></div>
      <div className="typewriter-stage">
        <div className="revealed-paper" style={{ "--reveal": `${revealed}%` } as React.CSSProperties}>
          <div className="revealed-paper-inner"><p className="revealed-label">for future me</p><p>{sampleLetter}</p><div className="reveal-stamp">OPENED<br /><span>with care</span></div></div>
        </div>
        <div className="typewriter">
          <div className="roller"><span /><span /><span /><i /></div>
          <div className="typewriter-body">
            <div className="typewriter-brand">LETTER, SEALED <small>est. 2026</small></div>
            <div className="typewriter-slot"><span /></div>
            <div className="typewriter-keys">{["✦", "♡", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].map((key, index) => <span key={`${key}-${index}`}>{key}</span>)}</div>
            <div className="typewriter-spacebar" />
            <div className="typewriter-scribble">keep turning <span>↗</span></div>
          </div>
          <button className={`crank ${turning ? "turning" : ""}`} type="button" onClick={turn} aria-label="Turn the typewriter wheel" disabled={isComplete}><DoodleIcon name="rotate" size={22} /><span>turn</span></button>
        </div>
      </div>
      <div className="reveal-progress"><span>{isComplete ? "The whole letter is here." : `${revealed}% surfaced`}</span><div><i style={{ width: `${revealed}%` }} /></div><span className="keyboard-hint">or press <b>R</b></span></div>
    </section>
  );
}

export default function Home() {
  const [view, setView] = useState<"create" | "preview">("create");
  return (
    <main className="app-shell">
      <header className="top-nav">
        <button className="brand-lockup" type="button" onClick={() => setView("create")}><span className="brand-mark"><DoodleIcon name="mail" size={17} /></span><span>letter, sealed</span></button>
        <nav><button className={view === "create" ? "active" : ""} type="button" onClick={() => setView("create")}><DoodleIcon name="pencil" size={15} /> write a letter</button><button type="button" onClick={() => setView("preview")}><DoodleIcon name="inbox" size={15} /> opened letters <span className="nav-count">1</span></button></nav>
        <button className="menu-button" type="button" aria-label="Open menu"><DoodleIcon name="menu" size={20} /></button>
      </header>
      <div className="color-tape tape-one" /><div className="color-tape tape-two" />
      {view === "create" ? <CreateView onOpenPreview={() => setView("preview")} /> : <PreviewView onBack={() => setView("create")} />}
      <footer className="footer-note"><span>made for the things that take time</span><span className="footer-doodle">— &nbsp; ♡ &nbsp; —</span><span>no rush, ever.</span></footer>
    </main>
  );
}
