import {
  AdminUser,
  FullAnalyticsData,
  OverviewMetrics,
  PaginationMeta,
  ReportFormData,
  ReportItem,
} from '../types/index.ts';

const API_BASE = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('rms_auth_token');
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('rms_auth_token', token);
  } else {
    localStorage.removeItem('rms_auth_token');
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setAuthToken(null);
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Your session has expired. Please sign in again.');
  }

  const data = await response.json();
  if (!response.ok || data.success === false) {
    const errorMsg = data.errors ? data.errors.join(', ') : data.message || 'Request failed';
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
    const res = await request<{ token: string; admin: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res;
  },

  async getMe(): Promise<{ admin: AdminUser }> {
    return request<{ admin: AdminUser }>('/auth/me');
  },

  // Reports
  async getReports(params: Record<string, any> = {}): Promise<{ data: ReportItem[]; pagination: PaginationMeta }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    return request<{ data: ReportItem[]; pagination: PaginationMeta }>(`/reports?${query.toString()}`);
  },

  async getReportById(id: string): Promise<{ data: ReportItem }> {
    return request<{ data: ReportItem }>(`/reports/${id}`);
  },

  async createReport(payload: Partial<ReportFormData>): Promise<{ data: ReportItem; message: string }> {
    return request<{ data: ReportItem; message: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateReport(id: string, payload: Partial<ReportFormData>): Promise<{ data: ReportItem; message: string }> {
    return request<{ data: ReportItem; message: string }>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async archiveReport(id: string): Promise<{ data: ReportItem; message: string }> {
    return request<{ data: ReportItem; message: string }>(`/reports/${id}/archive`, {
      method: 'PATCH',
    });
  },

  async restoreReport(id: string): Promise<{ data: ReportItem; message: string }> {
    return request<{ data: ReportItem; message: string }>(`/reports/${id}/restore`, {
      method: 'PATCH',
    });
  },

  async getCategories(): Promise<{ data: string[] }> {
    return request<{ data: string[] }>('/reports/categories');
  },

  // Analytics
  async getOverview(): Promise<{ data: OverviewMetrics }> {
    return request<{ data: OverviewMetrics }>('/analytics/overview');
  },

  async getFullAnalytics(filters: Record<string, string> = {}): Promise<{ data: FullAnalyticsData }> {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== 'ALL') query.append(k, v);
    });
    return request<{ data: FullAnalyticsData }>(`/analytics/all?${query.toString()}`);
  },

  // Exports
  async downloadExcel(params: Record<string, any> = {}): Promise<void> {
    const token = getAuthToken();
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });

    const res = await fetch(`${API_BASE}/export/excel?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to generate Excel export file.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reports_Export_${new Date().toISOString().substring(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  async downloadPDF(params: Record<string, any> = {}): Promise<void> {
    const token = getAuthToken();
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });

    const res = await fetch(`${API_BASE}/export/pdf?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to generate PDF document.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = params.reportId ? `Report_${params.reportId}.pdf` : `Reports_Summary_${new Date().toISOString().substring(0, 10)}.pdf`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  async checkHealth(): Promise<{ status: string; database: string }> {
    const res = await fetch('/api/health');
    return res.json();
  },
};
