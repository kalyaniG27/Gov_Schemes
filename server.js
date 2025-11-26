// server.js
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import cors from "cors";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

console.log("Starting server...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env"), debug: true });

console.log("Twilio Account SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("Twilio Auth Token:", process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Not Loaded");
console.log("Twilio Phone Number:", process.env.TWILIO_PHONE_NUMBER);
console.log("Agent Phone Number:", process.env.AGENT_PHONE_NUMBER);


const { VoiceResponse } = twilio.twiml;

// Initialize OpenAI (optional)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn(
    "OPENAI_API_KEY not set. Voice parsing features will be limited."
  );
}

// Session storage for voice call data
const userSessions = new Map();

// Helper function to get or create user session
function getUserSession(callSid) {
  if (!userSessions.has(callSid)) {
    userSessions.set(callSid, {
      language: "english",
      step: "start",
      data: {
        age: null,
        gender: null,
        income: null,
        occupation: null,
        city: null,
        phoneNumber: null,
      },
      eligibleSchemes: [],
      smsSent: false,
    });
  }
  return userSessions.get(callSid);
}

// Helper function to clear user session
function clearUserSession(callSid) {
  userSessions.delete(callSid);
}

const app = express();
app.use(cors()); // Enable CORS for frontend requests
app.use(bodyParser.json()); // Enable JSON body parsing
app.use(bodyParser.urlencoded({ extended: false }));

// --- Caching and Scraping Schedule Setup ---

let cachedSchemes = null;
let lastScrapeTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour TTL for cached data

async function updateSchemeCache() {
  try {
    console.log("Starting background scrape to update cached schemes...");
    const schemes = await scrapeGovernmentSchemes();
    cachedSchemes = schemes;
    lastScrapeTimestamp = Date.now();
    console.log(
      `Successfully updated cached schemes at ${new Date(
        lastScrapeTimestamp
      ).toISOString()} with ${schemes.length} schemes.`
    );
  } catch (error) {
    console.error("Failed to update scheme cache:", error);
  }
}

// Initial scrape cache load on server start
updateSchemeCache();

// Schedule periodic background scraping every 1 hour
setInterval(() => {
  updateSchemeCache();
}, CACHE_TTL);

// --- Click-to-Call Feature ---

// Ensure you have your credentials in the .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const agentPhoneNumber = process.env.AGENT_PHONE_NUMBER; // The number you want to call (e.g., your support line)

if (!accountSid || !authToken || !twilioPhoneNumber || !agentPhoneNumber) {
  console.error(
    "Twilio environment variables are not set. Please check your .env file."
  );
  // process.exit(1); // You might want to enable this in production
}

const client = twilio(accountSid, authToken);

// --- Voice Integration for Scheme Information ---

// Mock schemes data (copied from useSchemeStore.ts for voice access)
const mockSchemes = [
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
    applicationLink:
      "https://www.india.gov.in/spotlight/senior-citizen-health-insurance-scheme",
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
    lastUpdated: "2023-09-01",
  },
];

// Helper function to find scheme by name (case-insensitive partial match)
function findSchemeByName(speechInput) {
  const input = speechInput.toLowerCase().trim();
  return mockSchemes.find(
    (scheme) =>
      scheme.title.toLowerCase().includes(input) ||
      input.includes(scheme.title.toLowerCase())
  );
}

// Helper function to format scheme details for voice
function formatSchemeDetails(scheme) {
  let details = `Scheme: ${scheme.title}. `;

  details += `Description: ${scheme.description}. `;

  // Eligibility
  details += "Eligibility criteria: ";
  if (scheme.eligibilityCriteria.age) {
    if (scheme.eligibilityCriteria.age.min) {
      details += `Minimum age ${scheme.eligibilityCriteria.age.min} years. `;
    }
    if (scheme.eligibilityCriteria.age.max) {
      details += `Maximum age ${scheme.eligibilityCriteria.age.max} years. `;
    }
  }
  if (
    scheme.eligibilityCriteria.income &&
    scheme.eligibilityCriteria.income.max
  ) {
    details += `Maximum income ₹${scheme.eligibilityCriteria.income.max}. `;
  }
  if (
    scheme.eligibilityCriteria.other &&
    scheme.eligibilityCriteria.other.length > 0
  ) {
    details += scheme.eligibilityCriteria.other.join(". ") + ". ";
  }

  // Benefits
  details += "Benefits: " + scheme.benefits.join(". ") + ". ";

  // Documents
  details +=
    "Required documents: " + scheme.requiredDocuments.join(", ") + ". ";

  // Application process
  details +=
    "Application process: " + scheme.applicationProcess.join(". ") + ". ";

  return details;
}

// Eligibility checker function
function eligibilityChecker(userData, schemes) {
  const eligibleSchemes = [];

  schemes.forEach((scheme) => {
    let isEligible = true;
    const criteria = scheme.eligibilityCriteria;

    // Check age
    if (userData.age && criteria.age) {
      if (criteria.age.min && userData.age < criteria.age.min) {
        isEligible = false;
      }
      if (criteria.age.max && userData.age > criteria.age.max) {
        isEligible = false;
      }
    }

    // Check gender
    if (userData.gender && criteria.gender && criteria.gender.length > 0) {
      if (!criteria.gender.includes(userData.gender)) {
        isEligible = false;
      }
    }

    // Check income
    if (userData.income && criteria.income && criteria.income.max) {
      if (userData.income > criteria.income.max) {
        isEligible = false;
      }
    }

    // Check category (occupation can be mapped to category)
    if (
      userData.occupation &&
      criteria.category &&
      criteria.category.length > 0
    ) {
      const occupationLower = userData.occupation.toLowerCase();
      const categoryMatch = criteria.category.some(
        (cat) =>
          occupationLower.includes(cat.toLowerCase()) ||
          cat.toLowerCase().includes(occupationLower)
      );
      if (!categoryMatch) {
        isEligible = false;
      }
    }

    // Check education (if provided in user data)
    if (
      userData.education &&
      criteria.education &&
      criteria.education.length > 0
    ) {
      if (!criteria.education.includes(userData.education)) {
        isEligible = false;
      }
    }

    // For schemes without strict criteria, consider them eligible if basic checks pass
    if (isEligible) {
      eligibleSchemes.push(scheme);
    }
  });

  return eligibleSchemes;
}

