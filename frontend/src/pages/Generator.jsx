import { useState } from 'react';
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
  null, // divider
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
  if (!colors || colors.length === 0) {
    return <span className={`mana-pip mana-C ${styles.pip}`}>C</span>;
  }
  return (
    <span className={styles.pips}>
      {colors.map(c => (
        <span key={c} className={`mana-pip mana-${c} ${styles.pip}`}>{c}</span>
      ))}
    </span>
  );
}

function PartnerBadge({ type }) {
  if (!type || type === 'none') return null;
  const labels = { partner: 'Partner', partner_with: 'Partner With', friends_forever: 'Friends Forever' };
  return <span className={styles.partnerBadge}>{labels[type]}</span>;
}

function CommanderCard({ commander, label, accent }) {
  return (
    <div className={`${styles.commanderCard} ${accent ? styles.commanderCardAccent : ''}`}>
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
  const [selectedColors, setSelectedColors] = useState(['W', 'U', 'B']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function toggleColor(c) {
    setSelectedColors(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
    setResult(null);
  }

  function applyPreset(preset) {
    setSelectedColors([...preset.colors]);
    setResult(null);
  }

  function matchesPreset(preset) {
    const sel = [...selectedColors].sort().join(',');
    const pre = [...preset.colors].sort().join(',');
    return sel === pre;
  }

  async function generate() {
    setError(null);
    setLoading(true);
    try {
      const data = await api.generate(selectedColors);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const hasResult = result && (result.single || result.partners);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Commander Generator</h1>

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

      <button
        className={styles.rollBtn}
        onClick={generate}
        disabled={loading}
      >
        {loading ? (
          <span className="spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
        ) : (
          <>⚄ Roll Commander</>
        )}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {result && !result.single && !result.partners && (
        <div className={styles.empty}>
          No commanders match the selected colours.
          <span> Add more in <a href="/settings" className={styles.link}>Settings</a>.</span>
        </div>
      )}

      {hasResult && (
        <div className={`${styles.results} fade-up`}>
          {result.single && (
            <div className={styles.resultGroup}>
              <CommanderCard commander={result.single} label="Single Commander" />
            </div>
          )}
          {result.partners && (
            <div className={styles.resultGroup}>
              <div className={styles.partnerPairLabel}>Partner Pair</div>
              <div className={styles.partnerPair}>
                <CommanderCard commander={result.partners.a} label="" />
                <div className={styles.partnerPlus}>+</div>
                <CommanderCard commander={result.partners.b} label="" />
              </div>
            </div>
          )}
          <button className={styles.rollAgain} onClick={generate} disabled={loading}>
            Roll again
          </button>
        </div>
      )}
    </div>
  );
}
