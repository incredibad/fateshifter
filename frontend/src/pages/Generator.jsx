import { useState, useEffect, useRef } from 'react';
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
  null,
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
  null,
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
  null,
  { label: 'Non-Green', colors: ['W', 'U', 'B', 'R'] },
  { label: 'Non-White', colors: ['U', 'B', 'R', 'G'] },
  { label: 'Non-Blue', colors: ['W', 'B', 'R', 'G'] },
  { label: 'Non-Black', colors: ['W', 'U', 'R', 'G'] },
  { label: 'Non-Red', colors: ['W', 'U', 'B', 'G'] },
  null,
  { label: 'Five-Color', colors: ['W', 'U', 'B', 'R', 'G'] },
];

const SPIN_DURATION = 5;
const FRAME_HEIGHT = 300;
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

export default function Generator() {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [selectedColors, setSelectedColors] = useState(['W', 'U', 'B']);
  const [listsLoading, setListsLoading] = useState(true);

  const [phase, setPhase] = useState('idle'); // idle | fetching | spinning | done
  const [reelFrames, setReelFrames] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [prevResult, setPrevResult] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [error, setError] = useState(null);

  const stripRef = useRef(null);
  const spinTimerRef = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    api.getLists().then(data => {
      setLists(data);
      if (data.length > 0) setSelectedListId(String(data[0].id));
    }).catch(() => {}).finally(() => setListsLoading(false));
  }, []);

  useEffect(() => {
    return () => { if (spinTimerRef.current) clearTimeout(spinTimerRef.current); };
  }, []);

  // Trigger CSS translateY animation when reel mounts in spinning phase
  useEffect(() => {
    if (phase !== 'spinning' || !stripRef.current || !reelFrames.length) return;
    const el = stripRef.current;
    el.style.transition = 'none';
    el.style.transform = 'translateY(0)';
    void el.offsetHeight;
    el.style.transition = `transform ${SPIN_DURATION}s cubic-bezier(0, 0, 0.15, 1)`;
    el.style.transform = `translateY(-${(reelFrames.length - 1) * FRAME_HEIGHT}px)`;
  }, [phase, reelFrames]);

  function resetResult() {
    setPhase('idle');
    setReelFrames([]);
    setCurrentResult(null);
    setNoResults(false);
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
  }

  function toggleColor(c) {
    setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    resetResult();
  }

  function applyPreset(preset) {
    setSelectedColors([...preset.colors]);
    resetResult();
  }

  function matchesPreset(preset) {
    return [...selectedColors].sort().join(',') === [...preset.colors].sort().join(',');
  }

  async function roll() {
    if (phase === 'fetching' || phase === 'spinning') return;
    setError(null);
    setNoResults(false);
    setPhase('fetching');

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
      }, SPIN_DURATION * 1000 + 200);

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

  const resultColors = currentResult?.type === 'pair'
    ? [...new Set([...currentResult.a.color_identity, ...currentResult.b.color_identity])]
    : currentResult?.commander?.color_identity;

  return (
    <div className={styles.page} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <h1 className={styles.heading}>Commander Generator</h1>

      <section className={styles.section}>
        <div className={styles.sectionLabel}>List</div>
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
            onChange={e => { setSelectedListId(e.target.value); resetResult(); }}
          >
            {lists.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.commander_count})</option>
            ))}
          </select>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionLabel}>Colour Identity</div>
        <div className={styles.colorRow}>
          {COLORS.map(c => (
            <button
              key={c}
              className={`${styles.colorBtn} ${selectedColors.includes(c) ? styles.colorBtnOn : ''} ${styles[`color${c}`]}`}
              onClick={() => toggleColor(c)}
              title={COLOR_LABELS[c]}
            >
              <span className={`mana-pip mana-${c}`}>{c}</span>
              <span className={styles.colorName}>{COLOR_LABELS[c]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionLabel}>Presets</div>
        <div className={styles.presets}>
          {PRESETS.map((preset, i) =>
            preset === null ? (
              <div key={`div-${i}`} className={styles.presetDivider} />
            ) : (
              <button
                key={preset.label}
                className={`${styles.preset} ${matchesPreset(preset) ? styles.presetActive : ''}`}
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            )
          )}
        </div>
      </section>

      <button className={styles.rollBtn} onClick={roll} disabled={!canRoll}>
        {phase === 'fetching'
          ? <span className="spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
          : <>⚄ {phase === 'done' ? 'Roll Again' : 'Roll Commander'}</>
        }
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {showReel && (
        <div className={styles.reelViewport}>
          <div className={styles.reelStrip} ref={stripRef}>
            {reelFrames.map((frame, i) => (
              <div key={i} className={styles.reelFrame}>
                <ReelFrame frame={frame} />
              </div>
            ))}
          </div>
          <div className={styles.reelVignette} />
        </div>
      )}

      {phase === 'done' && noResults && (
        <div className={styles.empty}>
          No commanders in this list exactly match the selected colours.
        </div>
      )}

      {phase === 'done' && currentResult && (
        <div className={`${styles.resultInfo} fade-up`}>
          <div className={styles.resultName}>
            {currentResult.type === 'single'
              ? currentResult.commander.name
              : <>{currentResult.a.name}<span className={styles.resultPlus}> + </span>{currentResult.b.name}</>
            }
          </div>
          <div className={styles.resultMeta}>
            <ManaPips colors={resultColors} />
            {currentResult.type === 'single' && <PartnerBadge type={currentResult.commander.partner_type} />}
          </div>
        </div>
      )}
    </div>
  );
}
