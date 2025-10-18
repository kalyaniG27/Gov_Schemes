import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';

import SearchBar from '../components/ui/SearchBar';
import CategoryFilter from '../components/ui/CategoryFilter';
import SchemeCard from '../components/ui/SchemeCard';
import useSchemeStore from '../store/useSchemeStore';
import { SchemeCategory } from '../types';

const SchemeExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchSchemes, filterSchemes, sortSchemes, filteredSchemes } = useSchemeStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | null>(
    (searchParams.get('category') as SchemeCategory | null) || null
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ministry: '',
    gender: '',
    minIncome: '',
    maxIncome: '',
  });
  
  const [sortBy, setSortBy] = useState<'title' | 'lastUpdated'>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchSchemes();
      
      // Apply initial filters from URL params
      const initialCategory = searchParams.get('category') as SchemeCategory | null;
      const initialSearch = searchParams.get('search') || '';
      
      if (initialCategory || initialSearch) {
        filterSchemes(initialCategory, initialSearch);
      }
      
      setIsLoading(false);
    };
    
    initializeData();
  }, [fetchSchemes, searchParams]);
  
  // Update URL params when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    setSearchParams(params, { replace: true });
    
    // Apply filters
    const numericMinIncome = filters.minIncome ? parseInt(filters.minIncome, 10) : undefined;
    const numericMaxIncome = filters.maxIncome ? parseInt(filters.maxIncome, 10) : undefined;
    
    filterSchemes(
      selectedCategory,
      searchQuery,
      {
        ministry: filters.ministry || undefined,
        gender: filters.gender || undefined,
        minIncome: numericMinIncome,
        maxIncome: numericMaxIncome,
      }
    );
    
  }, [selectedCategory, searchQuery, filters, filterSchemes, setSearchParams]);
  
  // Apply sorting
  useEffect(() => {
    sortSchemes(sortBy, sortOrder);
  }, [sortBy, sortOrder, sortSchemes]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleCategorySelect = (category: SchemeCategory | null) => {
    setSelectedCategory(category);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      ministry: '',
      gender: '',
      minIncome: '',
      maxIncome: '',
    });
    setSearchQuery('');
    setSelectedCategory(null);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-6">Explore Government Schemes</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-grow">
              <SearchBar 
                onSearch={handleSearch} 
                initialValue={searchQuery}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center"
            >
              <Filter size={18} className="mr-2" />
              Filters
            </button>
          </div>
          
          <div className="mb-6">
            <CategoryFilter 
              selectedCategory={selectedCategory} 
              onSelectCategory={handleCategorySelect} 
            />
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <motion.div 
              className="bg-white rounded-lg shadow p-6 mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <SlidersHorizontal size={18} className="mr-2" />
                  Advanced Filters
                </h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ministry
                  </label>
                  <select
                    name="ministry"
                    value={filters.ministry}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    <option value="">All Ministries</option>
                    <option value="Ministry of Education">Ministry of Education</option>
                    <option value="Ministry of Agriculture & Farmers Welfare">Agriculture & Farmers Welfare</option>
                    <option value="Ministry of Health and Family Welfare">Health and Family Welfare</option>
                    <option value="Ministry of Housing and Urban Affairs">Housing and Urban Affairs</option>
                    <option value="Ministry of Finance">Finance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={filters.gender}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Annual Income
                  </label>
                  <input
                    type="number"
                    name="minIncome"
                    value={filters.minIncome}
                    onChange={handleFilterChange}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Annual Income
                  </label>
                  <input
                    type="number"
                    name="maxIncome"
                    value={filters.maxIncome}
                    onChange={handleFilterChange}
                    placeholder="1,000,000"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="btn btn-outline mr-2"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Sort and View Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="mb-4 sm:mb-0">
              <span className="text-sm text-gray-500 mr-2">
                {filteredSchemes.length} schemes found
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm text-gray-500 mr-2">Sort by:</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as 'title' | 'lastUpdated');
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                  className="form-input py-1 px-2 text-sm"
                >
                  <option value="title-asc">Name (A-Z)</option>
                  <option value="title-desc">Name (Z-A)</option>
                  <option value="lastUpdated-desc">Latest First</option>
                  <option value="lastUpdated-asc">Oldest First</option>
                </select>
              </div>
              
              <div className="flex border rounded overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Schemes Grid/List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">No schemes found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredSchemes.map((scheme) => (
              <motion.div key={scheme.id} variants={itemVariants}>
                <SchemeCard scheme={scheme} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SchemeExplorer;