// Multi-language support
const languagePrompts = {
  english: {
    welcome:
      "Welcome to Government Scheme Eligibility Service. Press 1 for English, 2 for Hindi, 3 for Marathi.",
    age: "Please state your age.",
    gender: "Please state your gender. Say male or female.",
    income: "Please state your annual income in rupees.",
    occupation: "Please state your occupation.",
    city: "Please state your city.",
    processing: "Processing your eligibility. Please wait.",
    noSchemes:
      "Sorry, no schemes match your criteria. You can call back later.",
    resultsMessage: "You are eligible for {count} schemes: ",
    andMoreSchemes: "And {count} more schemes. ",
    smsSent: "An SMS with scheme details has been sent to your number.",
    error: "Sorry, there was an error. Please try again.",
    goodbye: "Thank you for using our service. Goodbye.",
  },
  hindi: {
    welcome:
      "सरकारी योजना पात्रता सेवा में आपका स्वागत है। अंग्रेजी के लिए 1, हिंदी के लिए 2, मराठी के लिए 3 दबाएं।",
    age: "कृपया अपनी उम्र बताएं।",
    gender: "कृपया अपना लिंग बताएं। पुरुष या महिला कहें।",
    income: "कृपया अपनी वार्षिक आय रुपये में बताएं।",
    occupation: "कृपया अपना व्यवसाय बताएं।",
    city: "कृपया अपना शहर बताएं।",
    processing: "आपकी पात्रता की जांच हो रही है। कृपया प्रतीक्षा करें।",
    noSchemes:
      "क्षमा करें, कोई योजना आपके मानदंडों से मेल नहीं खाती। आप बाद में कॉल कर सकते हैं।",
    resultsMessage: "आप {count} योजनाओं के लिए पात्र हैं: ",
    andMoreSchemes: "और {count} अन्य योजनाएं। ",
    smsSent: "योजना विवरण वाला एसएमएस आपके नंबर पर भेज दिया गया है।",
    error: "क्षमा करें, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।",
    goodbye: "हमारी सेवा का उपयोग करने के लिए धन्यवाद। अलविदा।",
  },
  marathi: {
    welcome:
      "सरकारी योजना पात्रता सेवेत आपले स्वागत आहे. इंग्रजीसाठी 1, हिंदीसाठी 2, मराठीसाठी 3 दाबा.",
    age: "कृपया आपली वय सांगा.",
    gender: "कृपया आपले लिंग सांगा. पुरुष किंवा स्त्री सांगा.",
    income: "कृपया आपली वार्षिक उत्पन्न रुपये मध्ये सांगा.",
    occupation: "कृपया आपला व्यवसाय सांगा.",
    city: "कृपया आपले शहर सांगा.",
    processing: "आपल्या पात्रतेची तपासणी सुरू आहे. कृपया थांबा.",
    noSchemes:
      "क्षमस्व, कोणतीही योजना आपल्या निकषांशी जुळत नाही. आपण नंतर कॉल करू शकता.",
    resultsMessage: "तुम्ही {count} योजनांसाठी पात्र आहात: ",
    andMoreSchemes: "आणि आणखी {count} योजना आहेत. ",
    smsSent: "योजना तपशील असलेला एसएमएस आपल्या नंबरवर पाठविला गेला आहे.",
    error: "क्षमस्व, त्रुटी झाली. कृपया पुन्हा प्रयत्न करा.",
    goodbye: "आमच्या सेवेचा वापर केल्याबद्दल धन्यवाद. अलविदा.",
  },
};

// Initial voice greeting for eligibility check
app.post("/voice", (req, res) => {
  console.log("Incoming request to /voice:");
  console.log("Request body:", req.body);

  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: "dtmf", // Changed to DTMF for language selection
    action: "/voice/start",
    method: "POST",
    numDigits: 1,
    timeout: 10,
  });

  // Generic welcome in English, followed by language options
  gather.say("Welcome to the Government Scheme Information Service.");
  gather.say("For English, press 1.");
  gather.say("हिंदी के लिए, 2 दबाएं."); // For Hindi, press 2
  gather.say("मराठी साठी, 3 दाबा."); // For Marathi, press 3

  // If the user doesn't input anything, redirect back to the welcome message
  twiml.redirect("/voice");

  res.type("text/xml");
  res.send(twiml.toString());
});

// Language selection and start eligibility check
app.post("/voice/start", (req, res) => {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const input = req.body.Digits; // Use DTMF input

  let language = "english"; // Default to English
  let language_confirmation = "You have selected English."
  if (input === "2") {
    language = "hindi";
    language_confirmation = "आपने हिंदी का चयन किया है।"
  } else if (input === "3") {
    language = "marathi";
    language_confirmation = "तुम्ही मराठी निवडले आहे."
  }

  // Initialize session
  const session = getUserSession(callSid);
  session.language = language;
  session.step = "age"; // Start the eligibility check

  const gather = twiml.gather({
    input: "speech",
    action: "/voice/collect-age",
    method: "POST",
    timeout: 15, // Give more time for speech
  });
  
  gather.say(language_confirmation);
  gather.say(languagePrompts[language].age);

  // If no input, retry
  twiml.redirect("/voice/start");

  res.type("text/xml");
  res.send(twiml.toString());
});

