//
// PUBLIC_INTERFACE
// Centralized API helper for communicating with backend authentication and notes endpoints.
//
const BASE_URL = "/api";

/**
 * Low-level API fetch wrapper with error handling and Bearer token support.
 *
 * @param {string} path e.g. "/auth/login/"
 * @param {Object} opts fetch options ({ method, headers, body, token })
 * @returns {Promise<{data: any, status: number}>} resolves with {data, status}, or throws error
 */
// PUBLIC_INTERFACE
export async function apiFetch(path, opts = {}) {
  const { token, ...fetchOpts } = opts;
  const headers = {
    ...(fetchOpts.headers || {}),
    "Content-Type": fetchOpts.body ? "application/json" : undefined,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...fetchOpts,
      headers,
    });
  } catch (error) {
    throw new Error("Network error or server unreachable");
  }

  let data = null;
  let text = "";
  try {
    text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  } catch {
    data = null;
  }
  if (!res.ok) {
    let detail = (data && (data.detail || data.error)) || res.statusText;
    throw new Error(
      detail || `Request failed with status ${res.status}: ${text}`
    );
  }
  return { data, status: res.status };
}

// --- SPECIFIC ENDPOINT WRAPPERS ---

// PUBLIC_INTERFACE
export function loginApi(username, password) {
  return apiFetch("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// PUBLIC_INTERFACE
export function registerApi(username, password, email) {
  return apiFetch("/auth/register/", {
    method: "POST",
    body: JSON.stringify({ username, password, email }),
  });
}

// PUBLIC_INTERFACE
export function logoutApi(token) {
  // Logout endpoint requires POST with Authorization
  return apiFetch("/auth/logout/", {
    method: "POST",
    token,
  });
}

// PUBLIC_INTERFACE
export function listNotesApi(token, search = "") {
  // ?search= (optional)
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch(`/notes/${query}`, {
    method: "GET",
    token,
  });
}

// PUBLIC_INTERFACE
export function noteDetailApi(noteId, token) {
  return apiFetch(`/notes/${noteId}/`, {
    method: "GET",
    token,
  });
}

// PUBLIC_INTERFACE
export function createNoteApi({ title, content }, token) {
  return apiFetch("/notes/", {
    method: "POST",
    token,
    body: JSON.stringify({ title, content }),
  });
}

// PUBLIC_INTERFACE
export function updateNoteApi(noteId, { title, content }, token) {
  return apiFetch(`/notes/${noteId}/`, {
    method: "PUT",
    token,
    body: JSON.stringify({ title, content }),
  });
}

// PUBLIC_INTERFACE
export function deleteNoteApi(noteId, token) {
  return apiFetch(`/notes/${noteId}/`, {
    method: "DELETE",
    token,
  });
}
