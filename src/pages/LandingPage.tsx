import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

import SearchBar from '../components/ui/SearchBar';
import CategoryFilter from '../components/ui/CategoryFilter';
import SchemeCard from '../components/ui/SchemeCard';
import RecentSchemes from '../components/ui/RecentSchemes';
import useSchemeStore from '../store/useSchemeStore';
import { SchemeCategory } from '../types';
import useLanguage from '../hooks/useLanguage';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchSchemes, schemes } = useSchemeStore();
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
  
  const handleSearch = (query: string) => {
    navigate(`/schemes?search=${encodeURIComponent(query)}`);
  };
  
  const handleCategorySelect = (category: SchemeCategory | null) => {
    setSelectedCategory(category);
    if (category) {
      navigate(`/schemes?category=${category}`);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className="relative bg-gradient-to-r from-primary to-accent text-white py-16 md:py-24 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(0,0,0,0.2),rgba(0,0,0,0))]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div 
              className="relative z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 drop-shadow-md">
                {translate('landing.hero.title')}
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8 drop-shadow">
                {translate('landing.hero.subtitle')}
              </p>
              
              <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-300">
                <SearchBar 
                  onSearch={handleSearch} 
                  placeholder={translate('landing.search.placeholder')} 
                  language={currentLanguage}
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
              
              <div className="pt-4">
                <CategoryFilter 
                  selectedCategory={selectedCategory} 
                  onSelectCategory={handleCategorySelect} 
                />
              </div>
            </motion.div>

            <motion.div
              className="hidden lg:block relative z-10"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              <motion.img
                src="/image.png"
                alt="Azadi Ka Amrit Mahotsav with PM Modi"
                className="rounded-lg w-full h-auto"
                animate={{
                  scale: isImageHovered ? 1.02 : 1,
                  boxShadow: isImageHovered 
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                    : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>
      
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
        </div>
      </section>

      {/* Recent Schemes Section */}
      <RecentSchemes />
      
      {/* How It Works Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/30"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {translate('landing.how.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {translate('landing.how.subtitle')}
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              variants={itemVariants} 
              className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{translate('landing.how.step1.title')}</h3>
              <p className="text-gray-600">
                {translate('landing.how.step1.description')}
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants} 
              className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-secondary text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{translate('landing.how.step2.title')}</h3>
              <p className="text-gray-600">
                {translate('landing.how.step2.description')}
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants} 
              className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{translate('landing.how.step3.title')}</h3>
              <p className="text-gray-600">
                {translate('landing.how.step3.description')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="md:w-1/2">
              <motion.img 
                src="https://images.pexels.com/photos/4560092/pexels-photo-4560092.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Benefits" 
                className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                {translate('landing.benefits.title')}
              </h2>
              
              <motion.ul className="space-y-4">
                {[
                  'landing.benefits.item1',
                  'landing.benefits.item2',
                  'landing.benefits.item3',
                  'landing.benefits.item4',
                  'landing.benefits.item5',
                  'landing.benefits.item6'
                ].map((key, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start p-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <CheckCircle size={20} className="text-primary mt-1 mr-3 flex-shrink-0" />
                    <span>{translate(key)}</span>
                  </motion.li>
                ))}
              </motion.ul>
              
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <button 
                  onClick={() => navigate('/eligibility')}
                  className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {translate('landing.benefits.cta')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;