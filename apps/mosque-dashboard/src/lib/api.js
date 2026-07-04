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
    throw new Error(err.error || `Request failed: ${res.status}`);
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
