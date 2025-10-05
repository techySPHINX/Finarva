export const validUserData = {
  email: 'testuser@finarva.com',
  password: 'Test123!@#',
};

export const validAdminData = {
  email: 'admin@finarva.com',
  password: 'Admin123!@#',
  role: 'admin',
};

export const invalidUserData = {
  email: 'invalid-email',
  password: '123',
};

export const validClientData = {
  name: 'John Doe',
  email: 'johndoe@example.com',
  phone: '+1234567890',
  occupation: 'Software Engineer',
  incomeLevel: 'MEDIUM' as const,
  goals: ['retirement', 'home_purchase'],
  riskTolerance: 'MODERATE' as const,
};

export const invalidClientData = {
  name: '',
  email: 'invalid-email',
  phone: 'invalid-phone',
};

export const sampleExpenseData = {
  category: 'Food & Dining',
  amount: 45.50,
  description: 'Lunch at restaurant',
  date: '2024-01-15T12:00:00.000Z',
  isRecurring: false,
  tags: ['lunch', 'dining'],
};

export const sampleRecurringExpenseData = {
  category: 'Utilities',
  amount: 150.00,
  description: 'Monthly electricity bill',
  date: '2024-01-01T09:00:00.000Z',
  isRecurring: true,
  recurringFrequency: 'MONTHLY',
  tags: ['utilities', 'electricity'],
};

export const sampleInvestmentData = {
  investmentType: 'STOCKS',
  symbol: 'AAPL',
  quantity: 10,
  purchasePrice: 150.00,
  currentPrice: 155.00,
  purchaseDate: '2024-01-01T10:00:00.000Z',
};

export const sampleMutualFundData = {
  investmentType: 'MUTUAL_FUND',
  symbol: 'VTIAX',
  quantity: 100,
  purchasePrice: 25.50,
  currentPrice: 26.00,
  purchaseDate: '2024-01-01T10:00:00.000Z',
};

export const sampleTaxData = {
  income: 75000,
  deductions: 12000,
  filingStatus: 'single',
  state: 'CA',
  year: 2024,
  dependents: 0,
  additionalIncome: 0,
};

export const sampleMarriedTaxData = {
  income: 120000,
  spouseIncome: 50000,
  deductions: 24000,
  filingStatus: 'married_joint',
  state: 'NY',
  year: 2024,
  dependents: 2,
};

export const sampleLoanData = {
  loanType: 'PERSONAL',
  amount: 25000,
  term: 36,
  purpose: 'Debt Consolidation',
  income: 65000,
  creditScore: 720,
  employmentHistory: 5,
  existingDebts: 15000,
};

export const sampleMortgageData = {
  loanType: 'MORTGAGE',
  amount: 350000,
  term: 360,
  purpose: 'Home Purchase',
  income: 90000,
  creditScore: 750,
  downPayment: 70000,
  propertyValue: 420000,
};

export const sampleInsuranceData = {
  insuranceType: 'LIFE',
  coverage: 500000,
  premium: 200,
  term: 20,
  beneficiaries: ['Spouse'],
  healthStatus: 'GOOD',
  smoker: false,
};

export const sampleAutoInsuranceData = {
  insuranceType: 'AUTO',
  coverage: 100000,
  premium: 150,
  term: 12,
  vehicleInfo: {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '1234567890ABCDEFG',
  },
  drivingRecord: 'CLEAN',
};

export const sampleQuizData = {
  title: 'Financial Literacy Quiz',
  description: 'Test your knowledge of basic financial concepts',
  difficulty: 'BEGINNER',
  language: 'en',
  questions: [
    {
      questionText: 'What is compound interest?',
      options: [
        'Interest earned on principal only',
        'Interest earned on principal and accumulated interest',
        'A type of bank account',
        'A loan payment method',
      ],
      correctAnswer: 1,
      explanation: 'Compound interest is interest calculated on the initial principal and accumulated interest.',
    },
    {
      questionText: 'What is diversification in investing?',
      options: [
        'Putting all money in one stock',
        'Spreading investments across different assets',
        'Only investing in bonds',
        'Avoiding all investments',
      ],
      correctAnswer: 1,
      explanation: 'Diversification involves spreading investments to reduce risk.',
    },
  ],
};

export const sampleQuizAnswers = {
  answers: [
    { questionId: '1', selectedOption: 'B' },
    { questionId: '2', selectedOption: 'B' },
  ],
  timeSpent: 120,
};

export const sampleLearningContent = {
  title: 'Introduction to Investing',
  type: 'ARTICLE',
  difficulty: 'BEGINNER',
  category: 'INVESTING',
  content: 'This is a comprehensive guide to investing basics...',
  estimatedReadTime: 10,
  tags: ['investing', 'basics', 'beginner'],
};

export const sampleLearningProfile = {
  experience: 'BEGINNER',
  interests: ['investing', 'budgeting', 'retirement'],
  goals: ['learn_basics', 'improve_savings'],
  riskTolerance: 'CONSERVATIVE',
  timeAvailable: 30, // minutes per week
};

export const sampleAIRecommendationData = {
  financialGoals: ['retirement', 'emergency_fund'],
  currentAssets: 50000,
  monthlyIncome: 5000,
  monthlyExpenses: 3500,
  riskTolerance: 'MODERATE',
  timeHorizon: 10,
  age: 35,
  dependents: 1,
};

export const sampleCashFlowData = {
  monthlyIncome: 6000,
  monthlyExpenses: 4500,
  oneTimeIncome: [
    { amount: 5000, date: '2024-03-01', description: 'Bonus' },
  ],
  oneTimeExpenses: [
    { amount: 2000, date: '2024-02-15', description: 'Car repair' },
  ],
  forecastMonths: 12,
};

export const sampleAnalyticsFilters = {
  dateRange: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
  categories: ['Food & Dining', 'Transportation', 'Entertainment'],
  clientIds: [],
};

export const sampleInventoryData = {
  name: 'Office Supplies',
  category: 'OFFICE',
  quantity: 50,
  unitPrice: 25.00,
  supplier: 'Office Depot',
  location: 'Storage Room A',
  reorderLevel: 10,
};

export const performanceTestData = {
  largeClientList: Array.from({ length: 1000 }, (_, i) => ({
    name: `Client ${i + 1}`,
    email: `client${i + 1}@example.com`,
    phone: `+123456${String(i + 1).padStart(4, '0')}`,
    occupation: 'Professional',
    incomeLevel: ['LOW', 'MEDIUM', 'HIGH'][i % 3],
    riskTolerance: ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'][i % 3],
  })),

  bulkExpenseData: Array.from({ length: 500 }, (_, i) => ({
    category: ['Food & Dining', 'Transportation', 'Entertainment', 'Utilities'][i % 4],
    amount: Math.floor(Math.random() * 500) + 10,
    description: `Test expense ${i + 1}`,
    date: new Date(2024, Math.floor(i / 30), (i % 30) + 1).toISOString(),
    isRecurring: i % 10 === 0,
  })),
};

export const errorTestData = {
  malformedJson: '{"invalid": json}',
  sqlInjection: "'; DROP TABLE users; --",
  xssPayload: '<script>alert("xss")</script>',
  oversizedString: 'A'.repeat(10000),
  invalidDates: ['2024-13-45', 'invalid-date', ''],
  invalidNumbers: ['not-a-number', 'Infinity', 'NaN'],
  invalidEmails: ['invalid-email', '@example.com', 'user@'],
};
