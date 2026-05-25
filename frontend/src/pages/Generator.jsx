import { useState, useEffect, useRef, useMemo } from 'react';
import { animate } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import styles from './Generator.module.css';

const COLORS = ['W', 'U', 'B', 'R', 'G'];
const COLOR_LABELS = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green' };

const PRESETS = [
  { label: 'Colorless', colors: [] },
  { label: 'Mono-W', colors: ['W'] },
  { label: 'Mono-U', colors: ['U'] },
  { label: 'Mono-B', colors: ['B'] },
  { label: 'Mono-R', colors: ['R'] },
  { label: 'Mono-G', colors: ['G'] },
  { label: 'Azorius', colors: ['W', 'U'] },
  { label: 'Dimir', colors: ['U', 'B'] },
  { label: 'Rakdos', colors: ['B', 'R'] },
  { label: 'Gruul', colors: ['R', 'G'] },
  { label: 'Selesnya', colors: ['G', 'W'] },
  { label: 'Orzhov', colors: ['W', 'B'] },
  { label: 'Izzet', colors: ['U', 'R'] },
  { label: 'Golgari', colors: ['B', 'G'] },
  { label: 'Boros', colors: ['R', 'W'] },
  { label: 'Simic', colors: ['G', 'U'] },
  { label: 'Bant', colors: ['G', 'W', 'U'] },
  { label: 'Esper', colors: ['W', 'U', 'B'] },
  { label: 'Grixis', colors: ['U', 'B', 'R'] },
  { label: 'Jund', colors: ['B', 'R', 'G'] },
  { label: 'Naya', colors: ['R', 'G', 'W'] },
  { label: 'Abzan', colors: ['W', 'B', 'G'] },
  { label: 'Jeskai', colors: ['U', 'R', 'W'] },
  { label: 'Sultai', colors: ['B', 'G', 'U'] },
  { label: 'Mardu', colors: ['R', 'W', 'B'] },
  { label: 'Temur', colors: ['G', 'U', 'R'] },
  { label: 'Non-Green', colors: ['W', 'U', 'B', 'R'] },
  { label: 'Non-White', colors: ['U', 'B', 'R', 'G'] },
  { label: 'Non-Blue', colors: ['W', 'B', 'R', 'G'] },
  { label: 'Non-Black', colors: ['W', 'U', 'R', 'G'] },
  { label: 'Non-Red', colors: ['W', 'U', 'B', 'G'] },
  { label: 'Five-Color', colors: ['W', 'U', 'B', 'R', 'G'] },
];

const ANY_PRESET = { label: 'Any', colors: null };
const ALL_PRESETS = [ANY_PRESET, ...PRESETS];

const FRAME_HEIGHT = 450;
const FRAMES_PER_SECOND = 12;

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickExcluding(candidates, prev) {
  if (candidates.length <= 1 || !prev) return pick(candidates);
  const filtered = candidates.filter(c => {
    if (c.type === 'single' && prev.type === 'single')
      return c.commander.id !== prev.commander.id;
    if (c.type === 'pair' && prev.type === 'pair') {
      const cIds = [String(c.a.id), String(c.b.id)].sort().join(',');
      const eIds = [String(prev.a.id), String(prev.b.id)].sort().join(',');
      return cIds !== eIds;
    }
    return true;
  });
  return pick(filtered.length ? filtered : candidates);
}

function buildReel(candidates, result, scrollFrames) {
  const pool = shuffle(candidates);
  const scroll = [];
  while (scroll.length < scrollFrames) scroll.push(...pool);
  return [result, ...scroll.slice(0, scrollFrames)];
}

function getImageUrls(frame) {
  if (frame.type === 'single') return [frame.commander.image_uri].filter(Boolean);
  return [frame.a?.image_uri, frame.b?.image_uri].filter(Boolean);
}

async function preloadImages(frames) {
  const urls = [...new Set(frames.flatMap(getImageUrls))];
  await Promise.all(urls.map(url => new Promise(resolve => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = url;
  })));
}

function matchesPresetColors(preset, selectedColors) {
  if (preset.label === 'Any') return selectedColors === null;
  if (selectedColors === null) return false;
  return [...selectedColors].sort().join(',') === [...preset.colors].sort().join(',');
}

function ChevronDown({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}
    >
      <polyline points="2,4 7,10 12,4"/>
    </svg>
  );
}

