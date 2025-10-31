import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Mic, MicOff, CheckCircle, XCircle } from 'lucide-react';

import ProgressSteps from '../components/ui/ProgressSteps';
import SchemeCard from '../components/ui/SchemeCard';
import useUserStore from '../store/useUserStore';
import useSchemeStore from '../store/useSchemeStore';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { getRecommendedSchemes } from '../utils/eligibilityChecker';

interface FormData {
  name: string;
  age: number;
  gender: string;
  location: string;
  category: string;
  income: number;
  education: string;
  employmentStatus: string;
  aadhaarNumber: string;
}

const EligibilityForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, register: registerUser } = useUserStore();
  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<FormData>({
    defaultValues: {
      name: user?.name || '',
      age: user?.age || undefined,
      gender: user?.gender || '',
      location: user?.location || '',
      category: user?.category || '',
      income: user?.income || undefined,
      education: user?.education || '',
      employmentStatus: user?.employmentStatus || '',
      aadhaarNumber: user?.aadhaarNumber || '',
    }
  });
  const { schemes, fetchSchemes } = useSchemeStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [listeningField, setListeningField] = useState<keyof FormData | ''>('');
  const [recommendedSchemes, setRecommendedSchemes] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    browserSupportsSpeechRecognition 
  } = useSpeechRecognition();
  
  const steps = ['Personal Information', 'Demographics', 'Employment', 'Government ID', 'Results'];

  const registerOptions = {
    name: { required: 'Name is required' },
    age: { 
      required: 'Age is required',
      min: { value: 0, message: 'Age must be positive' },
      max: { value: 120, message: 'Age cannot exceed 120' }
    },
    gender: { required: 'Gender is required' },
    location: { required: 'Location is required' },
    category: { required: 'Category is required' },
    income: { 
      required: 'Income is required',
      min: { value: 0, message: 'Income cannot be negative' }
    },
    education: { required: 'Education is required' },
    employmentStatus: { required: 'Employment status is required' },
    aadhaarNumber: {
      required: 'Aadhaar number is required',
      pattern: {
        value: /^[0-9X]{4}-[0-9X]{4}-[0-9X]{4}$/,
        message: 'Enter a valid Aadhaar format (XXXX-XXXX-XXXX)'
      }
    }
  };

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('age', user.age);
      setValue('gender', user.gender);
      setValue('location', user.location);
      setValue('category', user.category);
      setValue('income', user.income);
      setValue('education', user.education);
      setValue('employmentStatus', user.employmentStatus);
      setValue('aadhaarNumber', user.aadhaarNumber);
      
      setFormData({
        name: user.name,
        age: user.age,
        gender: user.gender,
        location: user.location,
        category: user.category,
        income: user.income,
        education: user.education,
        employmentStatus: user.employmentStatus,
        aadhaarNumber: user.aadhaarNumber,
      });
    }
  }, [user, setValue]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const formValues = watch();
  useEffect(() => {
    setFormData(formValues);
  }, [formValues]);

  useEffect(() => {
    if (transcript && listeningField) {
      let value = transcript;
      
      if (listeningField === 'age' || listeningField === 'income') {
        const numbers = transcript.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          value = numbers[0];
        }
      }
      
      setValue(listeningField, value as any);
      resetTranscript();
      stopListening();
      setListeningField('');
    }
  }, [transcript, listeningField, setValue, resetTranscript, stopListening]);

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (step) {
      case 0:
        fieldsToValidate = ['name', 'age', 'gender', 'location'];
        break;
      case 1:
        fieldsToValidate = ['category', 'income', 'education'];
        break;
      case 2:
        fieldsToValidate = ['employmentStatus'];
        break;
      case 3:
        fieldsToValidate = ['aadhaarNumber'];
        break;
    }
    
    const result = await trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      const isValid = await validateStep(currentStep);
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = async (step: number) => {
    if (step < currentStep) {
      const isValid = await validateStep(step);
      if (isValid) {
        setCurrentStep(step);
      }
    }
  };

  const handleVoiceInput = (field: keyof FormData) => {
    if (isListening && listeningField === field) {
      stopListening();
      setListeningField('');
    } else {
      resetTranscript();
      setListeningField(field);
      startListening();
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      if (user) {
        await updateProfile(data);
      } else {
        await registerUser(data);
      }
      
      const tempUser = {
        ...user,
        ...data,
        id: user?.id || 'temp-id',
        savedSchemes: user?.savedSchemes || [],
        applications: user?.applications || [],
        email: user?.email || '', // Ensure email is always a string
      };
      
      const recommended = getRecommendedSchemes(tempUser, schemes);
      setRecommendedSchemes(recommended);
      setCurrentStep(4);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-4">Check Your Eligibility</h1>
            <p className="text-gray-600">
              Complete the form below to find government schemes you are eligible for.
            </p>
          </motion.div>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <ProgressSteps 
                steps={steps} 
                currentStep={currentStep}
                onStepClick={goToStep}
              />
              
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Personal Information */}
                {currentStep === 0 && (
                  <motion.div
                    key="step1"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                    
                    <div>
                      <label htmlFor="name" className="form-label">
                        Full Name <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          type="text"
                          className={`form-input ${errors.name ? 'border-error' : ''}`}
                          {...register('name', registerOptions.name)}
                        />
                        {browserSupportsSpeechRecognition && (
                          <button
                            type="button"
                            onClick={() => handleVoiceInput('name')}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                              isListening && listeningField === 'name'
                                ? 'bg-primary/10 text-primary animate-pulse'
                                : 'text-gray-400 hover:text-gray-500'
                            }`}
                          >
                            {isListening && listeningField === 'name' ? (
                              <MicOff size={18} />
                            ) : (
                              <Mic size={18} />
                            )}
                          </button>
                        )}
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-error">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="age" className="form-label">
                        Age <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="age"
                          type="number"
                          className={`form-input ${errors.age ? 'border-error' : ''}`}
                          {...register('age', registerOptions.age)}
                        />
                        {browserSupportsSpeechRecognition && (
                          <button
                            type="button"
                            onClick={() => handleVoiceInput('age')}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                              isListening && listeningField === 'age'
                                ? 'bg-primary/10 text-primary animate-pulse'
                                : 'text-gray-400 hover:text-gray-500'
                            }`}
                          >
                            {isListening && listeningField === 'age' ? (
                              <MicOff size={18} />
                            ) : (
                              <Mic size={18} />
                            )}
                          </button>
                        )}
                      </div>
                      {errors.age && (
                        <p className="mt-1 text-sm text-error">{errors.age.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="gender" className="form-label">
                        Gender <span className="text-error">*</span>
                      </label>
                      <select
                        id="gender"
                        className={`form-input ${errors.gender ? 'border-error' : ''}`}
                        {...register('gender', registerOptions.gender)}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-error">{errors.gender.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="form-label">
                        Location (State) <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="location"
                          className={`form-input ${errors.location ? 'border-error' : ''}`}
                          {...register('location', registerOptions.location)}
                        >
                          <option value="">Select state</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="West Bengal">West Bengal</option>
                        </select>
                      </div>
                      {errors.location && (
                        <p className="mt-1 text-sm text-error">{errors.location.message}</p>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {/* Step 2: Demographics */}
                {currentStep === 1 && (
                  <motion.div
                    key="step2"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold mb-6">Demographics</h2>
                    
                    <div>
                      <label htmlFor="category" className="form-label">
                        Category <span className="text-error">*</span>
                      </label>
                      <select
                        id="category"
                        className={`form-input ${errors.category ? 'border-error' : ''}`}
                        {...register('category', registerOptions.category)}
                      >
                        <option value="">Select category</option>
                        <option value="General">General</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="OBC">OBC</option>
                        <option value="EWS">EWS</option>
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-error">{errors.category.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="income" className="form-label">
                        Annual Income (in ₹) <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="income"
                          type="number"
                          className={`form-input ${errors.income ? 'border-error' : ''}`}
                          {...register('income', registerOptions.income)}
                        />
                        {browserSupportsSpeechRecognition && (
                          <button
                            type="button"
                            onClick={() => handleVoiceInput('income')}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                              isListening && listeningField === 'income'
                                ? 'bg-primary/10 text-primary animate-pulse'
                                : 'text-gray-400 hover:text-gray-500'
                            }`}
                          >
                            {isListening && listeningField === 'income' ? (
                              <MicOff size={18} />
                            ) : (
                              <Mic size={18} />
                            )}
                          </button>
                        )}
                      </div>
                      {errors.income && (
                        <p className="mt-1 text-sm text-error">{errors.income.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="education" className="form-label">
                        Highest Education <span className="text-error">*</span>
                      </label>
                      <select
                        id="education"
                        className={`form-input ${errors.education ? 'border-error' : ''}`}
                        {...register('education', registerOptions.education)}
                      >
                        <option value="">Select education</option>
                        <option value="Below 10th">Below 10th</option>
                        <option value="10th Pass">10th Pass</option>
                        <option value="12th Pass">12th Pass</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Post Graduate">Post Graduate</option>
                        <option value="Doctorate">Doctorate</option>
                      </select>
                      {errors.education && (
                        <p className="mt-1 text-sm text-error">{errors.education.message}</p>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {/* Step 3: Employment */}
                {currentStep === 2 && (
                  <motion.div
                    key="step3"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold mb-6">Employment Status</h2>
                    
                    <div>
                      <label htmlFor="employmentStatus" className="form-label">
                        Current Employment Status <span className="text-error">*</span>
                      </label>
                      <select
                        id="employmentStatus"
                        className={`form-input ${errors.employmentStatus ? 'border-error' : ''}`}
                        {...register('employmentStatus', registerOptions.employmentStatus)}
                      >
                        <option value="">Select status</option>
                        <option value="Employed">Employed</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Student">Student</option>
                        <option value="Homemaker">Homemaker</option>
                        <option value="Retired">Retired</option>
                        <option value="Farmer">Farmer</option>
                      </select>
                      {errors.employmentStatus && (
                        <p className="mt-1 text-sm text-error">
                          {errors.employmentStatus.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircle size={20} className="text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Why we need this information
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              Many government schemes are targeted at specific employment categories.
                              For example, some schemes are exclusively for farmers, while others may
                              be for unemployed individuals or students.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 4: Government ID */}
                {currentStep === 3 && (
                  <motion.div
                    key="step4"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold mb-6">Government ID</h2>
                    
                    <div>
                      <label htmlFor="aadhaarNumber" className="form-label">
                        Aadhaar Number <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="aadhaarNumber"
                          type="text"
                          className={`form-input ${errors.aadhaarNumber ? 'border-error' : ''}`}
                          placeholder="XXXX-XXXX-XXXX"
                          {...register('aadhaarNumber', registerOptions.aadhaarNumber)}
                        />
                      </div>
                      {errors.aadhaarNumber && (
                        <p className="mt-1 text-sm text-error">
                          {errors.aadhaarNumber.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircle size={20} className="text-yellow-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Privacy Notice
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              For demonstration purposes, please enter "XXXX-XXXX-XXXX" or a similar
                              format. In a real application, your Aadhaar number would be securely
                              stored and encrypted. We do not store or process actual Aadhaar numbers
                              in this demo.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 5: Results */}
                {currentStep === 4 && (
                  <motion.div
                    key="step5"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-semibold mb-3">Your Eligibility Results</h2>
                      <p className="text-gray-600">
                        Based on your profile, we've found the following schemes you might be eligible for.
                      </p>
                    </div>
                    
                    {recommendedSchemes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {recommendedSchemes.map((scheme) => (
                          <SchemeCard key={scheme.id} scheme={scheme} user={formData as any} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <XCircle size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                          No Eligible Schemes Found
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Based on your current profile, we couldn't find schemes that match your
                          eligibility criteria. Try adjusting your details or check back later for
                          new schemes.
                        </p>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(0)}
                          className="btn btn-primary"
                        >
                          Update Your Profile
                        </button>
                      </div>
                    )}
                    
                    <div className="mt-8 text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/schemes')}
                        className="btn btn-outline"
                      >
                        Explore All Schemes
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {/* Navigation buttons */}
                {currentStep < 4 && (
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn btn-outline"
                      disabled={currentStep === 0}
                    >
                      Previous
                    </button>
                    
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="btn btn-primary"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Processing...
                          </>
                        ) : (
                          'Check Eligibility'
                        )}
                      </button>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityForm;