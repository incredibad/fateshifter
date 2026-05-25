import { useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/authContext.jsx';
import styles from './Settings.module.css';

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
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
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
  const [pwModal, setPwModal] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Settings</h1>
        <p className={styles.sub}>Account settings.</p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Account</div>
        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Signed in as <strong>{auth?.username}</strong></span>
          <button className={styles.changePassBtn} onClick={() => setPwModal(true)}>Change Password</button>
        </div>
      </section>

      {pwModal && <ChangePasswordModal onClose={() => setPwModal(false)} />}
    </div>
  );
}
