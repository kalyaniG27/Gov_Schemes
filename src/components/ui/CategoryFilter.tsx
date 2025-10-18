import React from 'react';
import { SchemeCategory } from '../../types';
import { GraduationCap, Tractor, Users, Heart, Home, Wallet } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: SchemeCategory | null;
  onSelectCategory: (category: SchemeCategory | null) => void;
}

interface CategoryOption {
  id: SchemeCategory | null;
  label: string;
  icon: React.ReactNode;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  const categories: CategoryOption[] = [
    { id: null, label: 'All Schemes', icon: <Users size={20} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={20} /> },
    { id: 'farmers', label: 'Farmers', icon: <Tractor size={20} /> },
    { id: 'women', label: 'Women', icon: <Users size={20} /> },
    { id: 'senior-citizens', label: 'Senior Citizens', icon: <Users size={20} /> },
    { id: 'health', label: 'Health', icon: <Heart size={20} /> },
    { id: 'housing', label: 'Housing', icon: <Home size={20} /> },
    { id: 'financial', label: 'Financial', icon: <Wallet size={20} /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id || 'all'}
          onClick={() => onSelectCategory(category.id)}
          className={`flex items-center px-4 py-2 rounded-full transition-colors ${
            selectedCategory === category.id
              ? 'bg-primary text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="mr-2">{category.icon}</span>
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;