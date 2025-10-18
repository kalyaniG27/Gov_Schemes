export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  location: string;
  category: string;
  income: number;
  education: string;
  employmentStatus: string;
  aadhaarNumber: string;
  savedSchemes: string[];
  applications: Application[];
}

export interface Scheme {
  id: string;
  title: string;
  category: SchemeCategory;
  ministry: string;
  description: string;
  eligibilityCriteria: EligibilityCriteria;
  benefits: string[];
  requiredDocuments: string[];
  applicationProcess: string[];
  applicationLink: string;
  imageUrl: string;
  lastUpdated: string;
}

export interface Application {
  id: string;
  schemeId: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';
  submissionDate: string;
  documents: Document[];
  notes: string;
}

export interface Document {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
  verified: boolean;
}

export interface EligibilityCriteria {
  age?: {
    min?: number;
    max?: number;
  };
  gender?: string[];
  category?: string[];
  income?: {
    max?: number;
  };
  education?: string[];
  location?: string[];
  employmentStatus?: string[];
  other?: string[];
}

export type SchemeCategory = 
  | 'students' 
  | 'farmers' 
  | 'women' 
  | 'senior-citizens' 
  | 'general'
  | 'health'
  | 'housing'
  | 'financial';

export type Language = 'en' | 'hi' | 'ta' | 'bn' | 'mr';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}