export const authEndpoints = {
  signup: '/auth/signup',
  login: '/auth/login',
  profile: '/auth/profile',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
};

export const clientEndpoints = {
  base: '/clients',
  create: '/clients',
  getAll: '/clients',
  getById: (id: string) => `/clients/${id}`,
  update: (id: string) => `/clients/${id}`,
  delete: (id: string) => `/clients/${id}`,
  search: '/clients/search',
  export: '/clients/export',
};

export const expenseEndpoints = {
  base: '/expenses',
  create: '/expenses',
  getAll: '/expenses',
  getById: (id: string) => `/expenses/${id}`,
  update: (id: string) => `/expenses/${id}`,
  delete: (id: string) => `/expenses/${id}`,
  byClient: (clientId: string) => `/expenses/client/${clientId}`,
  categories: '/expenses/categories',
  recurring: '/expenses/recurring',
  summary: '/expenses/summary',
};

export const investmentEndpoints = {
  base: '/investment',
  create: '/investment',
  getPortfolio: (clientId: string) => `/investment/${clientId}`,
  update: (id: string) => `/investment/${id}`,
  delete: (id: string) => `/investment/${id}`,
  performance: (clientId: string) => `/investment/${clientId}/performance`,
  rebalance: (clientId: string) => `/investment/${clientId}/rebalance`,
  marketData: '/investment/market-data',
};

export const taxEndpoints = {
  calculate: '/tax/calculate',
  history: '/tax/history',
  report: (year: number) => `/tax/report/${year}`,
  deductions: '/tax/deductions',
  brackets: '/tax/brackets',
  estimate: '/tax/estimate',
};

export const loanEndpoints = {
  base: '/loans',
  apply: '/loans',
  getAll: '/loans',
  getById: (id: string) => `/loans/${id}`,
  status: (id: string) => `/loans/${id}/status`,
  calculate: '/loans/calculate',
  prequalify: '/loans/prequalify',
  documents: (id: string) => `/loans/${id}/documents`,
};

export const insuranceEndpoints = {
  base: '/insurance',
  create: '/insurance',
  getPortfolio: (clientId: string) => `/insurance/${clientId}`,
  update: (id: string) => `/insurance/${id}`,
  delete: (id: string) => `/insurance/${id}`,
  quote: '/insurance/quote',
  claims: '/insurance/claims',
  providers: '/insurance/providers',
};

export const aiEndpoints = {
  recommendations: '/ai/recommendations',
  process: '/ai/process',
  analyze: '/ai/analyze',
  predict: '/ai/predict',
  optimize: '/ai/optimize',
  insights: '/ai/insights',
};

export const analyticsEndpoints = {
  financialSummary: '/analytics/financial-summary',
  salesAnalytics: '/analytics/sales-analytics',
  clientAnalytics: '/analytics/client-analytics',
  expenseAnalytics: '/analytics/expense-analytics',
  investmentAnalytics: '/analytics/investment-analytics',
  dashboard: '/analytics/dashboard',
  reports: '/analytics/reports',
};

export const learningEndpoints = {
  base: '/learning',
  content: '/learning',
  personalized: '/learning/personalized',
  progress: '/learning/progress',
  recommendations: '/learning/recommendations',
  courses: '/learning/courses',
  modules: '/learning/modules',
};

export const quizEndpoints = {
  base: '/quiz',
  getAll: '/quiz',
  getById: (id: string) => `/quiz/${id}`,
  attempt: (id: string) => `/quiz/${id}/attempt`,
  results: (id: string) => `/quiz/${id}/results`,
  leaderboard: '/quiz/leaderboard',
  categories: '/quiz/categories',
};

export const cashFlowEndpoints = {
  analysis: '/cash-flow/analysis',
  forecast: (months: number) => `/cash-flow/forecast/${months}`,
  trends: '/cash-flow/trends',
  optimization: '/cash-flow/optimization',
  scenarios: '/cash-flow/scenarios',
};

export const inventoryEndpoints = {
  base: '/inventory',
  create: '/inventory',
  getAll: '/inventory',
  getById: (id: string) => `/inventory/${id}`,
  update: (id: string) => `/inventory/${id}`,
  delete: (id: string) => `/inventory/${id}`,
  lowStock: '/inventory/low-stock',
  valuation: '/inventory/valuation',
};

export const reportingEndpoints = {
  base: '/reporting',
  generate: '/reporting/generate',
  templates: '/reporting/templates',
  scheduled: '/reporting/scheduled',
  export: '/reporting/export',
};

export const merchantAssistantEndpoints = {
  base: '/merchant-assistant',
  analyze: '/merchant-assistant/analyze',
  recommendations: '/merchant-assistant/recommendations',
  optimization: '/merchant-assistant/optimization',
  insights: '/merchant-assistant/insights',
};

export const healthEndpoints = {
  health: '/health',
  readiness: '/health/readiness',
  liveness: '/health/liveness',
  metrics: '/health/metrics',
};

export const adminEndpoints = {
  users: '/admin/users',
  system: '/admin/system',
  logs: '/admin/logs',
  backup: '/admin/backup',
  settings: '/admin/settings',
};

// Utility function to get all endpoints for a module
export const getModuleEndpoints = (moduleName: string) => {
  const endpointMap: Record<string, any> = {
    auth: authEndpoints,
    clients: clientEndpoints,
    expenses: expenseEndpoints,
    investment: investmentEndpoints,
    tax: taxEndpoints,
    loans: loanEndpoints,
    insurance: insuranceEndpoints,
    ai: aiEndpoints,
    analytics: analyticsEndpoints,
    learning: learningEndpoints,
    quiz: quizEndpoints,
    cashFlow: cashFlowEndpoints,
    inventory: inventoryEndpoints,
    reporting: reportingEndpoints,
    merchantAssistant: merchantAssistantEndpoints,
    health: healthEndpoints,
    admin: adminEndpoints,
  };

  return endpointMap[moduleName] || {};
};

// Function to get all endpoints as a flat array
export const getAllEndpoints = () => {
  const allEndpoints: string[] = [];

  Object.values({
    ...authEndpoints,
    ...clientEndpoints,
    ...expenseEndpoints,
    ...investmentEndpoints,
    ...taxEndpoints,
    ...loanEndpoints,
    ...insuranceEndpoints,
    ...aiEndpoints,
    ...analyticsEndpoints,
    ...learningEndpoints,
    ...quizEndpoints,
    ...cashFlowEndpoints,
    ...inventoryEndpoints,
    ...reportingEndpoints,
    ...merchantAssistantEndpoints,
    ...healthEndpoints,
    ...adminEndpoints,
  }).forEach(endpoint => {
    if (typeof endpoint === 'string') {
      allEndpoints.push(endpoint);
    }
  });

  return allEndpoints;
};
