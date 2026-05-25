import { useState, useEffect, useRef, useMemo } from 'react';
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
const SCROLL_FRAMES = 20;

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

function buildReel(candidates, result) {
  const pool = shuffle(candidates);
  const scroll = [];
  while (scroll.length < SCROLL_FRAMES) scroll.push(...pool);
  return [...scroll.slice(0, SCROLL_FRAMES), result];
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

function StarField() {
  const layers = useMemo(() => {
    const W = 700, H = 700;
    const cols = [
      '#fff','#fff','#fff','#fff','#fff',
      '#c4b5fd','#c4b5fd','#a78bfa',
      '#93c5fd','#7dd3fc',
      '#fde68a','#fbbf24',
      '#f9a8d4','#a5f3fc',
    ];
    function rnd(n) { return Math.floor(Math.random() * n); }
    function make(count, blur) {
      return Array.from({ length: count }, () =>
        `${rnd(W)}px ${rnd(H)}px ${blur}px ${cols[rnd(cols.length)]}`
      ).join(',');
    }
    return [make(110, 0), make(100, 0), make(80, 0), make(50, 1), make(20, 2)];
  }, []);

  return (
    <>
      {layers.map((shadow, i) => (
        <div key={i} className={`${styles.starLayer} ${styles[`star${i}`]}`} style={{ boxShadow: shadow }} />
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
  const [spinDuration, setSpinDuration] = useState(5);

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
      const cardW = Math.floor(Math.min(w - 60, (h - 60) * 63 / 88));
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
    el.style.transform = 'translateY(0)';
    void el.offsetHeight;
    el.style.transition = `transform ${spinDuration}s cubic-bezier(0, 0, 0.15, 1)`;
    el.style.transform = `translateY(-${(reelFrames.length - 1) * vh}px)`;
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
      const frames = buildReel(candidates, result);

      await preloadImages(frames);

      setReelFrames(frames);
      setCurrentResult(result);
      setPhase('spinning');

      if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
      spinTimerRef.current = setTimeout(() => {
        setPrevResult(result);
        setPhase('done');
      }, spinDuration * 1000 + 200);

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
        {phase === 'fetching'
          ? <span className="spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
          : <>✦ Tempt Fate</>
        }
      </button>

      {error && <div className={styles.error}>{error}</div>}

      <div className={`${styles.reelViewport} ${phase === 'spinning' ? styles.reelSpinning : ''}`} ref={reelViewportRef}>
        <StarField />
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
            <div className={styles.revealShimmerCardWrap}>
              <div className={`${styles.revealShimmer} ${styles.revealShimmerLTR}`} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
