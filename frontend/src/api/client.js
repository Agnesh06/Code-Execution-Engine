const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || 'An error occurred';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.code = data?.error?.code || 'ERROR';
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  register: (name, email, password) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  }),
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getMe: () => request('/auth/me'),

  // Teams
  createTeam: (name) => request('/teams', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  joinTeam: (teamCode) => request('/teams/join', {
    method: 'POST',
    body: JSON.stringify({ teamCode })
  }),
  getMyTeam: () => request('/teams/me'),

  // Events & Rounds
  getCurrentEvent: () => request('/events/current'),
  getCurrentRound: () => request('/rounds/current'),

  // Questions & Submissions
  getCurrentQuestion: () => request('/questions/current'),
  submitAnswer: (questionId, answer) => request('/submissions', {
    method: 'POST',
    body: JSON.stringify({ questionId, answer })
  }),
  getMySubmissions: () => request('/submissions/me/submissions'),

  // Leaderboard
  getLeaderboard: () => request('/leaderboard'),

  // Admin
  admin: {
    // Event control
    createEvent: (name) => request('/admin/events', {
      method: 'POST',
      body: JSON.stringify({ name })
    }),
    startEvent: (id) => request(`/admin/events/${id}/start`, { method: 'POST' }),
    endEvent: (id) => request(`/admin/events/${id}/end`, { method: 'POST' }),

    // Round control
    getRounds: () => request('/admin/rounds'),
    createRound: (eventId, name, order) => request('/admin/rounds', {
      method: 'POST',
      body: JSON.stringify({ eventId, name, order })
    }),
    openRound: (id) => request(`/admin/rounds/${id}/open`, { method: 'POST' }),
    closeRound: (id) => request(`/admin/rounds/${id}/close`, { method: 'POST' }),

    // Question CRUD
    getQuestions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/questions${qs ? `?${qs}` : ''}`);
    },
    createQuestion: (data) => request('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    updateQuestion: (id, data) => request(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    deleteQuestion: (id) => request(`/admin/questions/${id}`, { method: 'DELETE' }),

    // Teams & Manual Unlock
    getTeams: () => request('/admin/teams'),
    getTeam: (id) => request(`/admin/teams/${id}`),
    removeTeamMember: (teamId, userId) => request(`/admin/teams/${teamId}/members/${userId}`, { method: 'DELETE' }),
    manualUnlockQuestion: (teamId, questionId) => request(`/admin/teams/${teamId}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ questionId })
    }),
    getTeamProgress: (teamId) => request(`/admin/teams/${teamId}/progress`),

    // Submissions
    getSubmissions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/submissions${qs ? `?${qs}` : ''}`);
    }
  }
};
