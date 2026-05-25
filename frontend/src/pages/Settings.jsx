import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/authContext.jsx';
import styles from './Settings.module.css';

const COLORS = ['W', 'U', 'B', 'R', 'G'];
const PARTNER_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'partner', label: 'Partner' },
  { value: 'partner_with', label: 'Partner With' },
  { value: 'friends_forever', label: 'Friends Forever' },
];

const EMPTY_FORM = { name: '', color_identity: [], partner_type: 'none', partner_with_name: '' };

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

function CommanderModal({ commander, onSave, onClose }) {
  const [form, setForm] = useState(commander ? {
    name: commander.name,
    color_identity: commander.color_identity,
    partner_type: commander.partner_type,
    partner_with_name: commander.partner_with_name || '',
  } : EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function toggleColor(c) {
    setForm(f => ({
      ...f,
      color_identity: f.color_identity.includes(c)
        ? f.color_identity.filter(x => x !== c)
        : [...f.color_identity, c],
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError('Name is required');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-title">{commander ? 'Edit Commander' : 'Add Commander'}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Atraxa, Praetors' Voice"
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Colour Identity</label>
              <div className={styles.colorToggleRow}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.colorToggle} ${form.color_identity.includes(c) ? styles.colorToggleOn : ''}`}
                    onClick={() => toggleColor(c)}
                  >
                    <span className={`mana-pip mana-${c}`}>{c}</span>
                  </button>
                ))}
                <span className={styles.colorHint}>
                  {form.color_identity.length === 0 ? 'Colorless' : form.color_identity.join('')}
                </span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Partner Type</label>
              <div className={styles.radioGroup}>
                {PARTNER_TYPES.map(pt => (
                  <label key={pt.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="partner_type"
                      value={pt.value}
                      checked={form.partner_type === pt.value}
                      onChange={() => setForm(f => ({ ...f, partner_type: pt.value, partner_with_name: '' }))}
                      className={styles.radioInput}
                    />
                    {pt.label}
                  </label>
                ))}
              </div>
            </div>

            {form.partner_type === 'partner_with' && (
              <div className={styles.field}>
                <label className={styles.label}>Partner's Name</label>
                <input
                  type="text"
                  value={form.partner_with_name}
                  onChange={e => setForm(f => ({ ...f, partner_with_name: e.target.value }))}
                  placeholder="Exact name of their partner commander"
                />
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    if (form.newPassword !== form.confirm) return setError('Passwords do not match');
    if (form.newPassword.length < 8) return setError('New password must be at least 8 characters');
    setSaving(true);
    try {
      await api.changePassword(form.currentPassword, form.newPassword);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-header">
          <span className="modal-title">Change Password</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        {success ? (
          <div className="modal-body">
            <div className={styles.successMsg}>Password changed successfully.</div>
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button className={styles.saveBtn} onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="modal-body">
              <div className={styles.field}>
                <label className={styles.label}>Current Password</label>
                <input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} autoFocus />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>New Password</label>
                <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="At least 8 characters" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirm New Password</label>
                <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>
              {error && <div className={styles.error}>{error}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? 'Saving…' : 'Change Password'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const { auth } = useAuth();
  const [commanders, setCommanders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | { commander }
  const [pwModal, setPwModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  async function load() {
    try {
      const data = await api.getCommanders();
      setCommanders(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave(form) {
    if (modal === 'add') {
      await api.createCommander(form);
    } else {
      await api.updateCommander(modal.id, form);
    }
    await load();
  }

  async function handleDelete(id) {
    try {
      await api.deleteCommander(id);
      setDeleteId(null);
      await load();
    } catch {}
  }

  const PARTNER_LABELS = { none: '—', partner: 'Partner', partner_with: 'Partner With', friends_forever: 'Friends Forever' };

  const filtered = commanders.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Settings</h1>
          <p className={styles.sub}>Manage your commander pool and account settings.</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionTitle}>My Commanders</div>
            <div className={styles.sectionCount}>{commanders.length} commander{commanders.length !== 1 ? 's' : ''}</div>
          </div>
          <button className={styles.addBtn} onClick={() => setModal('add')}>+ Add Commander</button>
        </div>

        <input
          type="search"
          className={styles.search}
          placeholder="Search commanders…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <div className={styles.loadingRow}>
            <span className="spin" style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            {commanders.length === 0
              ? 'No commanders yet. Add your first one to get started.'
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
                    <span className={styles.partnerWithName}> ({c.partner_with_name})</span>
                  )}
                </div>
                <div className={styles.rowActions}>
                  <button className={styles.editBtn} onClick={() => setModal(c)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => setDeleteId(c.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Account</div>
        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Signed in as <strong>{auth?.username}</strong></span>
          <button className={styles.changePassBtn} onClick={() => setPwModal(true)}>Change Password</button>
        </div>
      </section>

      {(modal === 'add' || (modal && modal.id)) && (
        <CommanderModal
          commander={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {pwModal && <ChangePasswordModal onClose={() => setPwModal(false)} />}

      {deleteId && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal-sheet" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <span className="modal-title">Delete Commander</span>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>
                Are you sure? This cannot be undone.
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
