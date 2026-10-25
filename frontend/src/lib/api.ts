const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lp_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export interface UserGroupItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_public_registration: boolean;
  is_system_group: boolean;
  user_count?: number;
  created_at: string;
}

export interface SystemUserItem {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  avatar_url?: string;
  is_kyc_verified: boolean;
  created_at: string;
  group?: {
    id: string;
    code: string;
    name: string;
    description?: string;
    is_public_registration?: boolean;
    is_system_group?: boolean;
  };
}

export interface PropertyCategoryItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  color_code: string;
  icon: string;
  is_active: boolean;
  display_order: number;
  property_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const api = {
  // Auth
  login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  googleLogin: (data: any) => fetchApi('/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchApi('/auth/me'),

  // Properties
  getProperties: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
    ).toString();
    return fetchApi(`/properties${query ? `?${query}` : ''}`);
  },
  getMyProperties: () => fetchApi('/properties/my-properties'),
  getProperty: (id: string) => fetchApi(`/properties/${id}`),
  createProperty: (data: any) => fetchApi('/properties', { method: 'POST', body: JSON.stringify(data) }),
  updateProperty: (id: string, data: any) => fetchApi(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProperty: (id: string) => fetchApi(`/properties/${id}`, { method: 'DELETE' }),

  // Auctions
  getAuctions: (status?: string) => fetchApi(`/auctions${status ? `?status=${status}` : ''}`),
  getAuction: (id: string) => fetchApi(`/auctions/${id}`),
  placeBid: (auctionId: string, amount: number) =>
    fetchApi(`/auctions/${auctionId}/bids`, { method: 'POST', body: JSON.stringify({ amount }) }),

  // Inspections
  getInspections: () => fetchApi('/inspections'),
  createInspection: (data: any) => fetchApi('/inspections', { method: 'POST', body: JSON.stringify(data) }),
  updateInspectionStatus: (id: string, data: any) =>
    fetchApi(`/inspections/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Exchanges
  getExchanges: () => fetchApi('/exchanges'),
  createExchange: (data: any) => fetchApi('/exchanges', { method: 'POST', body: JSON.stringify(data) }),
  updateExchangeStatus: (id: string, data: any) =>
    fetchApi(`/exchanges/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Master Data & User Groups
  getPublicUserGroups: () => fetchApi('/user-groups/public'),

  // Admin
  getAdminStats: () => fetchApi('/admin/stats'),
  getPendingProperties: () => fetchApi('/admin/pending-properties'),
  approveProperty: (id: string) => fetchApi(`/admin/properties/${id}/approve`, { method: 'PUT' }),
  rejectProperty: (id: string, reason?: string) =>
    fetchApi(`/admin/properties/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  getPendingAuctions: () => fetchApi('/admin/pending-auctions'),
  approveAuction: (id: string) => fetchApi(`/admin/auctions/${id}/approve`, { method: 'PUT' }),

  // Master Data: Property Categories
  getPropertyCategories: () => fetchApi('/property-categories'),

  // Admin Master Data: Property Categories
  getAdminPropertyCategories: () => fetchApi('/admin/property-categories'),
  createAdminPropertyCategory: (data: any) =>
    fetchApi('/admin/property-categories', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminPropertyCategory: (id: string, data: any) =>
    fetchApi(`/admin/property-categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminPropertyCategory: (id: string) =>
    fetchApi(`/admin/property-categories/${id}`, { method: 'DELETE' }),

  // Admin Master Data: User Groups
  getAdminUserGroups: () => fetchApi('/admin/user-groups'),
  createAdminUserGroup: (data: any) =>
    fetchApi('/admin/user-groups', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminUserGroup: (id: string, data: any) =>
    fetchApi(`/admin/user-groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminUserGroup: (id: string) =>
    fetchApi(`/admin/user-groups/${id}`, { method: 'DELETE' }),

  // Admin Master Data: System Users
  getAdminSystemUsers: () => fetchApi('/admin/system-users'),
  createAdminSystemUser: (data: any) =>
    fetchApi('/admin/system-users', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminSystemUser: (id: string, data: any) =>
    fetchApi(`/admin/system-users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminSystemUser: (id: string) =>
    fetchApi(`/admin/system-users/${id}`, { method: 'DELETE' }),
};
