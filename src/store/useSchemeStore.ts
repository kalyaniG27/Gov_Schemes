import { create } from "zustand";
import { Scheme, SchemeCategory } from "../types";

interface SchemeState {
  schemes: Scheme[];
  filteredSchemes: Scheme[];
  selectedScheme: Scheme | null;
  loading: boolean;
  error: string | null;
  fetchSchemes: () => Promise<void>;
  getSchemeById: (id: string) => Promise<Scheme | null>;
  filterSchemes: (
    category?: SchemeCategory,
    query?: string,
    filters?: Partial<Record<string, any>>
  ) => void;
  sortSchemes: (sortBy: "title" | "lastUpdated", order: "asc" | "desc") => void;
  addScheme: (scheme: Scheme) => Promise<void>;
  updateScheme: (scheme: Scheme) => Promise<void>;
  deleteScheme: (id: string) => Promise<void>;
}

const mockSchemes: Scheme[] = [
  {
    id: "scheme-1",
    title: "PM Scholarship Scheme",
    category: "students",
    ministry: "Ministry of Education",
    description:
      "Scholarships for meritorious students from low-income families to pursue higher education.",
    eligibilityCriteria: {
      age: { max: 25 },
      income: { max: 800000 },
      education: ["12th Pass", "Undergraduate"],
      other: ["Must have scored at least 80% marks in 12th standard"],
    },
    benefits: [
      "Financial assistance of ₹12,000 per annum",
      "Book allowance of ₹3,000 per annum",
      "Special coaching for competitive exams",
    ],
    requiredDocuments: [
      "Income Certificate",
      "Mark sheets of last qualifying examination",
      "Aadhaar Card",
      "Bank Account details",
      "Residence Certificate",
    ],
    applicationProcess: [
      "Register on the National Scholarship Portal",
      "Fill the application form with personal and academic details",
      "Upload required documents",
      "Submit the application and track status online",
    ],
    applicationLink: "https://scholarships.gov.in",
    imageUrl:
      "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-04-15",
  },
  {
    id: "scheme-2",
    title: "PM-KISAN",
    category: "farmers",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    description:
      "Direct income support to farmer families to supplement their financial needs for agriculture inputs and household expenses.",
    eligibilityCriteria: {
      category: ["Small and Marginal Farmers"],
      other: ["Cultivable land ownership"],
    },
    benefits: [
      "Direct financial benefit of ₹6,000 per year in three equal installments",
      "Amount directly transferred to bank accounts",
      "Supports farmers in meeting agricultural input costs",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Land Records",
      "Bank Account details",
      "Residential Certificate",
    ],
    applicationProcess: [
      "Apply through local Common Service Centers",
      "Fill application form with personal and land details",
      "Verify bank account details",
      "Submit and track application online",
    ],
    applicationLink: "https://pmkisan.gov.in",
    imageUrl:
      "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-05-20",
  },
  {
    id: "scheme-3",
    title: "Ayushman Bharat",
    category: "health",
    ministry: "Ministry of Health and Family Welfare",
    description:
      "Health insurance scheme providing financial protection to vulnerable families for secondary and tertiary care hospitalization.",
    eligibilityCriteria: {
      income: { max: 500000 },
      other: [
        "Must be listed in SECC database",
        "No existing health insurance",
      ],
    },
    benefits: [
      "Health coverage up to ₹5 lakhs per family per year",
      "Cashless and paperless treatment at empanelled hospitals",
      "Coverage for pre and post hospitalization expenses",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Ration Card/SECC database listing proof",
      "Income Certificate",
      "Passport size photographs",
    ],
    applicationProcess: [
      "Visit nearest Ayushman Bharat Kendra or Common Service Center",
      "Verify eligibility through Aadhaar and SECC database",
      "Complete biometric verification",
      "Receive Ayushman Card for availing benefits",
    ],
    applicationLink: "https://pmjay.gov.in",
    imageUrl:
      "https://images.pexels.com/photos/4021779/pexels-photo-4021779.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-02-10",
  },
  {
    id: "scheme-4",
    title: "PM Awas Yojana",
    category: "housing",
    ministry: "Ministry of Housing and Urban Affairs",
    description:
      "Housing scheme to provide affordable housing to urban poor and economically weaker sections of society.",
    eligibilityCriteria: {
      income: { max: 300000 },
      other: ["No existing house ownership in family", "First-time home buyer"],
    },
    benefits: [
      "Interest subsidy on home loans up to ₹2.67 lakhs",
      "Direct financial assistance for construction",
      "Reduced EMI burden on housing loans",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Income Certificate",
      "Bank Account details",
      "Property documents (if applicable)",
      "Self-declaration of no house ownership",
    ],
    applicationProcess: [
      "Apply through PMAY portal or nearest Municipal Corporation office",
      "Complete socio-economic survey",
      "Submit required documents",
      "Track application status online",
    ],
    applicationLink: "https://pmaymis.gov.in",
    imageUrl:
      "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-03-05",
  },
  {
    id: "scheme-5",
    title: "Sukanya Samriddhi Yojana",
    category: "women",
    ministry: "Ministry of Finance",
    description:
      "Small savings scheme for girl child to encourage parents to build fund for future education and marriage expenses.",
    eligibilityCriteria: {
      age: { max: 10 },
      gender: ["Female"],
      other: ["Account must be opened by parents/guardians"],
    },
    benefits: [
      "High interest rate (currently 7.6% p.a.)",
      "Tax benefits under Section 80C",
      "Partial withdrawal allowed for higher education",
    ],
    requiredDocuments: [
      "Birth Certificate of girl child",
      "Identity proof of parents/guardian",
      "Address proof",
      "Photographs",
    ],
    applicationProcess: [
      "Visit nearest post office or authorized bank",
      "Fill the application form with details",
      "Submit required documents",
      "Make initial deposit (minimum ₹250)",
    ],
    applicationLink:
      "https://www.india.gov.in/spotlight/sukanya-samriddhi-yojana",
    imageUrl:
      "https://images.pexels.com/photos/7107213/pexels-photo-7107213.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-01-25",
  },
  {
    id: "scheme-6",
    title: "PM Jan Dhan Yojana",
    category: "financial",
    ministry: "Ministry of Finance",
    description:
      "Financial inclusion program to ensure access to financial services like banking, insurance, pension in an affordable manner.",
    eligibilityCriteria: {
      age: { min: 10 },
      other: ["No existing bank account", "Indian resident"],
    },
    benefits: [
      "Zero balance bank account",
      "Accidental insurance cover of ₹2 lakhs",
      "No minimum balance requirement",
      "RuPay debit card with ₹1 lakh insurance",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Address proof",
      "Identity proof",
      "Photographs",
    ],
    applicationProcess: [
      "Visit nearest bank branch",
      "Fill the account opening form",
      "Submit KYC documents",
      "Receive passbook and RuPay card",
    ],
    applicationLink: "https://pmjdy.gov.in",
    imageUrl:
      "https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-04-02",
  },
  {
    id: "scheme-7",
    title: "AICTE Pragati Scholarship",
    category: "students",
    ministry: "Ministry of Education",
    description:
      "Scholarship scheme for girl students pursuing technical education to encourage female participation in technical fields.",
    eligibilityCriteria: {
      gender: ["Female"],
      education: ["Engineering", "Technical Diploma"],
      income: { max: 800000 },
      other: ["Must be enrolled in AICTE approved institution"],
    },
    benefits: [
      "Tuition fee reimbursement up to ₹30,000 per annum",
      "Maintenance allowance of ₹20,000 per annum",
      "Additional support for books and supplies",
    ],
    requiredDocuments: [
      "Income Certificate",
      "College/Institution admission proof",
      "Mark sheets of previous exams",
      "Bank Account details",
      "Aadhaar Card",
    ],
    applicationProcess: [
      "Register on AICTE portal",
      "Fill application form with academic and personal details",
      "Upload required documents",
      "Submit application and track status online",
    ],
    applicationLink: "https://www.aicte-india.org",
    imageUrl:
      "https://images.pexels.com/photos/3769981/pexels-photo-3769981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-05-15",
  },
  {
    id: "scheme-8",
    title: "National Means-cum-Merit Scholarship",
    category: "students",
    ministry: "Ministry of Education",
    description:
      "Scholarship for meritorious students from economically weaker sections to reduce dropout rate in class VIII.",
    eligibilityCriteria: {
      education: ["Class VIII"],
      income: { max: 150000 },
      other: ["Must qualify NMMS examination"],
    },
    benefits: [
      "Scholarship of ₹12,000 per annum",
      "Support for continuing education from class IX to XII",
      "Direct bank transfer of funds",
    ],
    requiredDocuments: [
      "Income Certificate",
      "School enrollment certificate",
      "Mark sheet of previous class",
      "Bank Account details",
      "Aadhaar Card",
    ],
    applicationProcess: [
      "Apply through school principal",
      "Appear for NMMS examination",
      "Submit required documents if qualified",
      "Track status through National Scholarship Portal",
    ],
    applicationLink: "https://scholarships.gov.in",
    imageUrl:
      "https://images.pexels.com/photos/5212665/pexels-photo-5212665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-03-10",
  },
  {
    id: "scheme-9",
    title: "PM Mudra Yojana",
    category: "financial",
    ministry: "Ministry of Finance",
    description:
      "Financial support for micro enterprises to help them grow their businesses.",
    eligibilityCriteria: {
      age: { min: 18 },
      other: ["Must be a micro enterprise", "Business plan required"],
    },
    benefits: [
      "Loans up to ₹10 lakhs without collateral",
      "Flexible repayment terms",
      "Lower interest rates",
      "No processing fees",
    ],
    requiredDocuments: [
      "Identity Proof",
      "Address Proof",
      "Business Registration",
      "Business Plan",
      "Bank Statement",
    ],
    applicationProcess: [
      "Visit nearest bank branch",
      "Submit business proposal",
      "Complete loan application",
      "Provide required documents",
    ],
    applicationLink: "https://www.mudra.org.in",
    imageUrl:
      "https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg",
    lastUpdated: "2023-06-20",
  },
  {
    id: "scheme-10",
    title: "Atal Pension Yojana",
    category: "financial",
    ministry: "Ministry of Finance",
    description:
      "Pension scheme for workers in unorganized sector ensuring monthly pension after 60 years of age.",
    eligibilityCriteria: {
      age: { min: 18, max: 40 },
      other: [
        "Bank account holder",
        "Not covered under any statutory social security scheme",
      ],
    },
    benefits: [
      "Guaranteed pension of ₹1,000 to ₹5,000 per month",
      "Government co-contribution",
      "Tax benefits under 80CCD",
      "Option to increase/decrease pension amount",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Bank Account Details",
      "Mobile Number",
      "Age Proof",
    ],
    applicationProcess: [
      "Visit bank branch or access net banking",
      "Fill APY registration form",
      "Choose pension amount",
      "Set up auto-debit",
    ],
    applicationLink: "https://www.npscra.nsdl.co.in/scheme-details.php",
    imageUrl:
      "https://images.pexels.com/photos/7876429/pexels-photo-7876429.jpeg",
    lastUpdated: "2023-07-15",
  },
  {
    id: "scheme-11",
    title: "National Social Assistance Programme (NSAP)",
    category: "senior-citizens",
    ministry: "Ministry of Rural Development",
    description:
      "Provides financial assistance to elderly citizens who are below poverty line and have no means of subsistence.",
    eligibilityCriteria: {
      age: { min: 60 },
      income: { max: 150000 },
      other: ["Below poverty line", "No regular income source"],
    },
    benefits: [
      "Monthly pension of ₹200 for persons aged 60-79 years",
      "Monthly pension of ₹500 for persons aged 80 years and above",
      "Direct bank transfer of funds",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Age Proof Certificate",
      "Income Certificate",
      "Bank Account Details",
      "BPL Certificate",
    ],
    applicationProcess: [
      "Apply through local Panchayat or Municipal Corporation",
      "Submit required documents",
      "Verification by local authorities",
      "Receive approval and start receiving pension",
    ],
    applicationLink: "https://nsap.nic.in",
    imageUrl:
      "https://images.pexels.com/photos/3184430/pexels-photo-3184430.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-08-01",
  },
  {
    id: "scheme-12",
    title: "Senior Citizen Health Insurance Scheme",
    category: "senior-citizens",
    ministry: "Ministry of Health and Family Welfare",
    description:
      "Health insurance scheme specifically designed for senior citizens providing comprehensive medical coverage.",
    eligibilityCriteria: {
      age: { min: 60 },
      other: ["Indian citizen", "No existing comprehensive health insurance"],
    },
    benefits: [
      "Hospitalization coverage up to ₹3 lakhs per year",
      "Pre and post hospitalization expenses",
      "Day care procedures coverage",
      "Ambulance charges",
      "Cashless treatment at network hospitals",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Age Proof",
      "Medical History Report",
      "Bank Account Details",
      "Recent Photograph",
    ],
    applicationProcess: [
      "Visit nearest insurance office or online portal",
      "Fill application form with personal details",
      "Undergo medical examination if required",
      "Pay premium and receive policy",
    ],
    applicationLink: "https://www.india.gov.in/spotlight/senior-citizen-health-insurance-scheme",
    imageUrl:
      "https://images.pexels.com/photos/4021779/pexels-photo-4021779.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-08-15",
  },
  {
    id: "scheme-13",
    title: "Indira Gandhi National Old Age Pension Scheme",
    category: "senior-citizens",
    ministry: "Ministry of Rural Development",
    description:
      "Pension scheme for elderly citizens providing monthly financial assistance to improve their quality of life.",
    eligibilityCriteria: {
      age: { min: 60 },
      income: { max: 200000 },
      other: ["Belong to BPL category", "No other pension source"],
    },
    benefits: [
      "Monthly pension ranging from ₹200 to ₹500",
      "Additional benefits for very elderly (80+ years)",
      "Direct benefit transfer to bank account",
      "No contribution required from beneficiary",
    ],
    requiredDocuments: [
      "Aadhaar Card",
      "Age Proof Certificate",
      "Income Certificate",
      "BPL Ration Card",
      "Bank Passbook",
    ],
    applicationProcess: [
      "Apply at local Gram Panchayat or Municipal office",
      "Submit application form with documents",
      "Verification by social welfare officer",
      "Approval and enrollment in the scheme",
    ],
    applicationLink: "https://nsap.nic.in/ignops.php",
    imageUrl:
      "https://images.pexels.com/photos/7876429/pexels-photo-7876429.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    lastUpdated: "2023-09-01",
  },
];

