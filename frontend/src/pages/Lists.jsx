import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import styles from './Lists.module.css';

export default function Lists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [memoryModal, setMemoryModal] = useState(null); // list object
  const [memoryLimit, setMemoryLimit] = useState(0);
  const [memorySaving, setMemorySaving] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try { setLists(await api.getLists()); } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.createList(newName.trim());
      setNewName('');
      await load();
    } catch (e) { setError(e.message); }
    finally { setCreating(false); }
  }

  async function handleRename(id) {
    if (!editName.trim()) return;
    try {
      await api.updateList(id, editName.trim());
      setEditId(null);
      await load();
    } catch (e) { setError(e.message); }
  }

  async function handleDelete(id) {
    try {
      await api.deleteList(id);
      setDeleteId(null);
      await load();
    } catch (e) { setError(e.message); }
  }

  function openMemoryModal(list) {
    setMemoryModal(list);
    setMemoryLimit(list.remember_limit ?? 0);
  }

  async function saveMemoryLimit() {
    if (!memoryModal) return;
    setMemorySaving(true);
    try {
      await api.setListRememberLimit(memoryModal.id, memoryLimit);
      setMemoryModal(null);
      await load();
    } catch (e) { setError(e.message); }
    finally { setMemorySaving(false); }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Lists</h1>
        <p className={styles.sub}>Manage your commander pools. Load any list into the generator.</p>
      </div>

      <form className={styles.createRow} onSubmit={handleCreate}>
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New list name…"
        />
        <button type="submit" className={styles.createBtn} disabled={creating || !newName.trim()}>
          {creating ? 'Creating…' : '+ Create List'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>
          <span className="spin" style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
        </div>
      ) : lists.length === 0 ? (
        <div className={styles.empty}>No lists yet. Create one above to get started.</div>
      ) : (
        <div className={styles.grid}>
          {lists.map(list => (
            <div key={list.id} className={styles.card}>
              {editId === list.id ? (
                <div className={styles.editRow}>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename(list.id);
                      if (e.key === 'Escape') setEditId(null);
                    }}
                    autoFocus
                  />
                  <button className={styles.saveBtn} onClick={() => handleRename(list.id)}>Save</button>
                  <button className={styles.cancelBtn} onClick={() => setEditId(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className={styles.cardInfo}>
                    <span className={styles.cardName}>{list.name}</span>
                    <span className={styles.cardCount}>
                      {list.commander_count} commander{list.commander_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className={styles.cardActions}>
                    <Link to={`/lists/${list.id}`} className={styles.viewBtn}>View →</Link>
                    <button className={styles.renameBtn} onClick={() => { setEditId(list.id); setEditName(list.name); }}>
                      Rename
                    </button>
                    <button
                      className={`${styles.memoryBtn} ${list.remember_limit > 0 ? styles.memoryBtnActive : ''}`}
                      onClick={() => openMemoryModal(list)}
                      title="Roll memory"
                    >
                      {list.remember_limit > 0 ? `↺ ${list.remember_limit}` : '↺'}
                    </button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteId(list.id)}>✕</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {memoryModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setMemoryModal(null)}>
          <div className="modal-sheet" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">Roll Memory — {memoryModal.name}</span>
              <button className={styles.closeBtn} onClick={() => setMemoryModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className={styles.memoryDesc}>
                Fateshifter will avoid re-rolling commanders seen in the last <strong>{memoryLimit}</strong> roll{memoryLimit !== 1 ? 's' : ''}.
                {memoryLimit === 0 ? ' Set above 0 to enable.' : ''}
              </p>
              <div className={styles.memorySliderRow}>
                <span className={styles.memorySliderLabel}>0</span>
                <input
                  type="range"
                  min={0}
                  max={memoryModal.commander_count || 1}
                  value={memoryLimit}
                  onChange={e => setMemoryLimit(Number(e.target.value))}
                  className={styles.memorySlider}
                />
                <span className={styles.memorySliderLabel}>{memoryModal.commander_count}</span>
              </div>
              <div className={`${styles.memoryValue} ${memoryLimit === 0 ? styles.memoryValueOff : ''}`}>
                {memoryLimit === 0 ? 'Off' : memoryLimit}
              </div>
            </div>
            <div className="modal-footer">
              <button className={styles.cancelBtn} onClick={() => setMemoryModal(null)}>Cancel</button>
              <button className={styles.saveBtn} onClick={saveMemoryLimit} disabled={memorySaving}>
                {memorySaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal-sheet" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <span className="modal-title">Delete List</span>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>
                This will permanently delete the list and all its commanders.
              </p>
            </div>
            <div className="modal-footer">
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
