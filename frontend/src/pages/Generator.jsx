import { useState, useEffect } from 'react';
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

function ManaPips({ colors }) {
  if (!colors || colors.length === 0) return <span className={`mana-pip mana-C ${styles.pip}`}>C</span>;
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

function CommanderCard({ commander, label }) {
  return (
    <div className={styles.commanderCard}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardName}>{commander.name}</div>
      <div className={styles.cardMeta}>
        <ManaPips colors={commander.color_identity} />
        <PartnerBadge type={commander.partner_type} />
      </div>
    </div>
  );
}

export default function Generator() {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [selectedColors, setSelectedColors] = useState(['W', 'U', 'B']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getLists().then(data => {
      setLists(data);
      if (data.length > 0) setSelectedListId(String(data[0].id));
    }).catch(() => {}).finally(() => setListsLoading(false));
  }, []);

  function toggleColor(c) {
    setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    setResult(null);
  }

  function applyPreset(preset) {
    setSelectedColors([...preset.colors]);
    setResult(null);
  }

  function matchesPreset(preset) {
    return [...selectedColors].sort().join(',') === [...preset.colors].sort().join(',');
  }

  async function generate() {
    if (!selectedListId) return;
    setError(null);
    setLoading(true);
    try {
      setResult(await api.generate(selectedListId, selectedColors));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const hasResult = result?.result;
  const noLists = !listsLoading && lists.length === 0;

  return (
    <div className={styles.page}>
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
            onChange={e => { setSelectedListId(e.target.value); setResult(null); }}
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

      <button className={styles.rollBtn} onClick={generate} disabled={loading || !selectedListId}>
        {loading
          ? <span className="spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
          : <>⚄ Roll Commander</>
        }
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && !result.result && (
        <div className={styles.empty}>
          No commanders in this list exactly match the selected colours.
        </div>
      )}

      {hasResult && (
        <div className={`${styles.results} fade-up`}>
          {result.result.type === 'single' && (
            <div className={styles.resultGroup}>
              <CommanderCard commander={result.result.commander} label="Commander" />
            </div>
          )}
          {result.result.type === 'pair' && (
            <div className={styles.resultGroup}>
              <div className={styles.partnerPairLabel}>Partner Pair</div>
              <div className={styles.partnerPair}>
                <CommanderCard commander={result.result.a} label="" />
                <div className={styles.partnerPlus}>+</div>
                <CommanderCard commander={result.result.b} label="" />
              </div>
            </div>
          )}
          <button className={styles.rollAgain} onClick={generate} disabled={loading}>Roll again</button>
        </div>
      )}
    </div>
  );
}
