import { useState, useEffect } from 'react';
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
  const [spinDuration, setSpinDuration] = useState(5);
  const [spinSaving, setSpinSaving] = useState(false);
  const [spinSaved, setSpinSaved] = useState(false);
  const [spinError, setSpinError] = useState(null);

  useEffect(() => {
    api.getSettings().then(s => {
      if (s.spin_duration) setSpinDuration(parseInt(s.spin_duration, 10));
    }).catch(() => {});
  }, []);

  async function saveSpinDuration() {
    setSpinSaving(true);
    setSpinError(null);
    setSpinSaved(false);
    try {
      await api.updateSettings({ spin_duration: spinDuration });
      setSpinSaved(true);
      setTimeout(() => setSpinSaved(false), 2000);
    } catch (e) {
      setSpinError(e.message);
    } finally {
      setSpinSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Settings</h1>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Generator</div>
        <div className={styles.spinRow}>
          <div className={styles.spinLabel}>
            <div className={styles.spinLabelTitle}>Spin Duration</div>
            <div className={styles.spinLabelDesc}>How long the slot machine spins before revealing the result.</div>
          </div>
          <div className={styles.spinControl}>
            <input
              type="range"
              min={1}
              max={15}
              value={spinDuration}
              onChange={e => { setSpinDuration(Number(e.target.value)); setSpinSaved(false); }}
              className={styles.spinSlider}
            />
            <span className={styles.spinValue}>{spinDuration}s</span>
            <button
              className={styles.saveBtn}
              onClick={saveSpinDuration}
              disabled={spinSaving}
            >
              {spinSaving ? 'Saving…' : spinSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
        {spinError && <div className={styles.error}>{spinError}</div>}
      </section>

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
