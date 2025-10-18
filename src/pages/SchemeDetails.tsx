import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookmarkPlus,
  BookmarkCheck,
  Share2,
  Download,
  CheckCircle,
  XCircle,
  ExternalLink,
  FileText,
  ShieldCheck,
  Clock,
  User,
  Landmark,
  Calendar,
  Award,
} from 'lucide-react';

import useSchemeStore from '../store/useSchemeStore';
import useUserStore from '../store/useUserStore';
import { checkEligibility } from '../utils/eligibilityChecker';

const SchemeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSchemeById, selectedScheme } = useSchemeStore();
  const { user, saveScheme, removeSavedScheme } = useUserStore();
  
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    reasons: string[];
  } | null>(null);
  
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    if (id) {
      getSchemeById(id);
    }
  }, [id, getSchemeById]);
  
  useEffect(() => {
    if (user && selectedScheme) {
      // Check if scheme is saved
      setIsSaved(user.savedSchemes.includes(selectedScheme.id));
      
      // Check eligibility
      const result = checkEligibility(user, selectedScheme);
      setEligibilityResult(result);
    }
  }, [user, selectedScheme]);
  
  const handleSaveToggle = () => {
    if (!selectedScheme) return;
    
    if (isSaved) {
      removeSavedScheme(selectedScheme.id);
    } else {
      saveScheme(selectedScheme.id);
    }
    
    setIsSaved(!isSaved);
  };
  
  const handleShare = () => {
    if (navigator.share && selectedScheme) {
      navigator.share({
        title: selectedScheme.title,
        text: `Check out this government scheme: ${selectedScheme.title}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(() => {
          alert('Failed to copy link to clipboard');
        });
    }
  };
  
  // Placeholder for PDF download function
  const handleDownloadPDF = () => {
    alert('PDF download functionality would be implemented here');
  };
  
  if (!selectedScheme) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      students: 'bg-blue-100 text-blue-800',
      farmers: 'bg-green-100 text-green-800',
      women: 'bg-purple-100 text-purple-800',
      'senior-citizens': 'bg-amber-100 text-amber-800',
      health: 'bg-red-100 text-red-800',
      housing: 'bg-indigo-100 text-indigo-800',
      financial: 'bg-emerald-100 text-emerald-800',
      general: 'bg-gray-100 text-gray-800',
    };
    
    return colors[category] || colors.general;
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor(selectedScheme.category)}`}>
                {selectedScheme.category.charAt(0).toUpperCase() + selectedScheme.category.slice(1).replace('-', ' ')}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{selectedScheme.title}</h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center text-sm gap-x-4 gap-y-2 mb-2">
            <div className="flex items-center">
              <Landmark size={16} className="mr-1" />
              <span>{selectedScheme.ministry}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              <span>Last updated: {new Date(selectedScheme.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Scheme Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">About This Scheme</h2>
              <p className="text-gray-700 mb-6">{selectedScheme.description}</p>
              
              {/* Benefits */}
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Award size={20} className="mr-2 text-primary" />
                Benefits
              </h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                {selectedScheme.benefits.map((benefit, index) => (
                  <li key={index} className="text-gray-700">{benefit}</li>
                ))}
              </ul>
              
              {/* Application Process */}
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FileText size={20} className="mr-2 text-primary" />
                Application Process
              </h3>
              <ol className="list-decimal pl-6 mb-6 space-y-3">
                {selectedScheme.applicationProcess.map((step, index) => (
                  <li key={index} className="text-gray-700">{step}</li>
                ))}
              </ol>
              
              {/* Required Documents */}
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <ShieldCheck size={20} className="mr-2 text-primary" />
                Required Documents
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                {selectedScheme.requiredDocuments.map((doc, index) => (
                  <li key={index} className="text-gray-700">{doc}</li>
                ))}
              </ul>
            </div>
            
            {/* Application Button */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-semibold mb-1">Ready to Apply?</h3>
                  <p className="text-gray-600 text-sm">
                    Apply directly on the official government portal
                  </p>
                </div>
                <a
                  href={selectedScheme.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex items-center"
                >
                  Apply Now
                  <ExternalLink size={16} className="ml-2" />
                </a>
              </div>
            </div>
          </motion.div>
          
          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col space-y-3">
                {user ? (
                  <button
                    onClick={handleSaveToggle}
                    className={`btn w-full flex items-center justify-center ${
                      isSaved ? 'btn-outline text-primary' : 'btn-outline'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck size={18} className="mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <BookmarkPlus size={18} className="mr-2" />
                        Save Scheme
                      </>
                    )}
                  </button>
                ) : (
                  <Link to="/dashboard" className="btn btn-outline w-full flex items-center justify-center">
                    <User size={18} className="mr-2" />
                    Login to Save
                  </Link>
                )}
                
                <button
                  onClick={handleShare}
                  className="btn btn-outline w-full flex items-center justify-center"
                >
                  <Share2 size={18} className="mr-2" />
                  Share Scheme
                </button>
                
                <button
                  onClick={handleDownloadPDF}
                  className="btn btn-outline w-full flex items-center justify-center"
                >
                  <Download size={18} className="mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
            
            {/* Eligibility Status */}
            {user && eligibilityResult && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Your Eligibility</h3>
                
                <div className={`p-4 rounded-lg ${
                  eligibilityResult.eligible ? 'bg-green-50' : 'bg-red-50'
                } mb-4`}>
                  <div className="flex items-center">
                    {eligibilityResult.eligible ? (
                      <>
                        <CheckCircle size={24} className="text-green-500 mr-3" />
                        <div>
                          <h4 className="font-medium text-green-800">You are eligible!</h4>
                          <p className="text-sm text-green-600">
                            You meet all the requirements for this scheme.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle size={24} className="text-red-500 mr-3" />
                        <div>
                          <h4 className="font-medium text-red-800">Not eligible</h4>
                          <p className="text-sm text-red-600">
                            You don't meet some requirements for this scheme.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {!eligibilityResult.eligible && eligibilityResult.reasons.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Reasons:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {eligibilityResult.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-700">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {eligibilityResult.eligible && (
                  <div className="mt-4">
                    <Link
                      to="/eligibility"
                      className="btn btn-primary w-full"
                    >
                      Start Application
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Eligibility Criteria */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock size={20} className="mr-2 text-primary" />
                Eligibility Criteria
              </h3>
              
              <div className="space-y-4">
                {selectedScheme.eligibilityCriteria.age && (
                  <div>
                    <h4 className="font-medium mb-1">Age Requirement</h4>
                    <p className="text-sm text-gray-700">
                      {selectedScheme.eligibilityCriteria.age.min && selectedScheme.eligibilityCriteria.age.max
                        ? `Between ${selectedScheme.eligibilityCriteria.age.min} and ${selectedScheme.eligibilityCriteria.age.max} years`
                        : selectedScheme.eligibilityCriteria.age.min
                        ? `Minimum ${selectedScheme.eligibilityCriteria.age.min} years`
                        : selectedScheme.eligibilityCriteria.age.max
                        ? `Maximum ${selectedScheme.eligibilityCriteria.age.max} years`
                        : 'No specific age requirement'}
                    </p>
                  </div>
                )}
                
                {selectedScheme.eligibilityCriteria.gender && selectedScheme.eligibilityCriteria.gender.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Gender</h4>
                    <p className="text-sm text-gray-700">
                      {selectedScheme.eligibilityCriteria.gender.join(', ')}
                    </p>
                  </div>
                )}
                
                {selectedScheme.eligibilityCriteria.category && selectedScheme.eligibilityCriteria.category.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Category</h4>
                    <p className="text-sm text-gray-700">
                      {selectedScheme.eligibilityCriteria.category.join(', ')}
                    </p>
                  </div>
                )}
                
                {selectedScheme.eligibilityCriteria.income && selectedScheme.eligibilityCriteria.income.max !== undefined && (
                  <div>
                    <h4 className="font-medium mb-1">Income Limit</h4>
                    <p className="text-sm text-gray-700">
                      Annual income up to ₹{selectedScheme.eligibilityCriteria.income.max.toLocaleString()}
                    </p>
                  </div>
                )}
                
                {selectedScheme.eligibilityCriteria.education && selectedScheme.eligibilityCriteria.education.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Education</h4>
                    <p className="text-sm text-gray-700">
                      {selectedScheme.eligibilityCriteria.education.join(', ')}
                    </p>
                  </div>
                )}
                
                {selectedScheme.eligibilityCriteria.location && selectedScheme.eligibilityCriteria.location.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <p className="text-sm text-gray-700">
                      {selectedScheme.eligibilityCriteria.location.join(', ')}
                    </p>
                  </div>
                )}
                
                {selectedScheme.eligibilityCriteria.other && selectedScheme.eligibilityCriteria.other.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Other Requirements</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedScheme.eligibilityCriteria.other.map((req, index) => (
                        <li key={index} className="text-sm text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {!user && (
                <div className="mt-6 p-3 bg-gray-50 rounded border border-gray-200 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Check if you're eligible for this scheme
                  </p>
                  <Link to="/eligibility" className="btn btn-outline btn-sm">
                    Check Eligibility
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;