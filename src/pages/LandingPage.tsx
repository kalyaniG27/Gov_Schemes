import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

import SearchBar from "../components/ui/SearchBar";
import CategoryFilter from "../components/ui/CategoryFilter";
import SchemeCard from "../components/ui/SchemeCard";
import RecentSchemes from "../components/ui/RecentSchemes";
import useSchemeStore from "../store/useSchemeStore";
import { SchemeCategory } from "../types";
import useLanguage from "../hooks/useLanguage";

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
              <p className="text-lg md:text-xl opacity-90 mb-8 drop-shadow">
                {translate("landing.hero.subtitle")}
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

      <section className="py-16 bg-background relative">
        <RecentSchemes />
      </section>
    </div>
  );
};

export default LandingPage;
