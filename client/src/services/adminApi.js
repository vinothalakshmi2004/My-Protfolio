/**
 * Admin API calls (all JWT-protected via adminClient).
 */
import { adminClient, unwrap } from '../lib/apiClient';

/** Auth endpoints. Every call that changes credentials returns a NEW token. */
export const authApi = {
  /** POST /api/auth/login -> { token, admin } (401 here is "wrong password", not "session expired") */
  login: (email, password) => adminClient.post('/auth/login', { email, password }, { skipAuthRedirect: true }).then(unwrap),
  /** GET /api/auth/me -> current admin */
  me: () => adminClient.get('/auth/me').then(unwrap),
  /** POST /api/auth/change-password -> { token, admin } */
  changePassword: (currentPassword, newPassword) =>
    adminClient.post('/auth/change-password', { currentPassword, newPassword }).then(unwrap),
  /** POST /api/auth/change-email -> { token, admin } */
  changeEmail: (newEmail, currentPassword) =>
    adminClient.post('/auth/change-email', { newEmail, currentPassword }).then(unwrap),
};

/** Site settings singleton. */
export const settingsApi = {
  /** GET /api/admin/settings — full document incl. private phone + hidden social links */
  get: () => adminClient.get('/admin/settings').then(unwrap),
  /** PUT /api/settings — partial update: only send the fields that changed */
  update: (partial) => adminClient.put('/settings', partial).then(unwrap),
};

/** GET /api/admin/stats — overview numbers + 5 recent messages */
export const statsApi = { get: () => adminClient.get('/admin/stats').then(unwrap) };

/** Contact-form inbox. */
export const messagesApi = {
  list: (status) => adminClient.get('/messages', { params: status ? { status } : {} }).then((res) => res.data),
  unreadCount: () => adminClient.get('/messages/unread-count').then((res) => unwrap(res).unread),
  setRead: (id, isRead = true) => adminClient.patch(`/messages/${id}/read`, { isRead }).then(unwrap),
  remove: (id) => adminClient.delete(`/messages/${id}`).then(unwrap),
};

/** GridFS uploads. */
export const uploadApi = {
  /**
   * POST /api/upload (multipart). Images are converted to WebP server-side.
   * @param {File} file
   * @param {{ type?: 'image'|'pdf', onProgress?: (percent:number)=>void, signal?: AbortSignal }} options
   * @returns {Promise<{ fileId, url, filename, contentType, size }>}
   */
  upload: (file, { type, onProgress, signal } = {}) => {
    const form = new FormData();
    form.append('file', file);
    return adminClient
      .post('/upload', form, {
        params: type ? { type } : {},
        timeout: 120000,
        signal,
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
        },
      })
      .then(unwrap);
  },
  /** DELETE /api/upload/:id */
  remove: (fileId) => adminClient.delete(`/upload/${fileId}`).then(unwrap),
};

/**
 * Generic CRUD client for an orderable resource ("projects", "experience", ...).
 *  list()                    GET    /api/admin/<path>   (includes hidden items)
 *  create(data)              POST   /api/<path>
 *  update(id, data)          PUT    /api/<path>/:id
 *  remove(id)                DELETE /api/<path>/:id     (server deletes the item's files too)
 *  reorder([{id, order}])    PATCH  /api/<path>/reorder
 *  setVisible(id, visible)   PATCH  /api/<path>/:id/toggle-visibility
 */
export const createResourceApi = (path) => ({
  list: () => adminClient.get(`/admin/${path}`).then(unwrap),
  create: (data) => adminClient.post(`/${path}`, data).then(unwrap),
  update: (id, data) => adminClient.put(`/${path}/${id}`, data).then(unwrap),
  remove: (id) => adminClient.delete(`/${path}/${id}`).then(unwrap),
  reorder: (items) => adminClient.patch(`/${path}/reorder`, items).then(unwrap),
  setVisible: (id, visible) => adminClient.patch(`/${path}/${id}/toggle-visibility`, { visible }).then(unwrap),
});

export const resourceApi = {
  projects: createResourceApi('projects'),
  experience: createResourceApi('experience'),
  skills: createResourceApi('skills'),
  education: createResourceApi('education'),
  certifications: createResourceApi('certifications'),
  achievements: createResourceApi('achievements'),
};
