import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { scryfallAutocomplete, scryfallNamed } from '../lib/scryfall.js';
import styles from './ListDetail.module.css';

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
  if (!colors || colors.length === 0) return <span className={`mana-pip mana-C ${styles.pip}`}>C</span>;
  return (
    <span className={styles.pips}>
      {colors.map(c => <span key={c} className={`mana-pip mana-${c} ${styles.pip}`}>{c}</span>)}
    </span>
  );
}

// ── Scryfall autocomplete input ────────────────────────────────────────

function ScryfallInput({ onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
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
    if (val.length < 2) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      const results = await scryfallAutocomplete(val);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 280);
  }

  async function handlePick(name) {
    setOpen(false);
    setQuery(name);
    setFetching(true);
    const card = await scryfallNamed(name);
    setFetching(false);
    if (card) { setSelectedCard(card); onSelect(card); }
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
        {fetching && (
          <span className="spin" style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
        )}
      </div>
      {open && (
        <div className={styles.suggestions}>
          {suggestions.map(s => (
            <button key={s} className={styles.suggestion} onMouseDown={() => handlePick(s)}>{s}</button>
          ))}
        </div>
      )}
      {selectedCard && (
        <div className={styles.cardPreview}>
          <ManaPips colors={selectedCard.color_identity} />
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
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-title">Add Commander</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
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
                        <span className={styles.matchedName}>{c.name}</span>
                        <ManaPips colors={c.color_identity} />
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

// ── Main page ──────────────────────────────────────────────────────────

export default function ListDetail() {
  const { id } = useParams();
  const [listName, setListName] = useState('');
  const [commanders, setCommanders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'import'
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  async function load() {
    try {
      const [lists, cmds] = await Promise.all([api.getLists(), api.getCommanders(id)]);
      const list = lists.find(l => String(l.id) === String(id));
      if (list) setListName(list.name);
      setCommanders(cmds);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete(cid) {
    try { await api.deleteCommander(id, cid); setDeleteId(null); await load(); } catch {}
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
          <button className={styles.importBtn} onClick={() => setModal('import')}>Bulk Import</button>
          <button className={styles.addBtn} onClick={() => setModal('add')}>+ Add Commander</button>
        </div>
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
            <div>Name</div>
            <div>Colours</div>
            <div>Partner</div>
            <div />
          </div>
          {filtered.map(c => (
            <div key={c.id} className={styles.tableRow}>
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
