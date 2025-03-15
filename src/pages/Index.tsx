
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, UserRound, Lightbulb } from "lucide-react";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FontUploader from "@/components/FontUploader";
import AnalysisOptions from "@/components/AnalysisOptions";
import FeatureCard from "@/components/FeatureCard";
import { toast } from "sonner";

const Index = () => {
  useEffect(() => {
    // Display a welcome toast when the component mounts
    setTimeout(() => {
      toast("Welcome to Font Validator", {
        description: "Upload your font to get started",
        position: "bottom-right",
      });
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="pt-24 container mx-auto px-4">
        <Hero />
        
        <motion.div 
          className="glass-card rounded-2xl px-8 py-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FontUploader />
          <AnalysisOptions />
        </motion.div>
        
        <section className="py-20">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8" />}
              title="Detailed Metrics"
              description="Get comprehensive analysis of your font's metrics, including x-height, cap height, and weight distribution."
              delay={0.6}
            />
            
            <FeatureCard 
              icon={<UserRound className="w-8 h-8" />}
              title="Personality Analysis"
              description="Understand the personality traits your font conveys and find ideal use cases based on its characteristics."
              delay={0.7}
            />
            
            <FeatureCard 
              icon={<Lightbulb className="w-8 h-8" />}
              title="Smart Recommendations"
              description="Receive intelligent suggestions for pairing, hierarchy, and optimal sizes based on your font's properties."
              delay={0.8}
            />
          </div>
        </section>
      </main>
      
      <footer className="py-6 bg-secondary/50 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Font Validator — A typography analysis tool</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
