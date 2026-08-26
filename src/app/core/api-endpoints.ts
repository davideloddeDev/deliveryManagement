export const API_CONFIG = {
  origin: 'http://localhost:3000',
  prefix: '/api'
} as const;

export const API_BASE_URL = `${API_CONFIG.origin}${API_CONFIG.prefix}`;

export const POLLING_CONFIG = {
  dashboardMs: 30000,
  consegneMs: 30000
} as const;

const withBase = (path: string): string => `${API_BASE_URL}${path}`;

export const API_ENDPOINTS = {
  docs: {
    swaggerUi: `${API_CONFIG.origin}/api-docs/`,
    openApiJson: withBase('/docs')
  },
  health: `${API_CONFIG.origin}/health`,
  auth: {
    login: withBase('/auth/login'),
    register: withBase('/auth/register'),
    logout: withBase('/auth/logout'),
    me: withBase('/auth/me'),
    refresh: withBase('/auth/refresh')
  },
  dashboard: {
    summary: withBase('/dashboard/summary'),
    revenue: withBase('/dashboard/revenue'),
    deliveryStatus: withBase('/dashboard/delivery-status'),
    recentDeliveries: withBase('/dashboard/recent-deliveries'),
    topVehicles: withBase('/dashboard/top-vehicles'),
    paymentMethods: withBase('/dashboard/payment-methods')
  },
  collaboratori: {
    list: withBase('/collaboratori/'),
    options: withBase('/collaboratori/options'),
    byId: (id: number | string): string => withBase(`/collaboratori/${id}`)
  },
  consegne: {
    list: withBase('/consegne/'),
    options: withBase('/consegne/options'),
    byId: (id: number | string): string => withBase(`/consegne/${id}`),
    status: (id: number | string): string => withBase(`/consegne/${id}/status`),
    history: (id: number | string): string => withBase(`/consegne/${id}/history`)
  },
  mezzi: {
    list: withBase('/mezzi/'),
    options: withBase('/mezzi/options'),
    byId: (id: number | string): string => withBase(`/mezzi/${id}`),
    authorizeInsurancePayment: (id: number | string): string => withBase(`/mezzi/${id}/assicurazione/authorize-payment`),
    insuranceStatus: (id: number | string): string => withBase(`/mezzi/${id}/assicurazione/status`),
    latestTelemetry: (id: number | string): string => withBase(`/mezzi/${id}/telemetria/latest`)
  },
  pagamenti: {
    list: withBase('/pagamenti/'),
    options: withBase('/pagamenti/options'),
    summary: withBase('/pagamenti/summary'),
    byId: (id: number | string): string => withBase(`/pagamenti/${id}`),
    markPaid: (id: number | string): string => withBase(`/pagamenti/${id}/mark-paid`)
  },
  entrate: {
    list: withBase('/entrate/'),
    options: withBase('/entrate/options'),
    summary: withBase('/entrate/summary'),
    byId: (id: number | string): string => withBase(`/entrate/${id}`),
    markReceived: (id: number | string): string => withBase(`/entrate/${id}/mark-received`)
  },
  settings: {
    company: withBase('/settings/company'),
    system: withBase('/settings/system'),
    systemByKey: (key: string): string => withBase(`/settings/system/${key}`),
    accesses: withBase('/settings/accesses'),
    accessByCollaboratoreId: (id: number | string): string => withBase(`/settings/accesses/${id}`),
    license: withBase('/settings/license'),
    renewLicense: withBase('/settings/license/renew'),
    auditLog: withBase('/settings/audit-log')
  },
  telemetry: {
    vehicles: withBase('/telemetry/vehicles'),
    latest: (mezzoId: number | string): string => withBase(`/telemetry/vehicles/${mezzoId}/latest`),
    history: (mezzoId: number | string): string => withBase(`/telemetry/vehicles/${mezzoId}/history`),
    status: (mezzoId: number | string): string => withBase(`/telemetry/vehicles/${mezzoId}/status`),
    updateVehicle: (mezzoId: number | string): string => withBase(`/telemetry/vehicles/${mezzoId}`)
  },
  licenseKeys: {
    list: withBase('/license-keys/'),
    options: withBase('/license-keys/options'),
    byId: (id: number | string): string => withBase(`/license-keys/${id}`)
  }
} as const;
