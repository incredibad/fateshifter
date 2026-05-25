import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM settings');
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/', async (req, res) => {
  const { spin_duration } = req.body;
  try {
    if (spin_duration !== undefined) {
      const val = parseInt(spin_duration, 10);
      if (isNaN(val) || val < 1 || val > 30)
        return res.status(400).json({ error: 'spin_duration must be between 1 and 30' });
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        ['spin_duration', String(val)]
      );
    }
    const { rows } = await pool.query('SELECT key, value FROM settings');
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
