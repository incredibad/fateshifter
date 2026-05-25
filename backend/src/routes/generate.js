import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setsEqual(a, b) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every(x => s.has(x));
}

function setUnion(a, b) {
  return [...new Set([...a, ...b])];
}

router.get('/', async (req, res) => {
  try {
    const { listId, colors: colorsParam } = req.query;
    if (!listId) return res.status(400).json({ error: 'listId is required' });

    const selectedColors = colorsParam
      ? colorsParam.split(',').filter(c => ['W', 'U', 'B', 'R', 'G'].includes(c))
      : [];

    const { rows: eligible } = await pool.query(
      `SELECT * FROM commanders WHERE list_id = $1 AND color_identity <@ $2::TEXT[]`,
      [listId, selectedColors]
    );

    if (!eligible.length) return res.json({ result: null });

    // Singles must exactly match the selected colours
    const validSingles = eligible.filter(c => setsEqual(c.color_identity, selectedColors));

    // Build all mechanically-legal partner pairs
    const allPairs = [];

    const genericPartners = eligible.filter(c => c.partner_type === 'partner');
    for (let i = 0; i < genericPartners.length; i++)
      for (let j = i + 1; j < genericPartners.length; j++)
        allPairs.push([genericPartners[i], genericPartners[j]]);

    const friendsForever = eligible.filter(c => c.partner_type === 'friends_forever');
    for (let i = 0; i < friendsForever.length; i++)
      for (let j = i + 1; j < friendsForever.length; j++)
        allPairs.push([friendsForever[i], friendsForever[j]]);

    const partnerWithList = eligible.filter(c => c.partner_type === 'partner_with' && c.partner_with_name);
    for (const cmd of partnerWithList) {
      const partner = eligible.find(
        c => c.partner_type === 'partner_with' &&
          c.name.toLowerCase() === cmd.partner_with_name.toLowerCase() &&
          c.id !== cmd.id
      );
      if (partner && partner.id > cmd.id) allPairs.push([cmd, partner]);
    }

    const chooseBackgroundCmds = eligible.filter(c => c.partner_type === 'choose_a_background');
    const backgroundCards = eligible.filter(c => c.partner_type === 'background');
    for (const cmd of chooseBackgroundCmds)
      for (const bg of backgroundCards)
        allPairs.push([cmd, bg]);

    const doctorCompanions = eligible.filter(c => c.partner_type === 'doctor_companion');
    const timeLordDoctors = eligible.filter(c => c.partner_type === 'time_lord_doctor');
    for (const comp of doctorCompanions)
      for (const doc of timeLordDoctors)
        allPairs.push([comp, doc]);

    // Pairs must union to exactly the selected colours
    const validPairs = allPairs.filter(([a, b]) =>
      setsEqual(setUnion(a.color_identity, b.color_identity), selectedColors)
    );

    if (!validSingles.length && !validPairs.length) return res.json({ result: null });

    const candidates = [
      ...validSingles.map(c => ({ type: 'single', commander: c })),
      ...validPairs.map(([a, b]) => ({ type: 'pair', a, b })),
    ];

    const { excludeType, excludeIds: excludeIdsParam } = req.query;
    const excludeIds = excludeIdsParam ? excludeIdsParam.split(',') : [];
    let pickFrom = candidates;
    if (candidates.length > 1 && excludeType) {
      const filtered = candidates.filter(c => {
        if (c.type === 'single' && excludeType === 'single')
          return String(c.commander.id) !== excludeIds[0];
        if (c.type === 'pair' && excludeType === 'pair' && excludeIds.length === 2) {
          const cIds = [String(c.a.id), String(c.b.id)].sort().join(',');
          const eIds = [...excludeIds].sort().join(',');
          return cIds !== eIds;
        }
        return true;
      });
      if (filtered.length) pickFrom = filtered;
    }

    res.json({ result: pick(pickFrom) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
