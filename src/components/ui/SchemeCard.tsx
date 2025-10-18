import React from 'react';
import { Link } from 'react-router-dom';
import { Scheme, User } from '../../types';
import { BookmarkPlus, BookmarkCheck, ArrowRight } from 'lucide-react';
import useUserStore from '../../store/useUserStore';
import { getEligibilityPercentage } from '../../utils/eligibilityChecker';

interface SchemeCardProps {
  scheme: Scheme;
  user?: User | null;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, user }) => {
  const { saveScheme, removeSavedScheme, user: currentUser } = useUserStore();
  
  const isSaved = currentUser?.savedSchemes.includes(scheme.id) || false;
  
  const eligibilityPercentage = user ? getEligibilityPercentage(user, scheme) : null;
  
  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSaved) {
      removeSavedScheme(scheme.id);
    } else {
      saveScheme(scheme.id);
    }
  };
  
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
    <Link to={`/schemes/${scheme.id}`} className="block">
      <div className="scheme-card group relative h-full flex flex-col">
        {/* Category tag */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(scheme.category)}`}>
          {scheme.category.charAt(0).toUpperCase() + scheme.category.slice(1).replace('-', ' ')}
        </div>
        
        {/* Save button */}
        {currentUser && (
          <button
            onClick={handleSaveToggle}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-gray-700 hover:text-primary transition-colors shadow-sm"
          >
            {isSaved ? <BookmarkCheck size={18} className="text-primary" /> : <BookmarkPlus size={18} />}
          </button>
        )}
        
        {/* Scheme image */}
        <div className="w-full h-44 rounded-t-lg overflow-hidden">
          <img
            src={scheme.imageUrl}
            alt={scheme.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Content */}
        <div className="flex-grow flex flex-col p-5">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{scheme.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{scheme.description}</p>
          
          {/* Ministry */}
          <div className="text-xs text-gray-500 mb-4">{scheme.ministry}</div>
          
          {/* Eligibility percentage or view more */}
          <div className="mt-auto flex items-center justify-between">
            {eligibilityPercentage !== null ? (
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className={`h-2 rounded-full ${
                      eligibilityPercentage >= 80
                        ? 'bg-green-500'
                        : eligibilityPercentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${eligibilityPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  {Math.round(eligibilityPercentage)}% Match
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-primary">View Details</span>
            )}
            <ArrowRight size={16} className="text-primary transform transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SchemeCard;