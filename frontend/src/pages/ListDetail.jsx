import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { scryfallSearch, scryfallNamed } from '../lib/scryfall.js';
import styles from './ListDetail.module.css';

const FILTER_PRESETS = [
  { label: 'Any', colors: null },
  { label: 'Colorless', colors: [] },
  { label: 'Mono-W', colors: ['W'] }, { label: 'Mono-U', colors: ['U'] },
  { label: 'Mono-B', colors: ['B'] }, { label: 'Mono-R', colors: ['R'] }, { label: 'Mono-G', colors: ['G'] },
  { label: 'Azorius', colors: ['W','U'] }, { label: 'Dimir', colors: ['U','B'] },
  { label: 'Rakdos', colors: ['B','R'] }, { label: 'Gruul', colors: ['R','G'] },
  { label: 'Selesnya', colors: ['G','W'] }, { label: 'Orzhov', colors: ['W','B'] },
  { label: 'Izzet', colors: ['U','R'] }, { label: 'Golgari', colors: ['B','G'] },
  { label: 'Boros', colors: ['R','W'] }, { label: 'Simic', colors: ['G','U'] },
  { label: 'Bant', colors: ['G','W','U'] }, { label: 'Esper', colors: ['W','U','B'] },
  { label: 'Grixis', colors: ['U','B','R'] }, { label: 'Jund', colors: ['B','R','G'] },
  { label: 'Naya', colors: ['R','G','W'] }, { label: 'Abzan', colors: ['W','B','G'] },
  { label: 'Jeskai', colors: ['U','R','W'] }, { label: 'Sultai', colors: ['B','G','U'] },
  { label: 'Mardu', colors: ['R','W','B'] }, { label: 'Temur', colors: ['G','U','R'] },
  { label: 'Non-Green', colors: ['W','U','B','R'] }, { label: 'Non-White', colors: ['U','B','R','G'] },
  { label: 'Non-Blue', colors: ['W','B','R','G'] }, { label: 'Non-Black', colors: ['W','U','R','G'] },
  { label: 'Non-Red', colors: ['W','U','B','G'] }, { label: 'Five-Color', colors: ['W','U','B','R','G'] },
];

function serializeColors(colors) {
  if (colors === null || colors === undefined) return 'any';
  return [...colors].sort().join(',');
}

function deserializeColors(val) {
  if (val === 'any') return null;
  if (val === '') return [];
  return val.split(',');
}

const PARTNER_LABELS = {
  none: null,
  partner: 'Partner',
  partner_with: 'Partner With',
  friends_forever: 'Friends Forever',
  choose_a_background: 'Choose a Background',
  background: 'Background',
  doctor_companion: "Doctor's Companion",
  time_lord_doctor: 'Time Lord Doctor',
};

function ManaPips({ colors }) {
  if (!colors || colors.length === 0)
    return <i className={`ms ms-c ms-cost ${styles.pip}`} />;
  return (
    <span className={styles.pips}>
      {colors.map(c => <i key={c} className={`ms ms-${c.toLowerCase()} ms-cost ${styles.pip}`} />)}
    </span>
  );
}

// ── Scryfall autocomplete input ────────────────────────────────────────

