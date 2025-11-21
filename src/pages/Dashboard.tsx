import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';
import useLanguage from '../hooks/useLanguage';
import { 
  User, 
  FileText, 
  BookmarkCheck, 
  LogIn, 
  Bell
} from 'lucide-react';

import ApplicationStatus from '../components/ui/ApplicationStatus';
import SchemeCard from '../components/ui/SchemeCard';
import DocumentUpload from '../components/ui/DocumentUpload';
import useUserStore from '../store/useUserStore';
import useSchemeStore from '../store/useSchemeStore';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user, login } = useUserStore();
  const { schemes, fetchSchemes } = useSchemeStore();
  const { translate: t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [savedSchemes, setSavedSchemes] = useState<any[]>([]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  useEffect(() => {
    if (user && schemes.length > 0) {
      const userSavedSchemes = schemes.filter(scheme =>
        user.savedSchemes.includes(scheme.id)
      );
      setSavedSchemes(userSavedSchemes);
    }
  }, [user, schemes]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };
  
  const handleDemoLogin = () => {
    login('demo@example.com', 'password');
  };
  
  // For file upload
  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file);
    // In a real app, this would handle the file upload to the server
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <motion.div 
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-primary text-white p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">{t('dashboard.welcomeBack')}</h1>
                <p className="text-white/80">{t('dashboard.loginToAccess')}</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.emailAddress')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dashboard.password')}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        {t('dashboard.rememberMe')}
                      </label>
                    </div>

                    <div className="text-sm">
                      <a href="#" className="text-primary hover:text-primary-dark">
                        {t('dashboard.forgotPassword')}
                      </a>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full flex items-center justify-center"
                  >
                    <LogIn size={18} className="mr-2" />
                    {t('login')}
                  </button>
                </form>

                <div className="mt-4">
                  <button
                    onClick={handleDemoLogin}
                    className="btn btn-outline w-full"
                  >
                    {t('dashboard.tryDemo')}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {t('dashboard.noAccount')}{' '}
                    <a href="#" className="text-primary font-medium">
                      {t('dashboard.signUp')}
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 bg-primary text-white">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-medium">{user?.name}</h2>
                    <p className="text-sm text-white/80">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'profile'
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User size={18} className="mr-3" />
                      {t('dashboard.profile')}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'applications'
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FileText size={18} className="mr-3" />
                      {t('dashboard.applications')}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('saved')}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'saved'
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <BookmarkCheck size={18} className="mr-3" />
                      {t('dashboard.savedSchemes')}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'documents'
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <FileText size={18} className="mr-3" />
                      {t('dashboard.documents')}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{t('dashboard.personalProfile')}</h2>
                    <button className="btn btn-outline">{t('dashboard.editProfile')}</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.personalInformation')}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-500">{t('dashboard.fullName')}</label>
                          <div className="font-medium">{user?.name}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">{t('dashboard.age')}</label>
                          <div className="font-medium">{user?.age} years</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">{t('dashboard.gender')}</label>
                          <div className="font-medium">{user?.gender}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">{t('dashboard.location')}</label>
                          <div className="font-medium">{user?.location}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.additionalInformation')}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-500">{t('dashboard.category')}</label>
                          <div className="font-medium">{user?.category}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">{t('dashboard.annualIncome')}</label>
                          <div className="font-medium">₹{user?.income.toLocaleString()}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">{t('dashboard.education')}</label>
                          <div className="font-medium">{user?.education}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">{t('dashboard.employmentStatus')}</label>
                          <div className="font-medium">{user?.employmentStatus}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{t('dashboard.governmentId')}</h3>
                    <div>
                      <label className="block text-xs text-gray-500">Aadhaar Number</label>
                      <div className="font-medium">{user?.aadhaarNumber}</div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">{t('dashboard.recommendedSchemes')}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {t('dashboard.recommendedSchemesDescription')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {schemes.slice(0, 2).map(scheme => (
                        <SchemeCard key={scheme.id} scheme={scheme} user={user} />
                      ))}
                    </div>

                    <div className="mt-4 text-center">
                      <Link to="/schemes" className="btn btn-outline btn-sm">
                        {t('dashboard.exploreAllSchemes')}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'applications' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{t('dashboard.yourApplications')}</h2>
                    <Link to="/eligibility" className="btn btn-primary">
                      {t('dashboard.newApplication')}
                    </Link>
                  </div>
                  
                  {user?.applications && user.applications.length > 0 ? (
                    <div className="space-y-4">
                      {user.applications.map(application => (
                        <ApplicationStatus key={application.id} application={application} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">{t('dashboard.noApplicationsYet')}</h3>
                      <p className="text-gray-500 mb-6">
                        {t('dashboard.noApplicationsDescription')}
                      </p>
                      <Link to="/eligibility" className="btn btn-primary">
                        {t('checkEligibility')}
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'saved' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{t('dashboard.savedSchemes')}</h2>
                    <Link to="/schemes" className="btn btn-outline">
                      {t('dashboard.browseMore')}
                    </Link>
                  </div>
                  
                  {savedSchemes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {savedSchemes.map(scheme => (
                        <SchemeCard key={scheme.id} scheme={scheme} user={user} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <BookmarkCheck size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">{t('dashboard.noSavedSchemes')}</h3>
                      <p className="text-gray-500 mb-6">
                        {t('dashboard.noSavedSchemesDescription')}
                      </p>
                      <Link to="/schemes" className="btn btn-primary">
                        {t('exploreSchemes')}
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'documents' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{t('dashboard.documentManagement')}</h2>
                  </div>

                  <p className="text-gray-600 mb-6">
                    {t('dashboard.documentManagementDescription')}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <DocumentUpload
                      documentType="Aadhaar Card"
                      onUpload={handleFileUpload}
                      isUploaded={true}
                      isVerified={true}
                      uploadedFileName="aadhaar_card.pdf"
                    />
                    
                    <DocumentUpload
                      documentType="PAN Card"
                      onUpload={handleFileUpload}
                      isUploaded={true}
                      isVerified={false}
                      uploadedFileName="pan_card.jpg"
                    />
                    
                    <DocumentUpload
                      documentType="Income Certificate"
                      onUpload={handleFileUpload}
                    />
                    
                    <DocumentUpload
                      documentType="Residence Certificate"
                      onUpload={handleFileUpload}
                    />
                    
                    <DocumentUpload
                      documentType="Educational Certificates"
                      onUpload={handleFileUpload}
                    />
                    
                    <DocumentUpload
                      documentType="Bank Statement"
                      onUpload={handleFileUpload}
                    />
                  </div>
                  
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Bell size={20} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                          <h4 className="font-medium text-blue-800 mb-1">{t('dashboard.documentVerificationStatus')}</h4>
                        <p className="text-sm text-blue-600">
                            {t('dashboard.documentVerificationDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;