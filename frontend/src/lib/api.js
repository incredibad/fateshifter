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

  getCommanders: () => req('GET', '/commanders'),
  createCommander: (data) => req('POST', '/commanders', data),
  updateCommander: (id, data) => req('PUT', `/commanders/${id}`, data),
  deleteCommander: (id) => req('DELETE', `/commanders/${id}`),

  generate: (colors) => req('GET', `/generate?colors=${colors.join(',')}`),
};
