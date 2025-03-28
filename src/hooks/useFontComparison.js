import { useState } from 'react';
import { compareFonts } from '@/lib/fontAnalysis/fontValidator';
import { toast } from 'sonner';

/**
 * Hook for comparing font files
 * @returns {Object} - Font comparison functions and state
 */
export function useFontComparison() {
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);

  /**
   * Compare two font files
   * @param {File} primaryFont - The primary font file
   * @param {File} secondaryFont - The secondary font file to compare against
   * @returns {Promise<boolean>} - Whether the comparison was successful
   */
  const compareFontsAsync = async (primaryFont, secondaryFont) => {
    if (!primaryFont || !secondaryFont) {
      toast.error("Both font files are required", {
        description: "Please ensure both primary and secondary fonts are uploaded",
      });
      return false;
    }

    try {
      setIsComparing(true);
      toast.info("Font comparison started", {
        description: "Analyzing and comparing font characteristics...",
      });

      // Perform the font comparison
      const results = await compareFonts(primaryFont, secondaryFont);
      
      // Update the comparison results
      setComparisonResults(results);

      toast.success("Font comparison complete", {
        description: "Comparison results are ready to view",
      });
      
      return true;
    } catch (error) {
      console.error('Error comparing fonts:', error);
      toast.error("Font comparison failed", {
        description: error.message || "An unexpected error occurred",
      });
      return false;
    } finally {
      setIsComparing(false);
    }
  };

  /**
   * Clear the current comparison results
   */
  const clearComparisonResults = () => {
    setComparisonResults(null);
  };

  return {
    compareFontsAsync,
    clearComparisonResults,
    isComparing,
    comparisonResults
  };
} 