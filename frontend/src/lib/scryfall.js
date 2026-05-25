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

  let partner_type = 'none';
  let partner_with_name = null;

  if (keywords.some(k => /friends forever/i.test(k))) {
    partner_type = 'friends_forever';
  } else if (keywords.some(k => /partner with/i.test(k)) || /Partner with [A-Z]/m.test(oracleText)) {
    partner_type = 'partner_with';
    const m = oracleText.match(/Partner with ([^\n(,]+)/);
    partner_with_name = m ? m[1].trim() : null;
  } else if (keywords.some(k => /^partner$/i.test(k))) {
    partner_type = 'partner';
  }

  return {
    name: card.name,
    scryfall_id: card.id,
    color_identity: card.color_identity || [],
    partner_type,
    partner_with_name,
  };
}
