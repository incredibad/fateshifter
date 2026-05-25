import { Router } from 'express';
import pool from '../db/index.js';
import { fuzzyCard, autocompleteNames } from '../lib/scryfall.js';

const router = Router();

// ── Lists ──────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT l.*, COUNT(c.id)::int AS commander_count
      FROM lists l
      LEFT JOIN commanders c ON c.list_id = l.id
      GROUP BY l.id
      ORDER BY l.name ASC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const { rows } = await pool.query('INSERT INTO lists (name) VALUES ($1) RETURNING *', [name.trim()]);
    res.status(201).json({ ...rows[0], commander_count: 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const { rows } = await pool.query(
      'UPDATE lists SET name=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [name.trim(), req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'List not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/default-colors', async (req, res) => {
  try {
    const { colors } = req.body; // null | string[]
    const { rows } = await pool.query(
      'UPDATE lists SET default_colors=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [colors ?? null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'List not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM lists WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'List not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Commanders within a list ───────────────────────────────────────────

router.get('/:id/commanders', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM commanders WHERE list_id=$1 ORDER BY name ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/commanders', async (req, res) => {
  try {
    const { name, color_identity, partner_type, partner_with_name, scryfall_id, image_uri } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const { rows } = await pool.query(
      `INSERT INTO commanders (name, color_identity, partner_type, partner_with_name, scryfall_id, image_uri, list_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name.trim(), color_identity || [], partner_type || 'none', partner_with_name || null, scryfall_id || null, image_uri || null, req.params.id]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/commanders/:cid', async (req, res) => {
  try {
    const { scryfall_id, image_uri } = req.body;
    const { rows } = await pool.query(
      `UPDATE commanders SET scryfall_id=$1, image_uri=$2, updated_at=NOW() WHERE id=$3 AND list_id=$4 RETURNING *`,
      [scryfall_id || null, image_uri || null, req.params.cid, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Commander not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/commanders/:cid', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM commanders WHERE id=$1 AND list_id=$2', [req.params.cid, req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Commander not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Bulk import ────────────────────────────────────────────────────────

// Preview: fuzzy-match names against Scryfall, return matched + unmatched with suggestions
router.post('/:id/import/preview', async (req, res) => {
  try {
    const { names } = req.body;
    if (!Array.isArray(names) || !names.length) return res.status(400).json({ error: 'names array required' });

    const results = await Promise.all(
      names.filter(n => n.trim()).map(async (input) => {
        const card = await fuzzyCard(input.trim());
        if (card) return { type: 'matched', input, card };
        const suggestions = await autocompleteNames(input.trim());
        return { type: 'unmatched', input, suggestions: suggestions.slice(0, 6) };
      })
    );

    res.json({
      matched: results.filter(r => r.type === 'matched').map(r => r.card),
      unmatched: results.filter(r => r.type === 'unmatched').map(r => ({ input: r.input, suggestions: r.suggestions })),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Confirm: add a pre-resolved list of commanders (already have full card data)
router.post('/:id/import', async (req, res) => {
  try {
    const { commanders } = req.body;
    if (!Array.isArray(commanders) || !commanders.length) return res.status(400).json({ error: 'commanders array required' });

    let added = 0;
    for (const c of commanders) {
      if (!c.name?.trim()) continue;
      await pool.query(
        `INSERT INTO commanders (name, color_identity, partner_type, partner_with_name, scryfall_id, image_uri, list_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [c.name.trim(), c.color_identity || [], c.partner_type || 'none', c.partner_with_name || null, c.scryfall_id || null, c.image_uri || null, req.params.id]
      );
      added++;
    }

    res.json({ added });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