function PresetDropdown({ selectedColors, onApply }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  const [panelPos, setPanelPos] = useState(null);

  useEffect(() => {
    if (!open) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPanelPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    searchRef.current?.focus();
    function handleClick(e) {
      if (!containerRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const currentLabel = ALL_PRESETS.find(p => matchesPresetColors(p, selectedColors))?.label ?? 'Custom';
  const filtered = query
    ? ALL_PRESETS.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
    : ALL_PRESETS;

  const panel = open && panelPos && createPortal(
    <div
      ref={panelRef}
      className={styles.presetPanel}
      style={{ position: 'fixed', top: panelPos.top, left: panelPos.left, width: panelPos.width }}
    >
      <input
        ref={searchRef}
        className={styles.presetSearch}
        type="text"
        placeholder="Search presets…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className={styles.presetList}>
        {filtered.map(preset => (
          <button
            key={preset.label}
            className={`${styles.presetOption} ${matchesPresetColors(preset, selectedColors) ? styles.presetOptionActive : ''}`}
            onClick={() => { onApply(preset); setOpen(false); setQuery(''); }}
          >
            {preset.label}
          </button>
        ))}
        {filtered.length === 0 && <div className={styles.presetNoResults}>No presets match</div>}
      </div>
    </div>,
    document.body
  );

  return (
    <div className={styles.presetDropdown} ref={containerRef}>
      <button
        className={styles.presetTrigger}
        onClick={() => setOpen(o => !o)}
      >
        <span>{currentLabel}</span>
        <ChevronDown open={open} />
      </button>
      {panel}
    </div>
  );
}

function ManaPips({ colors }) {
  if (!colors || colors.length === 0)
    return <span className={`mana-pip mana-C ${styles.pip}`}>C</span>;
  return (
    <span className={styles.pips}>
      {colors.map(c => <span key={c} className={`mana-pip mana-${c} ${styles.pip}`}>{c}</span>)}
    </span>
  );
}

function PartnerBadge({ type }) {
  if (!type || type === 'none') return null;
  const labels = {
    partner: 'Partner',
    partner_with: 'Partner With',
    friends_forever: 'Friends Forever',
    choose_a_background: 'Choose a Background',
    background: 'Background',
    doctor_companion: "Doctor's Companion",
    time_lord_doctor: 'Time Lord Doctor',
  };
  return <span className={styles.partnerBadge}>{labels[type]}</span>;
}

function ReelFrame({ frame }) {
  if (frame.type === 'single') {
    const { commander } = frame;
    return (
      <div className={styles.singleFrame}>
        {commander.image_uri
          ? <img src={commander.image_uri} className={styles.cardImg} alt={commander.name} draggable={false} />
          : <div className={styles.cardPlaceholder}><span className={styles.cardPlaceholderName}>{commander.name}</span></div>
        }
      </div>
    );
  }

  const { a, b } = frame;
  if (!a.image_uri && !b.image_uri) {
    return (
      <div className={styles.singleFrame}>
        <div className={styles.cardPlaceholder}>
          <span className={styles.cardPlaceholderName}>{a.name}<br />+<br />{b.name}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.pairFrame}>
      {b.image_uri && <img src={b.image_uri} className={`${styles.cardImg} ${styles.cardBack}`} alt={b.name} draggable={false} />}
      {a.image_uri && <img src={a.image_uri} className={`${styles.cardImg} ${styles.cardFront}`} alt={a.name} draggable={false} />}
    </div>
  );
}

const RUNE_CHARS = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ'];
const RUNE_COLS  = ['#f8f6d8','#4a9ede','#c4b5fd','#a78bfa','#fde68a','#f9a8d4','#6ee7b7','#67e8f9','#fca5a5'];

function RuneField() {
  const runes = useMemo(() => {
    function rnd(n) { return Math.random() * n; }
    function rndI(n) { return Math.floor(Math.random() * n); }
    return Array.from({ length: 45 }, (_, id) => {
      const size  = rnd(14) + 10;
      const color = RUNE_COLS[rndI(RUNE_COLS.length)];
      const glow  = Math.round(size * 0.9);
      return {
        id,
        char:       RUNE_CHARS[rndI(RUNE_CHARS.length)],
        x:          rnd(94) + 2,
        y:          rnd(94) + 2,
        size,
        color,
        glow,
        opLo:       (rnd(0.1) + 0.04).toFixed(2),
        opHi:       (rnd(0.45) + 0.3).toFixed(2),
        dur:        (rnd(2.5) + 2).toFixed(1),
        delay:      (rnd(6)).toFixed(1),
        spin:       size > 19,
        spinDur:    (rnd(10) + 10).toFixed(1),
        drift:      rndI(5) + 1,
        driftDur:   (rnd(6) + 8).toFixed(1),
        driftDelay: (rnd(4)).toFixed(1),
      };
    });
  }, []);

  return (
    <>
      {runes.map(s => (
        <span
          key={s.id}
          className={styles.rune}
          style={{
            left:       `${s.x}%`,
            top:        `${s.y}%`,
            fontSize:   `${s.size}px`,
            color:      s.color,
            textShadow: `0 0 ${s.glow}px ${s.color}, 0 0 ${s.glow * 2}px ${s.color}80`,
            '--sop-lo': s.opLo,
            '--sop-hi': s.opHi,
            animation:  `runePulse ${s.dur}s ease-in-out ${s.delay}s infinite, runeDrift${s.drift} ${s.driftDur}s ease-in-out ${s.driftDelay}s infinite${s.spin ? `, runeSpin ${s.spinDur}s linear 0s infinite` : ''}`,
          }}
        >
          {s.char}
        </span>
      ))}
    </>
  );
}

export default function Generator() {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [selectedColors, setSelectedColors] = useState(null); // null = Any
  const [listsLoading, setListsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [spinDuration, setSpinDuration] = useState(2.5);

  const [phase, setPhase] = useState('idle'); // idle | fetching | spinning | done
  const [reelFrames, setReelFrames] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [prevResult, setPrevResult] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [error, setError] = useState(null);

  const stripRef = useRef(null);
  const reelViewportRef = useRef(null);
  const spinTimerRef = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    api.getLists().then(data => {
      setLists(data);
      if (data.length > 0) {
        setSelectedListId(String(data[0].id));
        setSelectedColors(data[0].default_colors ?? null);
      }
    }).catch(() => {}).finally(() => setListsLoading(false));
    api.getSettings().then(s => {
      if (s.spin_duration) setSpinDuration(parseInt(s.spin_duration, 10));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    return () => { if (spinTimerRef.current) clearTimeout(spinTimerRef.current); };
  }, []);

  useEffect(() => {
    function measure() {
      const el = reelViewportRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const cardW = Math.floor(Math.min(w - 120, (h - 120) * 63 / 88));
      el.style.setProperty('--frame-height', `${h}px`);
      el.style.setProperty('--card-w', `${cardW}px`);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (reelViewportRef.current) ro.observe(reelViewportRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== 'spinning' || !stripRef.current || !reelFrames.length || !reelViewportRef.current) return;
    const vh = reelViewportRef.current.clientHeight;
    reelViewportRef.current.style.setProperty('--frame-height', `${vh}px`);
    const el = stripRef.current;
    el.style.transition = 'none';
    el.style.transform = `translateY(-${(reelFrames.length - 1) * vh}px)`;
    void el.offsetHeight;
    el.style.transition = `transform ${spinDuration}s linear`;
    el.style.transform = 'translateY(0)';
    function onEnd() {
      const lastFrame = el.firstElementChild;
      if (lastFrame && reelViewportRef.current) {
        const cardW = parseFloat(getComputedStyle(reelViewportRef.current).getPropertyValue('--card-w')) || 300;
        animate(lastFrame, { y: 0 }, {
          type: 'spring',
          stiffness: 400,
          damping: 10,
          from: cardW * 26 / 63,
        });
      }
    }
    el.addEventListener('transitionend', onEnd, { once: true });
    return () => el.removeEventListener('transitionend', onEnd);
  }, [phase, reelFrames, spinDuration]);

  function resetResult() {
    setPhase('idle');
    setReelFrames([]);
    setCurrentResult(null);
    setNoResults(false);
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
  }

  function toggleColor(c) {
    setSelectedColors(prev => {
      if (prev === null) return [c];
      return prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c];
    });
    resetResult();
  }

  function applyPreset(preset) {
    setSelectedColors(preset.colors === null ? null : [...preset.colors]);
    resetResult();
  }

  const currentFilterLabel = (() => {
    if (selectedColors === null) return 'Any';
    const match = PRESETS.find(p => matchesPresetColors(p, selectedColors));
    return match ? match.label : 'Custom';
  })();

  async function roll() {
    if (phase === 'fetching' || phase === 'spinning') return;
    setError(null);
    setNoResults(false);
    setPhase('fetching');
    setFiltersOpen(false);

    try {
      const { candidates } = await api.generateCandidates(selectedListId, selectedColors);

      if (!candidates.length) {
        setNoResults(true);
        setPhase('done');
        return;
      }

      const result = pickExcluding(candidates, prevResult);
      const frames = buildReel(candidates, result, Math.max(8, Math.round(spinDuration * FRAMES_PER_SECOND)));

      await preloadImages(frames);

      setReelFrames(frames);
      setCurrentResult(result);
      setPhase('spinning');

      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      spinTimerRef.current = setTimeout(() => {
        setPrevResult(result);
        setPhase('done');
      }, spinDuration * 1000 + 50);

    } catch (e) {
      setError(e.message);
      setPhase('idle');
    }
  }

  function handleTouchStart(e) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (dy > 50 && (phase === 'idle' || phase === 'done') && selectedListId) {
      roll();
    }
  }

  const canRoll = (phase === 'idle' || phase === 'done') && !!selectedListId && !listsLoading;
  const noLists = !listsLoading && lists.length === 0;
  const showReel = phase === 'spinning' || (phase === 'done' && reelFrames.length > 0);

  return (
    <div className={styles.page} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <section className={styles.section}>
        <div className={styles.listRow}>
          {listsLoading ? (
            <div className={styles.listPlaceholder} />
          ) : noLists ? (
            <div className={styles.noLists}>
              No lists yet. <Link to="/lists" className={styles.link}>Create one in Lists</Link> to get started.
            </div>
          ) : (
            <select
              className={styles.listSelect}
              value={selectedListId}
              onChange={e => {
                const newId = e.target.value;
                setSelectedListId(newId);
                const list = lists.find(l => String(l.id) === newId);
                setSelectedColors(list?.default_colors ?? null);
                resetResult();
              }}
            >
              {lists.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.commander_count})</option>
              ))}
            </select>
          )}
          <button
            className={`${styles.filtersToggle} ${filtersOpen ? styles.filtersToggleOpen : ''}`}
            onClick={() => setFiltersOpen(f => !f)}
          >
            <span>{currentFilterLabel}</span>
            <ChevronDown open={filtersOpen} />
          </button>
        </div>
      </section>

      <div className={`${styles.accordion} ${filtersOpen ? styles.accordionOpen : ''}`}>
        <div className={styles.accordionInner}>
          <section className={styles.section}>
            <div className={styles.sectionLabel}>Colour Identity</div>
            <div className={styles.colorRow}>
              <button
                className={`${styles.colorBtn} ${selectedColors === null ? styles.colorBtnAny : ''}`}
                onClick={() => { setSelectedColors(null); resetResult(); }}
              >
                Any
              </button>
              {COLORS.map(c => (
                <button
                  key={c}
                  className={`${styles.colorBtn} ${selectedColors !== null && selectedColors.includes(c) ? styles.colorBtnOn : ''} ${styles[`color${c}`]}`}
                  onClick={() => toggleColor(c)}
                  title={COLOR_LABELS[c]}
                >
                  <i className={`ms ms-${c.toLowerCase()} ms-cost mana-pip`} />
                  <span className={styles.colorName}>{COLOR_LABELS[c]}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionLabel}>Preset</div>
            <PresetDropdown selectedColors={selectedColors} onApply={applyPreset} />
          </section>
        </div>
      </div>

      <hr className={styles.divider} />

      <button className={styles.rollBtn} onClick={roll} disabled={!canRoll}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={styles.rollBtnSparkle}>
          <path strokeLinejoin="round" strokeLinecap="round" d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z" />
          <path strokeLinejoin="round" strokeLinecap="round" d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z" />
          <path strokeLinejoin="round" strokeLinecap="round" d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z" />
        </svg>
        {phase === 'fetching'
          ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          : 'Tempt Fate'
        }
      </button>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.reelViewport} ref={reelViewportRef}>
        <RuneField />
        {showReel ? (
          <>
            <div className={styles.reelStrip} ref={stripRef}>
              {reelFrames.map((frame, i) => (
                <div key={i} className={styles.reelFrame}>
                  <ReelFrame frame={frame} />
                </div>
              ))}
            </div>
            <div className={styles.reelVignette} />
          </>
        ) : phase === 'done' && noResults ? (
          <div className={styles.reelEmpty}>
            {selectedColors === null
              ? 'No commanders in this list.'
              : 'No commanders in this list exactly match the selected colours.'}
          </div>
        ) : null}
        {phase === 'done' && reelFrames.length > 0 && !noResults && (
          <>
            <div className={`${styles.revealShimmer} ${styles.revealShimmerRTL}`} />
            {currentResult?.type === 'pair' ? (
              <>
                <div className={styles.revealShimmerPairFront}>
                  <div className={`${styles.revealShimmer} ${styles.revealShimmerLTR}`} />
                  <div className={`${styles.revealShimmer} ${styles.revealShimmerLTR2}`} />
                </div>
                <div className={styles.revealShimmerPairBack}>
                  <div className={`${styles.revealShimmer} ${styles.revealShimmerLTR}`} />
                  <div className={`${styles.revealShimmer} ${styles.revealShimmerLTR2}`} />
                </div>
              </>
            ) : (
              <div className={styles.revealShimmerCardWrap}>
                <div className={`${styles.revealShimmer} ${styles.revealShimmerLTR}`} />
                <div className={`${styles.revealShimmer} ${styles.revealShimmerLTR2}`} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