// Collect age
app.post("/voice/collect-age", (req, res) => {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const speechInput = req.body.SpeechResult || "";
  const session = getUserSession(callSid);

  // Use OpenAI to parse age from speech
  try {
    const age = parseInt(speechInput.replace(/\D/g, ""));
    if (age && age > 0 && age < 120) {
      session.data.age = age;
      session.step = "gender";

      const gather = twiml.gather({
        input: "speech",
        action: "/voice/collect-gender",
        method: "POST",
      });

      gather.say(languagePrompts[session.language].gender);
    } else {
      // Retry age collection
      const gather = twiml.gather({
        input: "speech",
        action: "/voice/collect-age",
        method: "POST",
      });

      gather.say(languagePrompts[session.language].age);
    }
  } catch (error) {
    console.error("Error parsing age:", error);
    const gather = twiml.gather({
      input: "speech",
      action: "/voice/collect-age",
      method: "POST",
    });

    gather.say(languagePrompts[session.language].age);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Collect gender
app.post("/voice/collect-gender", (req, res) => {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const speechInput = req.body.SpeechResult || "";
  const session = getUserSession(callSid);

  const input = speechInput.toLowerCase();
  let gender = null;

  if (
    input.includes("male") ||
    input.includes("पुरुष") ||
    input.includes("पुरुष")
  ) {
    gender = "male";
  } else if (
    input.includes("female") ||
    input.includes("महिला") ||
    input.includes("स्त्री")
  ) {
    gender = "female";
  }

  if (gender) {
    session.data.gender = gender;
    session.step = "income";

    const gather = twiml.gather({
      input: "speech",
      action: "/voice/collect-income",
      method: "POST",
    });

    gather.say(languagePrompts[session.language].income);
  } else {
    // Retry gender collection
    const gather = twiml.gather({
      input: "speech",
      action: "/voice/collect-gender",
      method: "POST",
    });

    gather.say(languagePrompts[session.language].gender);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Collect income
app.post("/voice/collect-income", (req, res) => {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const speechInput = req.body.SpeechResult || "";
  const session = getUserSession(callSid);

  // Parse income from speech
  try {
    const income = parseInt(speechInput.replace(/\D/g, ""));
    if (income && income >= 0) {
      session.data.income = income;
      session.step = "occupation";

      const gather = twiml.gather({
        input: "speech",
        action: "/voice/collect-occupation",
        method: "POST",
      });

      gather.say(languagePrompts[session.language].occupation);
    } else {
      // Retry income collection
      const gather = twiml.gather({
        input: "speech",
        action: "/voice/collect-income",
        method: "POST",
      });

      gather.say(languagePrompts[session.language].income);
    }
  } catch (error) {
    console.error("Error parsing income:", error);
    const gather = twiml.gather({
      input: "speech",
      action: "/voice/collect-income",
      method: "POST",
    });

    gather.say(languagePrompts[session.language].income);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Collect occupation
app.post("/voice/collect-occupation", (req, res) => {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const speechInput = req.body.SpeechResult || "";
  const session = getUserSession(callSid);

  if (speechInput.trim()) {
    session.data.occupation = speechInput.trim();
    session.step = "city";

    const gather = twiml.gather({
      input: "speech",
      action: "/voice/collect-city",
      method: "POST",
    });

    gather.say(languagePrompts[session.language].city);
  } else {
    // Retry occupation collection
    const gather = twiml.gather({
      input: "speech",
      action: "/voice/collect-occupation",
      method: "POST",
    });

    gather.say(languagePrompts[session.language].occupation);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Collect city
app.post("/voice/collect-city", (req, res) => {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const speechInput = req.body.SpeechResult || "";
  const session = getUserSession(callSid);

  if (speechInput.trim()) {
    session.data.city = speechInput.trim();
    session.step = "processing";

    // Start processing
    twiml.say(languagePrompts[session.language].processing);

    // Redirect to parse data
    twiml.redirect("/voice/parse-data");
  } else {
    // Retry city collection
    const gather = twiml.gather({
      input: "speech",
      action: "/voice/collect-city",
      method: "POST",
    });

    gather.say(languagePrompts[session.language].city);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Parse data and check eligibility
app.post("/voice/parse-data", async (req, res) => {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const session = getUserSession(callSid);

  try {
    // Check eligibility
    const eligibleSchemes = eligibilityChecker(session.data, cachedSchemes || mockSchemes);
    session.eligibleSchemes = eligibleSchemes;

    if (eligibleSchemes.length > 0) {
      // Send SMS with scheme details
      // Note: SMS sending logic would go here

      // Redirect to results
      twiml.redirect("/voice/result");
    } else {
      twiml.say(languagePrompts[session.language].noSchemes);
      twiml.say(languagePrompts[session.language].goodbye);
    }
  } catch (error) {
    console.error("Error in eligibility check:", error);
    twiml.say(languagePrompts[session.language].error);
    twiml.say(languagePrompts[session.language].goodbye);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Speak results and send SMS
app.post("/voice/result", (req, res) => {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const session = getUserSession(callSid);

  const eligibleSchemes = session.eligibleSchemes || [];

  if (eligibleSchemes.length > 0) {
    const prompts = languagePrompts[session.language];
    let message = prompts.resultsMessage.replace("{count}", eligibleSchemes.length);

    eligibleSchemes.slice(0, 3).forEach((scheme, index) => {
      message += `${index + 1}. ${scheme.title}. `;
    });

    if (eligibleSchemes.length > 3) {
      message += prompts.andMoreSchemes.replace("{count}", eligibleSchemes.length - 3);
    }

    twiml.say(message);
    twiml.say(prompts.smsSent);
  }

  twiml.say(languagePrompts[session.language].goodbye);

  // Clear session
  clearUserSession(callSid);

  res.type("text/xml");
  res.send(twiml.toString());
});

// Process scheme request
app.post("/process-scheme-request", (req, res) => {
  const speechInput = req.body.SpeechResult || "";
  const twiml = new VoiceResponse();

  const input = speechInput.toLowerCase().trim();

  if (input.includes("list") && input.includes("scheme")) {
    // List all schemes
    let message = "Here are the available government schemes: ";

    mockSchemes.forEach((scheme, index) => {
      message += `${index + 1}. ${scheme.title}. `;
    });

    message +=
      "Say the name of any scheme to get detailed information, or say 'main menu' to go back.";

    const gather = twiml.gather({
      input: "speech",
      action: "/process-scheme-request",
      method: "POST",
    });

    gather.say(message);
  } else if (input.includes("main") && input.includes("menu")) {
    // Go back to main menu
    const gather = twiml.gather({
      input: "speech",
      action: "/process-scheme-request",
      method: "POST",
    });

    gather.say(
      "Welcome back to the Government Scheme Information Service. " +
        "Say 'list schemes' to hear all available schemes, " +
        "or say the name of a specific scheme to get detailed information."
    );
  } else {
    // Try to find specific scheme
    const scheme = findSchemeByName(speechInput);

    if (scheme) {
      const details = formatSchemeDetails(scheme);

      const gather = twiml.gather({
        input: "speech",
        action: "/process-scheme-request",
        method: "POST",
      });

      gather.say(
        details + " Say 'main menu' to go back, or ask about another scheme."
      );
    } else {
      // Scheme not found
      const gather = twiml.gather({
        input: "speech",
        action: "/process-scheme-request",
        method: "POST",
      });

      gather.say(
        "Sorry, I couldn't find that scheme. " +
          "Say 'list schemes' to hear all available schemes, " +
          "or try saying a different scheme name."
      );
    }
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// --- New API endpoint for Click-to-Call ---
app.post("/api/make-call", async (req, res) => {
      console.log("Received request for /api/make-call");
      try {
        const host = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
        const voiceUrl = `${host}/voice`;
    console.log(`Attempting to call agent at: ${agentPhoneNumber}`);
    console.log(`Using Twilio number: ${twilioPhoneNumber}`);
    console.log(`Using TwiML URL: ${voiceUrl}`);

    // Initiate a call from your Twilio number to your agent's number
    const call = await client.calls.create({
      url: voiceUrl,
      to: agentPhoneNumber,
      from: twilioPhoneNumber,
    });

    console.log(`Call to agent initiated with SID: ${call.sid}`);
    res
      .status(200)
      .send({ message: "Call initiated successfully!", sid: call.sid });
  } catch (error) {
    console.error("Error initiating call:", error);
    res.status(error.status || 500).send({
      message: "Failed to initiate call. Please check server logs for details.",
      error: {
        message: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
      },
    });
  }
});

// --- NEW Outbound Call API: Call the USER directly from the website ---
app.post("/api/user-call", async (req, res) => {
  console.log("Received request for /api/user-call");
  const { userPhone } = req.body;

  if (!userPhone) {
    return res.status(400).json({
      success: false,
      message: "userPhone is required in request body",
    });
  }

  try {
    const host = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const voiceUrl = `${host}/voice`;

    console.log(`Attempting to call user at: ${userPhone}`);
    console.log(`Using Twilio number: ${twilioPhoneNumber}`);
    console.log(`Using TwiML URL: ${voiceUrl}`);

    const call = await client.calls.create({
      url: voiceUrl, // Use the dynamically generated URL
      to: userPhone, // User's phone who clicked CALL button
      from: twilioPhoneNumber,
    });

    console.log(`User call initiated successfully: SID: ${call.sid}`);
    res.status(200).json({ success: true, sid: call.sid });
  } catch (error) {
    console.error("Error initiating user call:", error);
    res.status(error.status || 500).json({
      success: false,
      message: "Call Failed to initialize. Please check server logs for details.",
      error: {
        message: error.message,
        code: error.code,
        moreInfo: error.moreInfo,
      },
    });
  }
});

// --- Web Scraping for Government Schemes ---

// Real web scraping function to fetch government schemes from official sources
async function scrapeGovernmentSchemes() {
  const schemes = [];

  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Scrape from india.gov.in schemes page
    try {
      console.log("Scraping from india.gov.in...");
      await page.goto("https://www.india.gov.in/spotlight/schemes-programmes", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract schemes from the page - try multiple selectors
      console.log("Looking for scheme elements...");
      const selectors = [
        'a[href*="/schemes"]',
        'a[href*="/programme"]',
        ".views-row",
        ".node",
        "article",
        ".item",
        ".card",
        ".scheme-item",
        ".scheme",
        ".programme",
        "h2",
        "h3",
        ".title",
      ];

      selectors.forEach((selector) => {
        $(selector).each((index, element) => {
          const title =
            $(element)
              .find("h1, h2, h3, h4, h5, h6, .title, .scheme-title, strong, b")
              .first()
              .text()
              .trim() ||
            $(element).text().trim().split("\n")[0].trim() ||
            $(element).attr("title") ||
            $(element).attr("alt");

          const description =
            $(element)
              .find("p, .description, .summary, .content, .excerpt")
              .first()
              .text()
              .trim() ||
            $(element).text().trim().split("\n").slice(1, 4).join(" ").trim();

          const link =
            $(element).attr("href") ||
            $(element).find("a").attr("href") ||
            $(element).closest("a").attr("href");

          if (
            title &&
            title.length > 3 &&
            title.length < 200 &&
            !schemes.find((s) => s.title.toLowerCase() === title.toLowerCase())
          ) {
            console.log(`Found scheme: ${title}`);
            schemes.push({
              id: `india-gov-${schemes.length + 1}`,
              title: title,
              category: "general", // Will be categorized based on content
              ministry: "Various Ministries",
              description: description || "Check official website for details",
              eligibilityCriteria: {
                other: ["Check official website for eligibility"],
              },
              benefits: ["Various benefits based on scheme"],
              requiredDocuments: ["Check official website"],
              applicationProcess: ["Visit official website for details"],
              applicationLink: link
                ? link.startsWith("http")
                  ? link
                  : `https://www.india.gov.in${link}`
                : "https://www.india.gov.in",
              imageUrl:
                "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              lastUpdated: new Date().toISOString().split("T")[0],
            });
          }
        });
      });

      // Scrape from additional india.gov.in pages
      const additionalPages = [
        "https://www.india.gov.in/topics/social-development",
        "https://www.india.gov.in/topics/economy",
        "https://www.india.gov.in/topics/agriculture",
        "https://www.india.gov.in/topics/health-family-welfare",
        "https://www.india.gov.in/topics/education",
        "https://www.india.gov.in/topics/financial-services",
        "https://www.india.gov.in/topics/housing",
        "https://www.india.gov.in/topics/rural-development",
      ];

      for (const pageUrl of additionalPages) {
        try {
          await page.goto(pageUrl, {
            waitUntil: "networkidle2",
            timeout: 20000,
          });
          const content = await page.content();
          const $ = cheerio.load(content);

          const additionalSelectors = [
            'a[href*="/schemes"]',
            'a[href*="/programme"]',
            ".views-row",
            ".item",
            ".card",
            "article",
            ".scheme",
            ".programme",
            "h2",
            "h3",
            ".title",
          ];

          additionalSelectors.forEach((selector) => {
            $(selector).each((index, element) => {
              const title =
                $(element)
                  .find(
                    "h1, h2, h3, h4, h5, h6, .title, .scheme-title, strong, b"
                  )
                  .first()
                  .text()
                  .trim() ||
                $(element).text().trim().split("\n")[0].trim() ||
                $(element).attr("title") ||
                $(element).attr("alt");

              const description =
                $(element)
                  .find("p, .description, .summary, .content, .excerpt")
                  .first()
                  .text()
                  .trim() ||
                $(element)
                  .text()
                  .trim()
                  .split("\n")
                  .slice(1, 3)
                  .join(" ")
                  .trim();

              const link =
                $(element).attr("href") ||
                $(element).find("a").attr("href") ||
                $(element).closest("a").attr("href");

              if (
                title &&
                title.length > 3 &&
                title.length < 200 &&
                !schemes.find(
                  (s) => s.title.toLowerCase() === title.toLowerCase()
                )
              ) {
                console.log(`Found additional scheme: ${title}`);
                schemes.push({
                  id: `india-additional-${schemes.length + 1}`,
                  title: title,
                  category: "general",
                  ministry: "Various Ministries",
                  description:
                    description || "Check official website for details",
                  eligibilityCriteria: {
                    other: ["Check official website for eligibility"],
                  },
                  benefits: ["Various benefits based on scheme"],
                  requiredDocuments: ["Check official website"],
                  applicationProcess: ["Visit official website for details"],
                  applicationLink: link
                    ? link.startsWith("http")
                      ? link
                      : `https://www.india.gov.in${link}`
                    : "https://www.india.gov.in",
                  imageUrl:
                    "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
                  lastUpdated: new Date().toISOString().split("T")[0],
                });
              }
            });
          });
        } catch (pageError) {
          console.log(`Error scraping ${pageUrl}:`, pageError.message);
        }
      }
    } catch (error) {
      console.log("Error scraping india.gov.in:", error.message);
    }

    // Scrape from pmindia.gov.in
    try {
      console.log("Scraping from pmindia.gov.in...");
      await page.goto("https://www.pmindia.gov.in/en/major_initiatives/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      $(".initiative-item, .scheme-item, .card").each((index, element) => {
        const title = $(element).find("h3, .title").text().trim();
        const description = $(element).find("p, .description").text().trim();
        const link = $(element).find("a").attr("href");

        if (title && description && !schemes.find((s) => s.title === title)) {
          schemes.push({
            id: `pm-india-${schemes.length + 1}`,
            title: title,
            category: "general",
            ministry: "Prime Minister's Office",
            description: description,
            eligibilityCriteria: {
              other: ["Check official website for eligibility"],
            },
            benefits: ["Various benefits based on scheme"],
            requiredDocuments: ["Check official website"],
            applicationProcess: ["Visit official website for details"],
            applicationLink: link
              ? link.startsWith("http")
                ? link
                : `https://www.pmindia.gov.in${link}`
              : "https://www.pmindia.gov.in",
            imageUrl:
              "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            lastUpdated: new Date().toISOString().split("T")[0],
          });
        }
      });
    } catch (error) {
      console.log("Error scraping pmindia.gov.in:", error.message);
    }

    // Scrape from mygov.in schemes
    try {
      console.log("Scraping from mygov.in...");
      await page.goto("https://www.mygov.in/schemes/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      $(".scheme-card, .card, .scheme-item").each((index, element) => {
        const title = $(element)
          .find("h3, .title, .scheme-title")
          .text()
          .trim();
        const description = $(element)
          .find("p, .description, .summary")
          .text()
          .trim();
        const link = $(element).find("a").attr("href");

        if (title && description && !schemes.find((s) => s.title === title)) {
          schemes.push({
            id: `mygov-${schemes.length + 1}`,
            title: title,
            category: "general",
            ministry: "Various Ministries",
            description: description,
            eligibilityCriteria: {
              other: ["Check official website for eligibility"],
            },
            benefits: ["Various benefits based on scheme"],
            requiredDocuments: ["Check official website"],
            applicationProcess: ["Visit official website for details"],
            applicationLink: link
              ? link.startsWith("http")
                ? link
                : `https://www.mygov.in${link}`
              : "https://www.mygov.in",
            imageUrl:
              "https://images.pexels.com/photos/4021779/pexels-photo-4021779.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            lastUpdated: new Date().toISOString().split("T")[0],
          });
        }
      });
    } catch (error) {
      console.log("Error scraping mygov.in:", error.message);
    }

    // Scrape from Ministry of Health and Family Welfare
    try {
      console.log("Scraping from mohfw.gov.in...");
      await page.goto("https://www.mohfw.gov.in/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for scheme-related links and content
      $('a[href*="scheme"], a[href*="programme"], a[href*="yojana"]').each(
        (index, element) => {
          const title = $(element).text().trim();
          const link = $(element).attr("href");

          if (
            title &&
            title.length > 5 &&
            !schemes.find((s) => s.title === title)
          ) {
            schemes.push({
              id: `mohfw-${schemes.length + 1}`,
              title: title,
              category: "health",
              ministry: "Ministry of Health and Family Welfare",
              description:
                "Health-related government scheme. Check official website for details.",
              eligibilityCriteria: {
                other: ["Check official website for eligibility"],
              },
              benefits: ["Health benefits and services"],
              requiredDocuments: ["Check official website"],
              applicationProcess: ["Visit official website for details"],
              applicationLink: link
                ? link.startsWith("http")
                  ? link
                  : `https://www.mohfw.gov.in${link}`
                : "https://www.mohfw.gov.in",
              imageUrl:
                "https://images.pexels.com/photos/4021779/pexels-photo-4021779.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              lastUpdated: new Date().toISOString().split("T")[0],
            });
          }
        }
      );
    } catch (error) {
      console.log("Error scraping mohfw.gov.in:", error.message);
    }

    // Scrape from Ministry of Education
    try {
      console.log("Scraping from education.gov.in...");
      await page.goto("https://www.education.gov.in/en", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for scholarship and education scheme links
      $('a[href*="scholarship"], a[href*="education"], a[href*="scheme"]').each(
        (index, element) => {
          const title = $(element).text().trim();
          const link = $(element).attr("href");

          if (
            title &&
            title.length > 5 &&
            !schemes.find((s) => s.title === title)
          ) {
            schemes.push({
              id: `education-${schemes.length + 1}`,
              title: title,
              category: "students",
              ministry: "Ministry of Education",
              description:
                "Education and scholarship scheme. Check official website for details.",
              eligibilityCriteria: {
                other: ["Check official website for eligibility"],
              },
              benefits: ["Educational benefits and scholarships"],
              requiredDocuments: ["Check official website"],
              applicationProcess: ["Visit official website for details"],
              applicationLink: link
                ? link.startsWith("http")
                  ? link
                  : `https://www.education.gov.in${link}`
                : "https://www.education.gov.in",
              imageUrl:
                "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              lastUpdated: new Date().toISOString().split("T")[0],
            });
          }
        }
      );
    } catch (error) {
      console.log("Error scraping education.gov.in:", error.message);
    }

    // Scrape from Ministry of Agriculture
    try {
      console.log("Scraping from agricoop.nic.in...");
      await page.goto("https://agricoop.nic.in/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for agriculture scheme links
      $('a[href*="scheme"], a[href*="programme"], a[href*="kisan"]').each(
        (index, element) => {
          const title = $(element).text().trim();
          const link = $(element).attr("href");

          if (
            title &&
            title.length > 5 &&
            !schemes.find((s) => s.title === title)
          ) {
            schemes.push({
              id: `agriculture-${schemes.length + 1}`,
              title: title,
              category: "farmers",
              ministry: "Ministry of Agriculture & Farmers Welfare",
              description:
                "Agriculture and farmer welfare scheme. Check official website for details.",
              eligibilityCriteria: {
                other: ["Check official website for eligibility"],
              },
              benefits: ["Agricultural benefits and support"],
              requiredDocuments: ["Check official website"],
              applicationProcess: ["Visit official website for details"],
              applicationLink: link
                ? link.startsWith("http")
                  ? link
                  : `https://agricoop.nic.in${link}`
                : "https://agricoop.nic.in",
              imageUrl:
                "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              lastUpdated: new Date().toISOString().split("T")[0],
            });
          }
        }
      );
    } catch (error) {
      console.log("Error scraping agricoop.nic.in:", error.message);
    }

    // Scrape from MSME website
    try {
      console.log("Scraping from msme.gov.in...");
      await page.goto("https://www.msme.gov.in/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for MSME scheme links
      $('a[href*="scheme"], a[href*="programme"], a[href*="loan"]').each(
        (index, element) => {
          const title = $(element).text().trim();
          const link = $(element).attr("href");

          if (
            title &&
            title.length > 5 &&
            !schemes.find((s) => s.title === title)
          ) {
            schemes.push({
              id: `msme-${schemes.length + 1}`,
              title: title,
              category: "financial",
              ministry: "Ministry of Micro, Small and Medium Enterprises",
              description:
                "MSME and entrepreneurship scheme. Check official website for details.",
              eligibilityCriteria: {
                other: ["Check official website for eligibility"],
              },
              benefits: ["Financial and business support"],
              requiredDocuments: ["Check official website"],
              applicationProcess: ["Visit official website for details"],
              applicationLink: link
                ? link.startsWith("http")
                  ? link
                  : `https://www.msme.gov.in${link}`
                : "https://www.msme.gov.in",
              imageUrl:
                "https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              lastUpdated: new Date().toISOString().split("T")[0],
            });
          }
        }
      );
    } catch (error) {
      console.log("Error scraping msme.gov.in:", error.message);
    }

    // Scrape from DBT Bharat
    try {
      console.log("Scraping from dbtbharat.gov.in...");
      await page.goto("https://dbtbharat.gov.in/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for DBT scheme information
      $('a[href*="scheme"], a[href*="programme"], .scheme-item').each(
        (index, element) => {
          const title =
            $(element).text().trim() ||
            $(element).find("h3, .title").text().trim();
          const link = $(element).attr("href");

          if (
            title &&
            title.length > 5 &&
            !schemes.find((s) => s.title === title)
          ) {
            schemes.push({
              id: `dbt-${schemes.length + 1}`,
              title: title,
              category: "general",
              ministry: "Ministry of Finance",
              description:
                "Direct Benefit Transfer scheme. Check official website for details.",
              eligibilityCriteria: {
                other: ["Check official website for eligibility"],
              },
              benefits: ["Direct benefit transfers"],
              requiredDocuments: ["Check official website"],
              applicationProcess: ["Visit official website for details"],
              applicationLink: link
                ? link.startsWith("http")
                  ? link
                  : `https://dbtbharat.gov.in${link}`
                : "https://dbtbharat.gov.in",
              imageUrl:
                "https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              lastUpdated: new Date().toISOString().split("T")[0],
            });
          }
        }
      );
    } catch (error) {
      console.log("Error scraping dbtbharat.gov.in:", error.message);
    }

    // Scrape from Ministry of Rural Development
    try {
      console.log("Scraping from rural.nic.in...");
      await page.goto("https://rural.nic.in/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for rural development scheme links
      $('a[href*="scheme"], a[href*="programme"], a[href*="mission"]').each(
        (index, element) => {
          const title = $(element).text().trim();
          const link = $(element).attr("href");

          if (
            title &&
            title.length > 5 &&
            !schemes.find((s) => s.title === title)
          ) {
            schemes.push({
              id: `rural-${schemes.length + 1}`,
              title: title,
              category: "general",
              ministry: "Ministry of Rural Development",
              description:
                "Rural development and poverty alleviation scheme. Check official website for details.",
              eligibilityCriteria: {
                other: ["Check official website for eligibility"],
              },
              benefits: ["Rural development benefits"],
              requiredDocuments: ["Check official website"],
              applicationProcess: ["Visit official website for details"],
              applicationLink: link
                ? link.startsWith("http")
                  ? link
                  : `https://rural.nic.in${link}`
                : "https://rural.nic.in",
              imageUrl:
                "https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              lastUpdated: new Date().toISOString().split("T")[0],
            });
          }
        }
      );
    } catch (error) {
      console.log("Error scraping rural.nic.in:", error.message);
    }

    // Scrape from Ministry of Women and Child Development
    try {
      console.log("Scraping from wcd.nic.in...");
      await page.goto("https://wcd.nic.in/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for women and child development scheme links
      $(
        'a[href*="scheme"], a[href*="programme"], a[href*="woman"], a[href*="child"]'
      ).each((index, element) => {
        const title = $(element).text().trim();
        const link = $(element).attr("href");

        if (
          title &&
          title.length > 5 &&
          !schemes.find((s) => s.title === title)
        ) {
          schemes.push({
            id: `wcd-${schemes.length + 1}`,
            title: title,
            category: "women",
            ministry: "Ministry of Women and Child Development",
            description:
              "Women and child development scheme. Check official website for details.",
            eligibilityCriteria: {
              other: ["Check official website for eligibility"],
            },
            benefits: ["Women and child welfare benefits"],
            requiredDocuments: ["Check official website"],
            applicationProcess: ["Visit official website for details"],
            applicationLink: link
              ? link.startsWith("http")
                ? link
                : `https://wcd.nic.in${link}`
              : "https://wcd.nic.in",
            imageUrl:
              "https://images.pexels.com/photos/7107213/pexels-photo-7107213.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            lastUpdated: new Date().toISOString().split("T")[0],
          });
        }
      });
    } catch (error) {
      console.log("Error scraping wcd.nic.in:", error.message);
    }

    // Scrape from Ministry of Labour and Employment
    try {
      console.log("Scraping from labour.gov.in...");
      await page.goto("https://labour.gov.in/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for labour and employment scheme links
      $(
        'a[href*="scheme"], a[href*="programme"], a[href*="welfare"], a[href*="insurance"]'
      ).each((index, element) => {
        const title = $(element).text().trim();
        const link = $(element).attr("href");

        if (
          title &&
          title.length > 5 &&
          !schemes.find((s) => s.title === title)
        ) {
          schemes.push({
            id: `labour-${schemes.length + 1}`,
            title: title,
            category: "financial",
            ministry: "Ministry of Labour and Employment",
            description:
              "Labour welfare and employment scheme. Check official website for details.",
            eligibilityCriteria: {
              other: ["Check official website for eligibility"],
            },
            benefits: ["Labour welfare and employment benefits"],
            requiredDocuments: ["Check official website"],
            applicationProcess: ["Visit official website for details"],
            applicationLink: link
              ? link.startsWith("http")
                ? link
                : `https://labour.gov.in${link}`
              : "https://labour.gov.in",
            imageUrl:
              "https://images.pexels.com/photos/3184430/pexels-photo-3184430.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            lastUpdated: new Date().toISOString().split("T")[0],
          });
        }
      });
    } catch (error) {
      console.log("Error scraping labour.gov.in:", error.message);
    }

    // Scrape from Ministry of Skill Development and Entrepreneurship
    try {
      console.log("Scraping from msde.gov.in...");
      await page.goto("https://www.msde.gov.in/", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for skill development scheme links
      $(
        'a[href*="scheme"], a[href*="programme"], a[href*="skill"], a[href*="training"]'
      ).each((index, element) => {
        const title = $(element).text().trim();
        const link = $(element).attr("href");

        if (
          title &&
          title.length > 5 &&
          !schemes.find((s) => s.title === title)
        ) {
          schemes.push({
            id: `msde-${schemes.length + 1}`,
            title: title,
            category: "students",
            ministry: "Ministry of Skill Development and Entrepreneurship",
            description:
              "Skill development and entrepreneurship scheme. Check official website for details.",
            eligibilityCriteria: {
              other: ["Check official website for eligibility"],
            },
            benefits: ["Skill training and entrepreneurship support"],
            requiredDocuments: ["Check official website"],
            applicationProcess: ["Visit official website for details"],
            applicationLink: link
              ? link.startsWith("http")
                ? link
                : `https://www.msde.gov.in${link}`
              : "https://www.msde.gov.in",
            imageUrl:
              "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            lastUpdated: new Date().toISOString().split("T")[0],
          });
        }
      });
    } catch (error) {
      console.log("Error scraping msde.gov.in:", error.message);
    }

    // Categorize schemes based on keywords
    schemes.forEach((scheme) => {
      const title = scheme.title.toLowerCase();
      const desc = scheme.description.toLowerCase();

      if (
        title.includes("student") ||
        title.includes("education") ||
        title.includes("scholarship")
      ) {
        scheme.category = "students";
        scheme.ministry = "Ministry of Education";
      } else if (
        title.includes("farmer") ||
        title.includes("agriculture") ||
        title.includes("kisan")
      ) {
        scheme.category = "farmers";
        scheme.ministry = "Ministry of Agriculture & Farmers Welfare";
      } else if (
        title.includes("women") ||
        title.includes("girl") ||
        title.includes("lady")
      ) {
        scheme.category = "women";
        scheme.ministry = "Ministry of Women & Child Development";
      } else if (
        title.includes("health") ||
        title.includes("medical") ||
        title.includes("ayushman")
      ) {
        scheme.category = "health";
        scheme.ministry = "Ministry of Health and Family Welfare";
      } else if (
        title.includes("house") ||
        title.includes("housing") ||
        title.includes("awas")
      ) {
        scheme.category = "housing";
        scheme.ministry = "Ministry of Housing and Urban Affairs";
      } else if (
        title.includes("financial") ||
        title.includes("bank") ||
        title.includes("loan") ||
        title.includes("mudra") ||
        title.includes("jan dhan")
      ) {
        scheme.category = "financial";
        scheme.ministry = "Ministry of Finance";
      } else if (
        title.includes("senior") ||
        title.includes("old age") ||
        title.includes("pension")
      ) {
        scheme.category = "senior-citizens";
        scheme.ministry = "Ministry of Social Justice and Empowerment";
      }
    });

    await browser.close();

    // If no schemes were scraped, return some fallback schemes
    if (schemes.length === 0) {
      console.log("No schemes scraped, using fallback data");
      return [
        {
          id: "fallback-1",
          title: "Digital India Mission",
          category: "general",
          ministry: "Ministry of Electronics and Information Technology",
          description:
            "Transforming India into a digitally empowered society and knowledge economy.",
          eligibilityCriteria: {
            other: ["All Indian citizens can participate"],
          },
          benefits: [
            "Digital literacy programs",
            "Online services access",
            "Digital infrastructure development",
          ],
          requiredDocuments: ["Aadhaar Card", "Mobile number"],
          applicationProcess: [
            "Register on digital platforms",
            "Access online services",
          ],
          applicationLink: "https://digitalindia.gov.in",
          imageUrl:
            "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          lastUpdated: new Date().toISOString().split("T")[0],
        },
        {
          id: "fallback-2",
          title: "Swachh Bharat Mission",
          category: "general",
          ministry: "Ministry of Jal Shakti",
          description:
            "Clean India Mission aims to achieve universal sanitation coverage and make India open defecation free.",
          eligibilityCriteria: {
            other: ["All citizens and organizations"],
          },
          benefits: [
            "Clean environment",
            "Health improvements",
            "Community participation incentives",
          ],
          requiredDocuments: ["Local authority approval"],
          applicationProcess: [
            "Contact local municipal corporation",
            "Participate in community programs",
          ],
          applicationLink: "https://swachhbharatmission.gov.in",
          imageUrl:
            "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          lastUpdated: new Date().toISOString().split("T")[0],
        },
      ];
    }

    console.log(`Successfully scraped ${schemes.length} schemes`);
    return schemes;
  } catch (error) {
    console.error("Error in scraping function:", error);
    // Return fallback data on error
    return [
      {
        id: "error-fallback-1",
        title: "Digital India Mission",
        category: "general",
        ministry: "Ministry of Electronics and Information Technology",
        description:
          "Transforming India into a digitally empowered society and knowledge economy.",
        eligibilityCriteria: {
          other: ["All Indian citizens can participate"],
        },
        benefits: [
          "Digital literacy programs",
          "Online services access",
          "Digital infrastructure development",
        ],
        requiredDocuments: ["Aadhaar Card", "Mobile number"],
        applicationProcess: [
          "Register on digital platforms",
          "Access online services",
        ],
        applicationLink: "https://digitalindia.gov.in",
        imageUrl:
          "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        lastUpdated: new Date().toISOString().split("T")[0],
      },
      {
        id: "error-fallback-2",
        title: "Swachh Bharat Mission",
        category: "general",
        ministry: "Ministry of Jal Shakti",
        description:
          "Clean India Mission aims to achieve universal sanitation coverage and make India open defecation free.",
        eligibilityCriteria: {
          other: ["All citizens and organizations"],
        },
        benefits: [
          "Clean environment",
          "Health improvements",
          "Community participation incentives",
        ],
        requiredDocuments: ["Local authority approval"],
        applicationProcess: [
          "Contact local municipal corporation",
          "Participate in community programs",
        ],
        applicationLink: "https://swachhbharatmission.gov.in",
        imageUrl:
          "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        lastUpdated: new Date().toISOString().split("T")[0],
      },
    ];
  }
}

// API endpoint to get scraped schemes
app.get("/api/scrape-schemes", async (req, res) => {
  try {
    // Check cache and timestamp
    if (cachedSchemes && Date.now() - lastScrapeTimestamp < CACHE_TTL) {
      console.log("Returning cached schemes data");
      return res.status(200).json({
        success: true,
        data: cachedSchemes,
        count: cachedSchemes.length,
        cached: true,
      });
    }
    // Cache expired, scrape fresh schemes
    console.log("Cache expired or empty, scraping fresh schemes...");
    const schemes = await scrapeGovernmentSchemes();
    cachedSchemes = schemes;
    lastScrapeTimestamp = Date.now();

    res.status(200).json({
      success: true,
      data: schemes,
      count: schemes.length,
      cached: false,
    });
  } catch (error) {
    console.error("Error in scrape-schemes endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Failed to scrape schemes",
      message: error.message,
    });
  }
});

// Add a root route for basic testing in a browser
app.get("/", (req, res) => {
  res.type("text/plain");
  res.send("Government Scheme Eligibility Service is running.");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Log the URL that should be used for the Twilio webhook
  console.log(`Twilio webhook URL should be: http://<your-ngrok-url>/voice`);
});

// --- Admin endpoint to force refresh cache ---
app.post("/api/refresh-scrape-cache", async (req, res) => {
  const adminApiKey = req.headers["x-admin-api-key"];
  if (adminApiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing admin API key.",
    });
  }

  try {
    await updateSchemeCache();
    res.status(200).json({ success: true, message: "Scheme cache refreshed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
