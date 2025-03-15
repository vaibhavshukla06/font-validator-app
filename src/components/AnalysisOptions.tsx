import { useContext } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FontContext } from "@/contexts/FontContext";
import { toast } from "sonner";

const AnalysisOptions = () => {
  const navigate = useNavigate();
  const { fontFile } = useContext(FontContext);

  const handleAnalyze = () => {
    if (!fontFile) {
      toast.error("Please upload a font file first", {
        description: "You need to upload a valid font file before analysis",
      });
      return;
    }
    
    // Simulate font analysis (in a real app, this would perform actual analysis)
    toast.success("Font analysis started", {
      description: "Analyzing font characteristics...",
    });
    
    // In a real implementation, you would process the font here
    // and then navigate with the results
    setTimeout(() => {
      // Navigate to results page after "analysis" is complete
      navigate("/analysis-results");
    }, 1500);
  };

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >      
      <motion.div 
        className="mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          className="w-full py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-base font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          onClick={handleAnalyze}
        >
          <Zap className="w-5 h-5" />
          Analyze Font
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisOptions;