const useSchemeStore = create<SchemeState>((set, get) => ({
  schemes: [],
  filteredSchemes: [],
  selectedScheme: null,
  loading: false,
  error: null,

  fetchSchemes: async () => {
    set({ loading: true, error: null });
    try {
      // Try to fetch from scraped API first
      const response = await fetch("http://localhost:3001/api/scrape-schemes");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          set({
            schemes: data.data,
            filteredSchemes: data.data,
            loading: false,
          });
          return;
        }
      }

      // Fallback to mock data if scraping fails
      console.log("Using mock data as fallback");
      await new Promise((resolve) => setTimeout(resolve, 800));
      set({
        schemes: mockSchemes,
        filteredSchemes: mockSchemes,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching schemes:", error);
      // Fallback to mock data on error
      set({
        schemes: mockSchemes,
        filteredSchemes: mockSchemes,
        loading: false,
      });
    }
  },

  getSchemeById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 400));

      const scheme = mockSchemes.find((s) => s.id === id) || null;
      set({ selectedScheme: scheme, loading: false });
      return scheme;
    } catch (error) {
      set({ error: "Failed to fetch scheme details", loading: false });
      return null;
    }
  },

  addScheme: async (scheme: Scheme) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      set((state) => ({
        schemes: [...state.schemes, scheme],
        filteredSchemes: [...state.filteredSchemes, scheme],
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to add scheme", loading: false });
    }
  },

  updateScheme: async (updatedScheme: Scheme) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      set((state) => ({
        schemes: state.schemes.map((scheme) =>
          scheme.id === updatedScheme.id ? updatedScheme : scheme
        ),
        filteredSchemes: state.filteredSchemes.map((scheme) =>
          scheme.id === updatedScheme.id ? updatedScheme : scheme
        ),
        selectedScheme:
          state.selectedScheme?.id === updatedScheme.id
            ? updatedScheme
            : state.selectedScheme,
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update scheme", loading: false });
    }
  },

  deleteScheme: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      set((state) => ({
        schemes: state.schemes.filter((scheme) => scheme.id !== id),
        filteredSchemes: state.filteredSchemes.filter(
          (scheme) => scheme.id !== id
        ),
        selectedScheme:
          state.selectedScheme?.id === id ? null : state.selectedScheme,
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete scheme", loading: false });
    }
  },

  filterSchemes: (category, query, filters) => {
    const { schemes } = get();

    let filtered = [...schemes];

    // Filter by category if provided
    if (category) {
      filtered = filtered.filter((scheme) => scheme.category === category);
    }

    // Filter by search query if provided
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (scheme) =>
          scheme.title.toLowerCase().includes(lowerQuery) ||
          scheme.description.toLowerCase().includes(lowerQuery) ||
          scheme.ministry.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply additional filters if provided
    if (filters) {
      if (filters.ministry) {
        filtered = filtered.filter(
          (scheme) => scheme.ministry === filters.ministry
        );
      }

      if (filters.minIncome !== undefined && filters.maxIncome !== undefined) {
        filtered = filtered.filter((scheme) => {
          const maxEligibleIncome = scheme.eligibilityCriteria.income?.max;
          if (!maxEligibleIncome) return true;
          return maxEligibleIncome >= filters.minIncome;
        });
      }

      if (filters.gender) {
        filtered = filtered.filter((scheme) => {
          const eligibleGenders = scheme.eligibilityCriteria.gender;
          if (!eligibleGenders) return true;
          return eligibleGenders.includes(filters.gender);
        });
      }
    }

    set({ filteredSchemes: filtered });
  },

  sortSchemes: (sortBy, order) => {
    const { filteredSchemes } = get();

    let sorted = [...filteredSchemes];

    if (sortBy === "title") {
      sorted.sort((a, b) => {
        const comparison = a.title.localeCompare(b.title);
        return order === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "lastUpdated") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.lastUpdated).getTime();
        const dateB = new Date(b.lastUpdated).getTime();
        const comparison = dateA - dateB;
        return order === "asc" ? comparison : -comparison;
      });
    }

    set({ filteredSchemes: sorted });
  },
}));

export default useSchemeStore;
