import { Router } from 'express';
import pool from '../db/index.js';

const router = Router();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

router.get('/', async (req, res) => {
  try {
    const colorsParam = req.query.colors || '';
    const selectedColors = colorsParam
      ? colorsParam.split(',').filter(c => ['W', 'U', 'B', 'R', 'G'].includes(c))
      : [];

    // Filter commanders whose color identity is a subset of selected colors.
    // color_identity <@ selectedColors means "color_identity is contained by selectedColors".
    // An empty color_identity (colorless) is always contained, so colorless commanders always match.
    const { rows: eligible } = await pool.query(
      `SELECT * FROM commanders WHERE color_identity <@ $1::TEXT[]`,
      [selectedColors]
    );

    if (!eligible.length) {
      return res.json({ single: null, partners: null });
    }

    const single = pick(eligible);

    // Build valid partner pairs from the eligible list
    const validPairs = [];

    const genericPartners = eligible.filter(c => c.partner_type === 'partner');
    for (let i = 0; i < genericPartners.length; i++) {
      for (let j = i + 1; j < genericPartners.length; j++) {
        validPairs.push([genericPartners[i], genericPartners[j]]);
      }
    }

    const friendsForever = eligible.filter(c => c.partner_type === 'friends_forever');
    for (let i = 0; i < friendsForever.length; i++) {
      for (let j = i + 1; j < friendsForever.length; j++) {
        validPairs.push([friendsForever[i], friendsForever[j]]);
      }
    }

    // Partner With: find pairs where A.partner_with_name matches B.name (both in eligible list)
    const partnerWithList = eligible.filter(c => c.partner_type === 'partner_with' && c.partner_with_name);
    for (const commander of partnerWithList) {
      const partner = eligible.find(
        c => c.partner_type === 'partner_with' && c.name.toLowerCase() === commander.partner_with_name.toLowerCase() && c.id !== commander.id
      );
      // Use id ordering to avoid duplicate pairs
      if (partner && partner.id > commander.id) {
        validPairs.push([commander, partner]);
      }
    }

    const partners = validPairs.length ? (() => {
      const [a, b] = pick(validPairs);
      return { a, b };
    })() : null;

    res.json({ single, partners });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
