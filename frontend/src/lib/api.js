const BASE = '/api';

async function req(method, path, body) {
  const opts = { method, credentials: 'include', headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getAuthStatus: () => req('GET', '/auth/status'),
  login: (username, password) => req('POST', '/auth/login', { username, password }),
  setup: (username, password) => req('POST', '/auth/setup', { username, password }),
  logout: () => req('POST', '/auth/logout'),
  changePassword: (currentPassword, newPassword) => req('POST', '/auth/change-password', { currentPassword, newPassword }),

  // Lists
  getLists: () => req('GET', '/lists'),
  createList: (name) => req('POST', '/lists', { name }),
  updateList: (id, name) => req('PUT', `/lists/${id}`, { name }),
  deleteList: (id) => req('DELETE', `/lists/${id}`),

  // Commanders within a list
  getCommanders: (listId) => req('GET', `/lists/${listId}/commanders`),
  createCommander: (listId, data) => req('POST', `/lists/${listId}/commanders`, data),
  deleteCommander: (listId, id) => req('DELETE', `/lists/${listId}/commanders/${id}`),
  updateCommander: (listId, id, data) => req('PUT', `/lists/${listId}/commanders/${id}`, data),

  // Bulk import
  previewImport: (listId, names) => req('POST', `/lists/${listId}/import/preview`, { names }),
  confirmImport: (listId, commanders) => req('POST', `/lists/${listId}/import`, { commanders }),

  // Settings
  getSettings: () => req('GET', '/settings'),
  updateSettings: (data) => req('PUT', '/settings', data),

  // Generate
  generateCandidates: (listId, colors) => {
    const c = colors === null ? 'any' : colors.join(',');
    return req('GET', `/generate/candidates?listId=${listId}&colors=${c}`);
  },

  generate: (listId, colors, exclude) => {
    const c = colors === null ? 'any' : colors.join(',');
    let url = `/generate?listId=${listId}&colors=${c}`;
    if (exclude?.type === 'single') url += `&excludeType=single&excludeIds=${exclude.id}`;
    if (exclude?.type === 'pair') url += `&excludeType=pair&excludeIds=${exclude.ids.join(',')}`;
    return req('GET', url);
  },
};