function ScryfallInput({ onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleChange(val) {
    setQuery(val);
    setSelectedCard(null);
    onSelect(null);
    clearTimeout(timerRef.current);
    setSearching(false);
    if (val.length < 2) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      setOpen(true);
      const results = await scryfallSearch(val);
      setSuggestions(results);
      setSearching(false);
    }, 280);
  }

  function handlePick(card) {
    setOpen(false);
    setQuery(card.name);
    setSelectedCard(card);
    onSelect(card);
  }

  return (
    <div className={styles.autocompleteWrap} ref={wrapRef}>
      <div className={styles.autocompleteInput}>
        <input
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Type a commander name…"
          autoFocus
        />
        {searching && (
          <span className="spin" style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
        )}
      </div>
      {open && (
        <div className={styles.suggestions}>
          {searching ? (
            <div className={styles.suggestionMeta}>
              <span className="spin" style={{ width: 12, height: 12, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
              Searching…
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map(card => (
              <button key={card.scryfall_id || card.name} className={styles.suggestion} onMouseDown={() => handlePick(card)}>
                {card.image_uri && <img src={card.image_uri} alt="" className={styles.suggestionArt} loading="lazy" />}
                {card.name}
              </button>
            ))
          ) : (
            <div className={styles.suggestionMeta}>No results</div>
          )}
        </div>
      )}
      {selectedCard && (
        <div className={styles.cardPreview}>
          {selectedCard.image_uri && (
            <img src={selectedCard.image_uri} alt={selectedCard.name} className={styles.cardPreviewImg} />
          )}
          {PARTNER_LABELS[selectedCard.partner_type] && (
            <span className={styles.partnerBadge}>{PARTNER_LABELS[selectedCard.partner_type]}</span>
          )}
          {selectedCard.partner_with_name && (
            <span className={styles.partnerWith}>with {selectedCard.partner_with_name}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add commander modal ────────────────────────────────────────────────

function AddModal({ listId, onAdded, onClose }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleAdd() {
    if (!selectedCard) return;
    setSaving(true);
    setError(null);
    try {
      await api.createCommander(listId, selectedCard);
      onAdded();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ overflow: 'visible' }}>
        <div className="modal-header">
          <span className="modal-title">Add Commander</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ overflow: 'visible' }}>
          <ScryfallInput onSelect={setSelectedCard} />
          {error && <div className={styles.error}>{error}</div>}
        </div>
        <div className="modal-footer">
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleAdd} disabled={!selectedCard || saving}>
            {saving ? 'Adding…' : 'Add Commander'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bulk import modal ──────────────────────────────────────────────────

function ImportModal({ listId, onImported, onClose }) {
  const [step, setStep] = useState('input');
  const [text, setText] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [matched, setMatched] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [resolutions, setResolutions] = useState({}); // input → cardData | 'skip'
  const [resolving, setResolving] = useState({}); // input → bool (loading)
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  async function handlePreview() {
    const names = text.split('\n').map(n => n.trim()).filter(Boolean);
    if (!names.length) return;
    setPreviewing(true);
    setError(null);
    try {
      const result = await api.previewImport(listId, names);
      setMatched(result.matched);
      setUnmatched(result.unmatched);
      const init = {};
      result.unmatched.forEach(u => { init[u.input] = 'skip'; });
      setResolutions(init);
      setStep('review');
    } catch (e) { setError(e.message); }
    finally { setPreviewing(false); }
  }

  async function handlePickSuggestion(input, name) {
    setResolving(r => ({ ...r, [input]: true }));
    const card = await scryfallNamed(name);
    setResolutions(r => ({ ...r, [input]: card || { name, color_identity: [], partner_type: 'none', partner_with_name: null, scryfall_id: null } }));
    setResolving(r => ({ ...r, [input]: false }));
  }

  function handleSkip(input) {
    setResolutions(r => ({ ...r, [input]: 'skip' }));
  }

  async function handleImport() {
    const commanders = [
      ...matched,
      ...Object.entries(resolutions)
        .filter(([, v]) => v && v !== 'skip')
        .map(([, v]) => v),
    ];
    if (!commanders.length) return;
    setImporting(true);
    setError(null);
    try {
      await api.confirmImport(listId, commanders);
      onImported();
      onClose();
    } catch (e) { setError(e.message); }
    finally { setImporting(false); }
  }

  const importCount = matched.length + Object.values(resolutions).filter(v => v && v !== 'skip').length;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">{step === 'input' ? 'Bulk Import' : 'Review Import'}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {step === 'input' && (
          <>
            <div className="modal-body">
              <p className={styles.importHint}>Paste commander names, one per line. Scryfall will match them automatically.</p>
              <textarea
                className={styles.importTextarea}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={"Atraxa, Praetors' Voice\nThrasios, Triton Hero\nTymna the Weaver"}
                rows={10}
                autoFocus
              />
              {error && <div className={styles.error}>{error}</div>}
            </div>
            <div className="modal-footer">
              <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button className={styles.saveBtn} onClick={handlePreview} disabled={previewing || !text.trim()}>
                {previewing ? 'Looking up…' : 'Preview →'}
              </button>
            </div>
          </>
        )}

        {step === 'review' && (
          <>
            <div className={`modal-body ${styles.reviewBody}`}>
              {matched.length > 0 && (
                <div className={styles.reviewSection}>
                  <div className={styles.reviewSectionTitle}>
                    <span className={styles.matchedDot} /> Matched ({matched.length})
                  </div>
                  <div className={styles.matchedList}>
                    {matched.map(c => (
                      <div key={c.name} className={styles.matchedItem}>
                        {c.image_uri
                          ? <img src={c.image_uri} alt="" className={styles.matchedArt} loading="lazy" />
                          : <div className={styles.matchedArtPlaceholder} />
                        }
                        <span className={styles.matchedName}>{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unmatched.length > 0 && (
                <div className={styles.reviewSection}>
                  <div className={styles.reviewSectionTitle}>
                    <span className={styles.unmatchedDot} /> Needs review ({unmatched.length})
                  </div>
                  <div className={styles.unmatchedList}>
                    {unmatched.map(item => (
                      <div key={item.input} className={styles.unmatchedItem}>
                        <div className={styles.unmatchedInput}>{item.input}</div>
                        {resolutions[item.input] && resolutions[item.input] !== 'skip' && resolutions[item.input].image_uri && (
                          <img src={resolutions[item.input].image_uri} alt="" className={styles.resolvedArt} loading="lazy" />
                        )}
                        <div className={styles.unmatchedActions}>
                          {item.suggestions.length > 0 ? (
                            <div className={styles.suggestionBtns}>
                              {item.suggestions.map(s => (
                                <button
                                  key={s}
                                  className={`${styles.suggestionBtn} ${resolutions[item.input]?.name === s ? styles.suggestionBtnActive : ''}`}
                                  onClick={() => handlePickSuggestion(item.input, s)}
                                  disabled={resolving[item.input]}
                                >
                                  {s}
                                  {resolutions[item.input]?.name === s && <span className={styles.checkmark}> ✓</span>}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className={styles.noSuggestions}>No suggestions found</span>
                          )}
                          <button
                            className={`${styles.skipBtn} ${resolutions[item.input] === 'skip' ? styles.skipBtnActive : ''}`}
                            onClick={() => handleSkip(item.input)}
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className={styles.error}>{error}</div>}
            </div>
            <div className="modal-footer">
              <button className={styles.cancelBtn} onClick={() => setStep('input')}>← Back</button>
              <button className={styles.saveBtn} onClick={handleImport} disabled={importing || importCount === 0}>
                {importing ? 'Importing…' : `Import ${importCount} commander${importCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Art picker modal ──────────────────────────────────────────────────

const SCRYFALL_API = 'https://api.scryfall.com';

function ArtPickerModal({ commander, listId, onUpdated, onClose }) {
  const [prints, setPrints] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(null);
  const sentinelRef = useRef(null);

  async function fetchPrints(url) {
    setFetching(true);
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const items = data.data.map(card => ({
        scryfallId: card.id,
        imageUri: card.image_uris?.border_crop ?? card.card_faces?.[0]?.image_uris?.border_crop ?? null,
        setName: card.set_name,
        year: card.released_at?.slice(0, 4),
      })).filter(p => p.imageUri);
      setPrints(prev => [...prev, ...items]);
      setHasMore(data.has_more);
      setNextUrl(data.next_page ?? null);
    } catch {}
    setFetching(false);
  }

  useEffect(() => {
    const q = encodeURIComponent(`!"${commander.name}"`);
    fetchPrints(`${SCRYFALL_API}/cards/search?q=${q}&unique=prints&order=released`);
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !fetching && nextUrl) fetchPrints(nextUrl);
    }, { rootMargin: '200px' });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, fetching, nextUrl]);

  async function handleSelect(print) {
    setSaving(print.scryfallId);
    try {
      await api.updateCommander(listId, commander.id, {
        scryfall_id: print.scryfallId,
        image_uri: print.imageUri,
      });
      onUpdated(commander.id, { scryfall_id: print.scryfallId, image_uri: print.imageUri });
      onClose();
    } catch {}
    setSaving(null);
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-sheet"
        style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div className="modal-header">
          <span className="modal-title">Select Artwork — {commander.name}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.artScrollArea}>
          <div className={styles.artPrintGrid}>
            {prints.map(p => (
              <button
                key={p.scryfallId}
                className={`${styles.artPrint} ${commander.scryfall_id === p.scryfallId ? styles.artPrintSelected : ''}`}
                onClick={() => handleSelect(p)}
                disabled={!!saving}
              >
                {saving === p.scryfallId ? (
                  <div className={styles.artPrintSaving}>
                    <span className="spin" style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
                  </div>
                ) : (
                  <>
                    <img src={p.imageUri} alt={p.setName} className={styles.artPrintImg} loading="lazy" />
                    <div className={styles.artPrintLabel}>{p.setName} · {p.year}</div>
                  </>
                )}
              </button>
            ))}
          </div>
          {fetching && (
            <div className={styles.artFetching}>
              <span className="spin" style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
            </div>
          )}
          <div ref={sentinelRef} style={{ height: 1 }} />
        </div>
      </div>
    </div>
  );
}

// ── Export modal ──────────────────────────────────────────────────────

function ExportModal({ commanders, onClose }) {
  const text = commanders.map(c => c.name).join('\n');
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <span className="modal-title">Export List</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <textarea
            className={styles.importTextarea}
            value={text}
            readOnly
            rows={12}
            onFocus={e => e.target.select()}
          />
        </div>
        <div className="modal-footer">
          <button className={styles.cancelBtn} onClick={onClose}>Close</button>
          <button className={styles.saveBtn} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────

export default function ListDetail() {
  const { id } = useParams();
  const [listName, setListName] = useState('');
  const [commanders, setCommanders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'import' | 'export'
  const [deleteId, setDeleteId] = useState(null);
  const [artPicker, setArtPicker] = useState(null); // commander object
  const [search, setSearch] = useState('');
  const [defaultColors, setDefaultColors] = useState(null);

  async function load() {
    try {
      const [lists, cmds] = await Promise.all([api.getLists(), api.getCommanders(id)]);
      const list = lists.find(l => String(l.id) === String(id));
      if (list) {
        setListName(list.name);
        setDefaultColors(list.default_colors ?? null);
      }
      setCommanders(cmds);
    } catch {}
    setLoading(false);
  }

  async function handleDefaultColorsChange(val) {
    const colors = deserializeColors(val);
    setDefaultColors(colors);
    try { await api.setListDefaultColors(id, colors); } catch {}
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete(cid) {
    try { await api.deleteCommander(id, cid); setDeleteId(null); await load(); } catch {}
  }

  function handleArtUpdated(cid, data) {
    setCommanders(prev => prev.map(c => c.id === cid ? { ...c, ...data } : c));
  }

  const filtered = commanders.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link to="/lists" className={styles.back}>← Lists</Link>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>{listName || '…'}</h1>
          <p className={styles.sub}>{commanders.length} commander{commanders.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.importBtn} onClick={() => setModal('export')}>Export List</button>
          <button className={styles.importBtn} onClick={() => setModal('import')}>Bulk Import</button>
          <button className={styles.addBtn} onClick={() => setModal('add')}>+ Add Commander</button>
        </div>
      </div>

      <div className={styles.defaultFilterRow}>
        <span className={styles.defaultFilterLabel}>Default Filter</span>
        <select
          className={styles.defaultFilterSelect}
          value={serializeColors(defaultColors)}
          onChange={e => handleDefaultColorsChange(e.target.value)}
        >
          {FILTER_PRESETS.map(p => (
            <option key={p.label} value={serializeColors(p.colors)}>{p.label}</option>
          ))}
        </select>
      </div>

      <input
        type="search"
        placeholder="Search commanders…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={styles.search}
      />

      {loading ? (
        <div className={styles.loading}>
          <span className="spin" style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {commanders.length === 0
            ? 'No commanders yet. Add one or use Bulk Import.'
            : 'No commanders match your search.'}
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <div />
            <div>Name</div>
            <div>Colours</div>
            <div>Partner</div>
            <div />
          </div>
          {filtered.map(c => (
            <div key={c.id} className={styles.tableRow}>
              <div>
                <button className={styles.rowArt} onClick={() => setArtPicker(c)} title="Change artwork">
                  {c.image_uri
                    ? <img src={c.image_uri} alt="" className={styles.rowArtImg} loading="lazy" />
                    : <div className={styles.rowArtPlaceholder} />
                  }
                </button>
              </div>
              <div className={styles.rowName}>{c.name}</div>
              <div><ManaPips colors={c.color_identity} /></div>
              <div className={styles.rowPartner}>
                {PARTNER_LABELS[c.partner_type] || '—'}
                {c.partner_type === 'partner_with' && c.partner_with_name && (
                  <span className={styles.partnerWith}> ({c.partner_with_name})</span>
                )}
              </div>
              <div className={styles.rowActions}>
                <button className={styles.deleteRowBtn} onClick={() => setDeleteId(c.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'add' && <AddModal listId={id} onAdded={load} onClose={() => setModal(null)} />}
      {modal === 'import' && <ImportModal listId={id} onImported={load} onClose={() => setModal(null)} />}
      {modal === 'export' && <ExportModal commanders={commanders} onClose={() => setModal(null)} />}
      {artPicker && (
        <ArtPickerModal
          commander={artPicker}
          listId={id}
          onUpdated={handleArtUpdated}
          onClose={() => setArtPicker(null)}
        />
      )}

      {deleteId && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal-sheet" style={{ maxWidth: 340 }}>
            <div className="modal-header"><span className="modal-title">Remove Commander</span></div>
            <div className="modal-body">
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Remove this commander from the list?</p>
            </div>
            <div className="modal-footer">
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(deleteId)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
