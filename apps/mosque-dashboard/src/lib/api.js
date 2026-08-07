const API_BASE = "/api";

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = { ...options.headers };
  if (!isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  } else {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    let errMsg = err.error || err.message || `Request failed: ${res.status}`;
    
    // If backend returns Zod validation details
    if (err.details && Array.isArray(err.details)) {
      const detailsMap = err.details.map(d => `• ${d.message}`).join("\n");
      errMsg = `${errMsg}\n${detailsMap}`;
    }
    
    throw new Error(errMsg);
  }
  
  return res.json();
}

export const transactionApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/transactions?${params.toString()}`);
  },
  getById: (id) => request(`/transactions/${id}`),
  create: (data) => request("/transactions", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/transactions/${id}`, { method: "DELETE" }),
  getSummary: () => request("/transactions/summary"),
};

export const programApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/programs?${params.toString()}`);
  },
  getById: (id) => request(`/programs/${id}`),
  create: (data) => request("/programs", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/programs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStatus: (id, status) => request(`/programs/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  completeProgram: (id, formData) => request(`/programs/${id}/complete`, {
    method: "PATCH",
    // We don't JSON stringify formData, and we don't set Content-Type (browser sets multipart/form-data with boundary automatically)
    body: formData,
    headers: {} 
  }),
  delete: (id) => request(`/programs/${id}`, { method: "DELETE" }),
  getSummary: () => request("/programs/summary"),
};

export const jemaahApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/jemaah?${params.toString()}`);
  },
  getById: (id) => request(`/jemaah/${id}`),
  create: (data) => request("/jemaah", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/jemaah/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/jemaah/${id}`, { method: "DELETE" }),
  getSummary: () => request("/jemaah/summary"),
};

export const inventarisApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/inventaris?${params.toString()}`);
  },
  getById: (id) => request(`/inventaris/${id}`),
  create: (data) => request("/inventaris", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/inventaris/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/inventaris/${id}`, { method: "DELETE" }),
  getSummary: () => request("/inventaris/summary"),
};

export const dashboardApi = {
  getSummary: () => request("/dashboard/summary"),
  getCashflow: (year) => request(`/dashboard/cashflow${year ? `?year=${year}` : ''}`),
  getAllocation: () => request("/dashboard/allocation"),
  getRecentActivity: () => request("/dashboard/recent-activity"),
  getUpcomingPrograms: () => request("/dashboard/upcoming-programs"),
  getCompletedPrograms: () => request("/dashboard/completed-programs"),
};

export const usersApi = {
  getAll: () => request("/users"),
  create: (data) => request("/users", { method: "POST", body: JSON.stringify(data) }),
  resendVerification: (id) => request(`/users/${id}/resend-verification`, { method: "POST" }),
  verifyAndSetPassword: (data) => request("/users/verify-and-set-password", { method: "POST", body: JSON.stringify(data) }),
  updateRole: (id, role) => request(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  delete: (id) => request(`/users/${id}`, { method: "DELETE" }),
};

export const ziswafApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/ziswaf?${params.toString()}`);
  },
  getById: (id) => request(`/ziswaf/${id}`),
  create: (data) => request("/ziswaf", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/ziswaf/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/ziswaf/${id}`, { method: "DELETE" }),
};

export const qurbanApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/qurban?${params.toString()}`);
  },
  getById: (id) => request(`/qurban/${id}`),
  create: (data) => request("/qurban", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/qurban/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/qurban/${id}`, { method: "DELETE" }),
};

export const jadwalApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/jadwal?${params.toString()}`);
  },
  getById: (id) => request(`/jadwal/${id}`),
  create: (data) => request("/jadwal", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/jadwal/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/jadwal/${id}`, { method: "DELETE" }),
};

export const notificationApi = {
  getAll: () => request("/notifications"),
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllAsRead: () => request("/notifications/mark-all-read", { method: "PATCH" }),
};
