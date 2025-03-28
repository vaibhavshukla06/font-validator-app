import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, BarChart3, FileType, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { FontContext } from '@/contexts/FontContext';
import { toast } from 'sonner';
import { useFontComparison } from '@/hooks/useFontComparison';
import FontComparisonResults from '@/components/FontComparisonResults';

const Compare = () => {
  const { fontFile } = useContext(FontContext);
  const navigate = useNavigate();
  const [compareFont, setCompareFont] = useState<File | null>(null);
  const { compareFontsAsync, isComparing, comparisonResults, clearComparisonResults } = useFontComparison();
  
  // Redirect if no font file is uploaded
  React.useEffect(() => {
    if (!fontFile) {
      navigate('/');
    }
  }, [fontFile, navigate]);
  
  // Clear comparison results when a new font is selected
  React.useEffect(() => {
    clearComparisonResults();
  }, [compareFont, clearComparisonResults]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validFormats = ['.ttf', '.otf', '.woff', '.woff2'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (validFormats.includes(fileExtension)) {
        setCompareFont(file);
        toast.success("Comparison font uploaded successfully");
      } else {
        toast.error("Invalid file format. Please upload TTF, OTF, WOFF, or WOFF2");
      }
    }
  };
  
  const handleCompare = async () => {
    if (!fontFile || !compareFont) {
      toast.error("Please upload a second font to compare");
      return;
    }
    
    await compareFontsAsync(fontFile, compareFont);
  };
  
  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24">
        <motion.div 
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Compare Fonts</h1>
        </motion.div>
        
        <motion.div
          className="compare-section bg-card p-6 rounded-lg border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Select Fonts to Compare</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="font-upload-item bg-background p-4 rounded-md border border-border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{fontFile?.name}</h3>
                  <p className="text-sm text-muted-foreground">Primary Font</p>
                </div>
              </div>
            </div>
            
            <div className="font-upload-item bg-background p-4 rounded-md border border-border">
              <label className="flex flex-col cursor-pointer">
                {compareFont ? (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <FileType className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{compareFont.name}</h3>
                      <p className="text-sm text-muted-foreground">Secondary Font</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Upload a font to compare</h3>
                      <p className="text-sm text-muted-foreground">Click to browse</p>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              className="w-full sm:w-auto"
              onClick={handleCompare}
              disabled={!compareFont || isComparing}
            >
              {isComparing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Comparing Fonts...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Compare Fonts
                </>
              )}
            </Button>
          </div>
        </motion.div>
        
        <motion.div
          className="compare-section bg-card p-6 rounded-lg border border-border mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Comparison Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="option-checkbox flex items-center">
              <input 
                type="checkbox" 
                id="metrics" 
                className="w-5 h-5 rounded text-primary" 
                defaultChecked 
              />
              <label htmlFor="metrics" className="ml-2 text-foreground">Compare Metrics</label>
            </div>
            
            <div className="option-checkbox flex items-center">
              <input 
                type="checkbox" 
                id="glyphs" 
                className="w-5 h-5 rounded text-primary" 
                defaultChecked 
              />
              <label htmlFor="glyphs" className="ml-2 text-foreground">Compare Glyphs</label>
            </div>
            
            <div className="option-checkbox flex items-center">
              <input 
                type="checkbox" 
                id="personality" 
                className="w-5 h-5 rounded text-primary" 
                defaultChecked 
              />
              <label htmlFor="personality" className="ml-2 text-foreground">Compare Personality Traits</label>
            </div>
            
            <div className="option-checkbox flex items-center">
              <input 
                type="checkbox" 
                id="features" 
                className="w-5 h-5 rounded text-primary" 
              />
              <label htmlFor="features" className="ml-2 text-foreground">Compare OpenType Features</label>
            </div>
          </div>
        </motion.div>
        
        {/* Comparison Results */}
        {comparisonResults && (
          <motion.div
            className="comparison-results-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6">Comparison Results</h2>
            <FontComparisonResults results={comparisonResults} />
          </motion.div>
        )}
      </main>
      
      <footer className="py-6 mt-12 bg-secondary/50 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Font Validator © 2024 - A tool for analyzing font properties</p>
        </div>
      </footer>
    </div>
  );
};

export default Compare;
