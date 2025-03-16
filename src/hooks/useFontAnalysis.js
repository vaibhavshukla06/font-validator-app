import { useState, useContext } from 'react';
import { analyzeFontFile } from '@/lib/fontAnalysis/fontValidator';
import { FontContext } from '@/contexts/FontContext';
import { toast } from 'sonner';

/**
 * Hook for analyzing font files
 * @returns {Object} - Font analysis functions and state
 */
export function useFontAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { fontFile, setFontMetrics } = useContext(FontContext);

  /**
   * Analyze the current font file
   * @returns {Promise<boolean>} - Whether the analysis was successful
   */
  const analyzeFontAsync = async () => {
    if (!fontFile) {
      toast.error("Please upload a font file first", {
        description: "You need to upload a valid font file before analysis",
      });
      return false;
    }

    try {
      setIsAnalyzing(true);
      toast.info("Font analysis started", {
        description: "Analyzing font characteristics...",
      });

      // Perform the font analysis
      const analysisResults = await analyzeFontFile(fontFile);
      
      // Update the font metrics in the context
      setFontMetrics({
        xHeight: analysisResults.metrics.xHeight,
        capHeight: analysisResults.metrics.capHeight,
        ascender: analysisResults.metrics.ascender,
        descender: analysisResults.metrics.descender,
        contrast: analysisResults.metrics.contrast,
        strokeTerminals: analysisResults.metrics.strokeTerminals,
        shape: analysisResults.metrics.shape,
        personality: analysisResults.personality,
        recommendedUses: analysisResults.recommendations.recommendedUses,
        notRecommendedUses: analysisResults.recommendations.notRecommendedUses,
        fontPairings: analysisResults.recommendations.fontPairings,
        characterSet: analysisResults.characterSet,
        weight: analysisResults.weight,
        width: analysisResults.width
      });

      toast.success("Font analysis complete", {
        description: "Font metrics and recommendations are ready",
      });
      
      return true;
    } catch (error) {
      console.error('Error analyzing font:', error);
      toast.error("Font analysis failed", {
        description: error.message || "An unexpected error occurred",
      });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeFontAsync,
    isAnalyzing
  };
} 