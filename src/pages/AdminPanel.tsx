import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  Globe,
  Building,
  Users,
  FileText,
  ExternalLink,
  Eye,
  TrendingUp,
  Clock,
  LogOut,
  Shield,
  Settings,
} from 'lucide-react';

import { Scheme, SchemeCategory } from '../types';
import useSchemeStore from '../store/useSchemeStore';
import useAdminStore from '../store/useAdminStore';

interface AdminScheme extends Omit<Scheme, 'id' | 'imageUrl' | 'lastUpdated'> {
  id?: string;
  type: 'Central' | 'State' | 'Both';
  launchDate: string;
  applicationMethod: string;
  stateSpecific: boolean;
  state?: string;
  viewCount?: number;
  imageUrl?: string;
  lastUpdated?: string;
}

const AdminPanel: React.FC = () => {
  const { schemes, addScheme, updateScheme, deleteScheme } = useSchemeStore();
  const { admin, logoutAdmin } = useAdminStore();
  
  const [adminSchemes, setAdminSchemes] = useState<AdminScheme[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState<AdminScheme | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Central' | 'State' | 'Both'>('all');
  const [filterCategory, setFilterCategory] = useState<SchemeCategory | 'all'>('all');

  const [formData, setFormData] = useState<AdminScheme>({
    title: '',
    category: 'general',
    ministry: '',
    type: 'Central',
    description: '',
    eligibilityCriteria: {
      age: {},
      gender: [],
      category: [],
      income: {},
      education: [],
      location: [],
      employmentStatus: [],
      other: [],
    },
    benefits: [''],
    requiredDocuments: [''],
    applicationProcess: [''],
    applicationLink: '',
    applicationMethod: '',
    launchDate: '',
    stateSpecific: false,
    state: '',
    viewCount: 0,
  });

  const ministries = [
    'Ministry of Education',
    'Ministry of Agriculture & Farmers Welfare',
    'Ministry of Health and Family Welfare',
    'Ministry of Housing and Urban Affairs',
    'Ministry of Finance',
    'Ministry of Rural Development',
    'Ministry of Women and Child Development',
    'Ministry of Skill Development and Entrepreneurship',
    'Ministry of MSME',
    'Ministry of Labour and Employment',
  ];

  const categories: { value: SchemeCategory; label: string }[] = [
    { value: 'students', label: 'Students' },
    { value: 'farmers', label: 'Farmers' },
    { value: 'women', label: 'Women' },
    { value: 'senior-citizens', label: 'Senior Citizens' },
    { value: 'health', label: 'Health' },
    { value: 'housing', label: 'Housing' },
    { value: 'financial', label: 'Financial' },
    { value: 'general', label: 'General' },
  ];

  const states = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab',
    'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
  ];

  useEffect(() => {
    // Convert existing schemes to admin format
    const convertedSchemes: AdminScheme[] = schemes.map(scheme => ({
      ...scheme,
      type: 'Central' as const,
      launchDate: '2023-01-01',
      applicationMethod: 'Online',
      stateSpecific: false,
      viewCount: Math.floor(Math.random() * 1000) + 100,
    }));
    setAdminSchemes(convertedSchemes);
  }, [schemes]);

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'general',
      ministry: '',
      type: 'Central',
      description: '',
      eligibilityCriteria: {
        age: {},
        gender: [],
        category: [],
        income: {},
        education: [],
        location: [],
        employmentStatus: [],
        other: [],
      },
      benefits: [''],
      requiredDocuments: [''],
      applicationProcess: [''],
      applicationLink: '',
      applicationMethod: '',
      launchDate: '',
      stateSpecific: false,
      state: '',
      viewCount: 0,
    });
  };

  const handleInputChange = (field: keyof AdminScheme, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field: 'benefits' | 'requiredDocuments' | 'applicationProcess', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item),
    }));
  };

  const addArrayField = (field: 'benefits' | 'requiredDocuments' | 'applicationProcess') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayField = (field: 'benefits' | 'requiredDocuments' | 'applicationProcess', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const schemeData: Scheme = {
      id: editingScheme?.id || `scheme-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      ministry: formData.ministry,
      description: formData.description,
      eligibilityCriteria: formData.eligibilityCriteria,
      benefits: formData.benefits.filter(b => b.trim() !== ''),
      requiredDocuments: formData.requiredDocuments.filter(d => d.trim() !== ''),
      applicationProcess: formData.applicationProcess.filter(p => p.trim() !== ''),
      applicationLink: formData.applicationLink,
      imageUrl: 'https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    try {
      if (editingScheme) {
        await updateScheme(schemeData);
        setAdminSchemes(prev => prev.map(s => s.id === editingScheme.id ? { ...formData, id: editingScheme.id } : s));
      } else {
        await addScheme(schemeData);
        setAdminSchemes(prev => [...prev, { ...formData, id: schemeData.id }]);
      }
      
      resetForm();
      setShowAddForm(false);
      setEditingScheme(null);
    } catch (error) {
      console.error('Error saving scheme:', error);
    }
  };

  const handleEdit = (scheme: AdminScheme) => {
    setFormData(scheme);
    setEditingScheme(scheme);
    setShowAddForm(true);
  };

  const handleDelete = async (schemeId: string) => {
    if (window.confirm('Are you sure you want to delete this scheme?')) {
      try {
        await deleteScheme(schemeId);
        setAdminSchemes(prev => prev.filter(s => s.id !== schemeId));
      } catch (error) {
        console.error('Error deleting scheme:', error);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logoutAdmin();
    }
  };

  const filteredSchemes = adminSchemes.filter(scheme => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scheme.ministry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || scheme.type === filterType;
    const matchesCategory = filterCategory === 'all' || scheme.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const recentSchemes = adminSchemes.filter(scheme => {
    const launchDate = new Date(scheme.launchDate);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return launchDate >= sevenDaysAgo;
  });

  const mostViewedSchemes = [...adminSchemes]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  // Check permissions
  const canDelete = admin?.permissions.includes('delete_scheme');
  const canEdit = admin?.permissions.includes('edit_scheme');
  const canCreate = admin?.permissions.includes('create_scheme');

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
              <p className="text-gray-600">Manage government schemes and monitor performance</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Shield size={16} className="mr-1" />
                Logged in as: <span className="font-medium ml-1">{admin?.username}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{admin?.role?.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              {canCreate && (
                <button
                  onClick={() => {
                    resetForm();
                    setEditingScheme(null);
                    setShowAddForm(true);
                  }}
                  className="btn btn-primary flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add New Scheme
                </button>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-outline flex items-center text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <FileText size={24} className="text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold">{adminSchemes.length}</h3>
                  <p className="text-gray-600">Total Schemes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock size={24} className="text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold">{recentSchemes.length}</h3>
                  <p className="text-gray-600">Recent (7 days)</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye size={24} className="text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold">
                    {adminSchemes.reduce((sum, scheme) => sum + (scheme.viewCount || 0), 0)}
                  </h3>
                  <p className="text-gray-600">Total Views</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp size={24} className="text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold">
                    {Math.round(adminSchemes.reduce((sum, scheme) => sum + (scheme.viewCount || 0), 0) / adminSchemes.length) || 0}
                  </h3>
                  <p className="text-gray-600">Avg. Views</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="form-input"
            >
              <option value="all">All Types</option>
              <option value="Central">Central</option>
              <option value="State">State</option>
              <option value="Both">Both</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="form-input"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingScheme ? 'Edit Scheme' : 'Add New Scheme'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingScheme(null);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Scheme Name *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Ministry/Department *</label>
                    <select
                      value={formData.ministry}
                      onChange={(e) => handleInputChange('ministry', e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Select Ministry</option>
                      {ministries.map(ministry => (
                        <option key={ministry} value={ministry}>{ministry}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="Central">Central</option>
                      <option value="State">State</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="form-input"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Launch Date *</label>
                    <input
                      type="date"
                      value={formData.launchDate}
                      onChange={(e) => handleInputChange('launchDate', e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Application Method *</label>
                    <select
                      value={formData.applicationMethod}
                      onChange={(e) => handleInputChange('applicationMethod', e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Select Method</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Both">Both Online & Offline</option>
                    </select>
                  </div>
                </div>

                {/* State Specific */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.stateSpecific}
                      onChange={(e) => handleInputChange('stateSpecific', e.target.checked)}
                      className="mr-2"
                    />
                    State-Specific Scheme
                  </label>
                  
                  {formData.stateSpecific && (
                    <select
                      value={formData.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select State</option>
                      {states.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="form-label">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="form-input"
                    rows={4}
                    required
                  />
                </div>

                {/* Application URL */}
                <div>
                  <label className="form-label">Application URL</label>
                  <input
                    type="url"
                    value={formData.applicationLink}
                    onChange={(e) => handleInputChange('applicationLink', e.target.value)}
                    className="form-input"
                    placeholder="https://..."
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label className="form-label">Benefits *</label>
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                        className="form-input flex-1"
                        placeholder="Enter benefit"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('benefits', index)}
                          className="btn btn-outline p-2"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('benefits')}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Benefit
                  </button>
                </div>

                {/* Required Documents */}
                <div>
                  <label className="form-label">Required Documents *</label>
                  {formData.requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={doc}
                        onChange={(e) => handleArrayFieldChange('requiredDocuments', index, e.target.value)}
                        className="form-input flex-1"
                        placeholder="Enter required document"
                      />
                      {formData.requiredDocuments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('requiredDocuments', index)}
                          className="btn btn-outline p-2"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('requiredDocuments')}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Document
                  </button>
                </div>

                {/* Application Process */}
                <div>
                  <label className="form-label">Application Process *</label>
                  {formData.applicationProcess.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => handleArrayFieldChange('applicationProcess', index, e.target.value)}
                        className="form-input flex-1"
                        placeholder={`Step ${index + 1}`}
                      />
                      {formData.applicationProcess.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('applicationProcess', index)}
                          className="btn btn-outline p-2"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('applicationProcess')}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Step
                  </button>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingScheme(null);
                      resetForm();
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center"
                  >
                    <Save size={18} className="mr-2" />
                    {editingScheme ? 'Update Scheme' : 'Save Scheme'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Schemes List */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">All Schemes ({filteredSchemes.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Launch Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchemes.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{scheme.title}</div>
                        <div className="text-sm text-gray-500">{scheme.ministry}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        scheme.type === 'Central' ? 'bg-blue-100 text-blue-800' :
                        scheme.type === 'State' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {scheme.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">
                        {scheme.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(scheme.launchDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {scheme.viewCount || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(scheme)}
                            className="text-primary hover:text-primary-dark"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(scheme.id!)}
                            className="text-error hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {scheme.applicationLink && (
                          <a
                            href={scheme.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSchemes.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No schemes found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>

        {/* Recent and Most Viewed Schemes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recently Added */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock size={20} className="mr-2 text-green-600" />
              Recently Added (Last 7 Days)
            </h3>
            {recentSchemes.length > 0 ? (
              <div className="space-y-3">
                {recentSchemes.slice(0, 5).map((scheme) => (
                  <div key={scheme.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{scheme.title}</div>
                      <div className="text-xs text-gray-500">{scheme.ministry}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(scheme.launchDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No schemes added in the last 7 days</p>
            )}
          </motion.div>

          {/* Most Viewed */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-600" />
              Most Viewed Schemes
            </h3>
            <div className="space-y-3">
              {mostViewedSchemes.map((scheme, index) => (
                <div key={scheme.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-400 mr-3">#{index + 1}</span>
                    <div>
                      <div className="font-medium text-sm">{scheme.title}</div>
                      <div className="text-xs text-gray-500">{scheme.ministry}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Eye size={14} className="mr-1" />
                    {scheme.viewCount || 0}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;