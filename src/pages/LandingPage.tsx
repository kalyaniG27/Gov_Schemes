import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

<<<<<<< HEAD
import SearchBar from '../components/ui/SearchBar';
import CategoryFilter from '../components/ui/CategoryFilter';
import SchemeCard from '../components/ui/SchemeCard';
import RecentSchemes from '../components/ui/RecentSchemes';
import useSchemeStore from '../store/useSchemeStore';
import { SchemeCategory } from '../types';
import useLanguage from '../hooks/useLanguage';
import VoiceCallButton from '../components/VoiceCallButton';
=======
import SearchBar from "../components/ui/SearchBar";
import CategoryFilter from "../components/ui/CategoryFilter";
import SchemeCard from "../components/ui/SchemeCard";
import RecentSchemes from "../components/ui/RecentSchemes";
import useSchemeStore from "../store/useSchemeStore";
import { SchemeCategory } from "../types";
import useLanguage from "../hooks/useLanguage";
>>>>>>> 8712861f4da8d51994b2291d4555d135451d439d

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchSchemes, schemes, loading, error } = useSchemeStore();
  const { translate, currentLanguage } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory | null>(null);
  const [featuredSchemes, setFeaturedSchemes] = useState<any[]>([]);
  const [isImageHovered, setIsImageHovered] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  useEffect(() => {
    if (schemes.length > 0) {
      const randomSchemes = [...schemes].sort(() => 0.5 - Math.random()).slice(0, 3);
      setFeaturedSchemes(randomSchemes);
    }
  }, [schemes]);
<<<<<<< HEAD
  
  function handleSearch(query: string) {
    navigate(`/schemes?search=${encodeURIComponent(query)}`);
  }
  
  function handleCategorySelect(category: SchemeCategory | null) {
=======

  const handleSearch = (query: string) => {
    navigate(`/schemes?search=${encodeURIComponent(query)}`);
  };

  const handleCategorySelect = (category: SchemeCategory | null) => {
>>>>>>> 8712861f4da8d51994b2291d4555d135451d439d
    setSelectedCategory(category);
    if (category) {
      navigate(`/schemes?category=${category}`);
    }
<<<<<<< HEAD
  }
  
=======
  };

>>>>>>> 8712861f4da8d51994b2291d4555d135451d439d
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="relative bg-gradient-to-r from-primary to-accent text-white py-16 md:py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              className="relative z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 drop-shadow-md">
                {translate("landing.hero.title")}
              </h1>
<<<<<<< HEAD
              <p className="text-lg md:text-xl opacity-90 mb-8 drop-shadow text-black">
                {translate('landing.hero.subtitle')}
=======
              <p className="text-lg md:text-xl opacity-90 mb-8 drop-shadow">
                {translate("landing.hero.subtitle")}
>>>>>>> 8712861f4da8d51994b2291d4555d135451d439d
              </p>

              <div className="mb-4">
                <SearchBar onSearch={handleSearch} placeholder={translate("landing.search.placeholder")} language={currentLanguage} />
              </div>

              <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />
            </motion.div>

            <motion.div
              className="hidden lg:block relative z-10"
            >
              <motion.img
                src="/image.png"
                alt="Azadi Ka Amrit Mahotsav with PM Modi"
                className="rounded-lg w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>
<<<<<<< HEAD
      
      {/* Featured Schemes Section */}
      <section className="py-16 bg-background relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {translate('landing.featured.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {translate('landing.featured.subtitle')}
            </p>
          </motion.div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12 text-lg font-medium text-gray-700">
              Loading schemes...
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12 text-lg font-medium text-red-600">
              Error loading schemes: {error}
            </div>
          ) : (
            <>
          {loading ? (
            <div className="flex justify-center items-center py-12 text-lg font-medium text-gray-700">
              Loading schemes...
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12 text-lg font-medium text-red-600">
              Error loading schemes: {error}
            </div>
          ) : (
            <>
          {loading ? (
            <div className="flex justify-center items-center py-12 text-lg font-medium text-gray-700">
              Loading schemes...
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12 text-lg font-medium text-red-600">
              Error loading schemes: {error}
            </div>
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {featuredSchemes.map(scheme => (
                  <motion.div 
                    key={scheme.id} 
                    variants={itemVariants}
                    className="transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <SchemeCard scheme={scheme} />
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div 
                className="text-center mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button 
                  onClick={() => navigate('/schemes')}
                  className="btn btn-outline inline-flex items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {translate('landing.viewAll')}
                  <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </>
          )}
            </>
          )}
            </>
          )}
        </div>
      </section>
=======
>>>>>>> 8712861f4da8d51994b2291d4555d135451d439d

      <section className="py-16 bg-background relative">
        <RecentSchemes />
      </section>
    </div>
  );
};

export default LandingPage;
