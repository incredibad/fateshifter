const SCRYFALL = 'https://api.scryfall.com';

export async function scryfallAutocomplete(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(`${SCRYFALL}/cards/autocomplete?q=${encodeURIComponent(query)}&include_extras=false`);
    if (!res.ok) return [];
    return (await res.json()).data?.slice(0, 8) || [];
  } catch { return []; }
}

export async function scryfallNamed(name) {
  try {
    const res = await fetch(`${SCRYFALL}/cards/named?exact=${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    return parseCard(await res.json());
  } catch { return null; }
}

function parseCard(card) {
  const keywords = card.keywords || [];
  const oracleText = card.oracle_text ||
    (card.card_faces || []).map(f => f.oracle_text || '').join('\n');
  const typeLine = card.type_line || '';

  let partner_type = 'none';
  let partner_with_name = null;

  if (keywords.some(k => /friends forever/i.test(k)) || /\bfriends forever\b/i.test(oracleText)) {
    partner_type = 'friends_forever';
  } else if (keywords.some(k => /partner with/i.test(k)) || /Partner with [A-Z]/m.test(oracleText)) {
    partner_type = 'partner_with';
    const m = oracleText.match(/Partner with ([^\n(,]+)/);
    partner_with_name = m ? m[1].trim() : null;
  } else if (keywords.some(k => /choose a background/i.test(k))) {
    partner_type = 'choose_a_background';
  } else if (/\bBackground\b/.test(typeLine) && /\bEnchantment\b/.test(typeLine)) {
    partner_type = 'background';
  } else if (keywords.some(k => /doctor'?s companion/i.test(k))) {
    partner_type = 'doctor_companion';
  } else if (/\bTime Lord\b/.test(typeLine) && /\bDoctor\b/.test(typeLine)) {
    partner_type = 'time_lord_doctor';
  } else if (keywords.some(k => /^partner$/i.test(k))) {
    partner_type = 'partner';
  }

  const image_uri = card.image_uris?.border_crop
    ?? card.card_faces?.[0]?.image_uris?.border_crop
    ?? null;

  return {
    name: card.name,
    scryfall_id: card.id,
    color_identity: card.color_identity || [],
    partner_type,
    partner_with_name,
    image_uri,
  };
}
