import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();
const VALID_COLORS = new Set(['W', 'U', 'B', 'R', 'G']);
const VALID_PARTNER_TYPES = new Set(['none', 'partner', 'partner_with', 'friends_forever']);

function validateCommander(body) {
  const { name, color_identity, partner_type, partner_with_name } = body;
  if (!name?.trim()) return 'Name is required';
  if (!Array.isArray(color_identity)) return 'color_identity must be an array';
  if (color_identity.some(c => !VALID_COLORS.has(c))) return 'Invalid colour in color_identity';
  if (!VALID_PARTNER_TYPES.has(partner_type)) return 'Invalid partner_type';
  if (partner_type === 'partner_with' && !partner_with_name?.trim()) return 'partner_with_name is required for partner_with type';
  return null;
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM commanders ORDER BY name ASC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  const err = validateCommander(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const { name, color_identity, partner_type, partner_with_name } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO commanders (name, color_identity, partner_type, partner_with_name)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), color_identity, partner_type, partner_type === 'partner_with' ? partner_with_name.trim() : null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  const err = validateCommander(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const { name, color_identity, partner_type, partner_with_name } = req.body;
    const { rows } = await pool.query(
      `UPDATE commanders SET name=$1, color_identity=$2, partner_type=$3, partner_with_name=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name.trim(), color_identity, partner_type, partner_type === 'partner_with' ? partner_with_name.trim() : null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Commander not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM commanders WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Commander not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
