import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Eye, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSchemeStore from '../../store/useSchemeStore';

const RecentSchemes: React.FC = () => {
  const { schemes } = useSchemeStore();
  const [recentSchemes, setRecentSchemes] = useState<any[]>([]);
  const [mostViewedSchemes, setMostViewedSchemes] = useState<any[]>([]);

  useEffect(() => {
    // Filter schemes added in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recent = schemes.filter(scheme => {
      const lastUpdated = new Date(scheme.lastUpdated);
      return lastUpdated >= sevenDaysAgo;
    }).slice(0, 3);

    // Mock most viewed schemes (in a real app, this would come from analytics)
    const mostViewed = schemes
      .map(scheme => ({
        ...scheme,
        viewCount: Math.floor(Math.random() * 1000) + 100
      }))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 3);

    setRecentSchemes(recent);
    setMostViewedSchemes(mostViewed);
  }, [schemes]);

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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Latest Updates
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the newest government schemes and most popular programs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Recently Added Schemes */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Clock size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Recently Added</h3>
                <p className="text-sm text-gray-600">New schemes from the last 7 days</p>
              </div>
            </div>

            {recentSchemes.length > 0 ? (
              <div className="space-y-4">
                {recentSchemes.map((scheme, index) => (
                  <motion.div
                    key={scheme.id}
                    variants={itemVariants}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-green-100"
                  >
                    <Link to={`/schemes/${scheme.id}`} className="block">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1 hover:text-primary transition-colors">
                            {scheme.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">{scheme.ministry}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={12} className="mr-1" />
                            Added {new Date(scheme.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No new schemes added recently</p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link 
                to="/schemes" 
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
              >
                View All Schemes
                <TrendingUp size={16} className="ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* Most Viewed Schemes */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Most Popular</h3>
                <p className="text-sm text-gray-600">Trending schemes with highest views</p>
              </div>
            </div>

            <div className="space-y-4">
              {mostViewedSchemes.map((scheme, index) => (
                <motion.div
                  key={scheme.id}
                  variants={itemVariants}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100"
                >
                  <Link to={`/schemes/${scheme.id}`} className="block">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1 hover:text-primary transition-colors">
                          {scheme.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{scheme.ministry}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            scheme.category === 'students' ? 'bg-purple-100 text-purple-800' :
                            scheme.category === 'farmers' ? 'bg-green-100 text-green-800' :
                            scheme.category === 'women' ? 'bg-pink-100 text-pink-800' :
                            scheme.category === 'health' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {scheme.category.charAt(0).toUpperCase() + scheme.category.slice(1).replace('-', ' ')}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Eye size={12} className="mr-1" />
                            {scheme.viewCount.toLocaleString()} views
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link 
                to="/schemes" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                Explore Popular Schemes
                <Eye size={16} className="ml-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RecentSchemes;