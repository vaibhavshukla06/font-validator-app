import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Type, 
  Fingerprint, 
  Languages, 
  Scale, 
  Check, 
  X 
} from 'lucide-react';

/**
 * Component to display font comparison results
 * @param {Object} props - Component props
 * @param {Object} props.results - The comparison results
 * @returns {JSX.Element} - Rendered component
 */
const FontComparisonResults = ({ results }) => {
  if (!results) return null;
  
  const { 
    primaryFont, 
    secondaryFont, 
    metrics, 
    personality, 
    characterSet, 
    general, 
    compatibilityScore, 
    pairingRecommendations 
  } = results;
  
  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      className="comparison-results"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="bg-primary/10 p-6 rounded-lg mb-8 flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl font-bold mb-2">Compatibility Score</h2>
          <p className="text-muted-foreground">How well these fonts work together</p>
        </div>
        <div className="text-5xl font-bold text-primary">{compatibilityScore}<span className="text-2xl">/100</span></div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
        variants={itemVariants}
      >
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Primary Font</h3>
          </div>
          <p className="text-2xl font-bold mb-1">{primaryFont.name}</p>
          <p className="text-muted-foreground">{primaryFont.format}</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Secondary Font</h3>
          </div>
          <p className="text-2xl font-bold mb-1">{secondaryFont.name}</p>
          <p className="text-muted-foreground">{secondaryFont.format}</p>
        </div>
      </motion.div>
      
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Metrics Comparison</h3>
        </div>
        
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Metric</th>
                <th className="p-3 text-left">Primary Font</th>
                <th className="p-3 text-left">Secondary Font</th>
                <th className="p-3 text-left">Difference</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics).map(([key, value]) => (
                <tr key={key} className="border-t border-border">
                  <td className="p-3 font-medium capitalize">{key}</td>
                  <td className="p-3">{value.primary}</td>
                  <td className="p-3">{value.secondary}</td>
                  <td className="p-3">{value.difference || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2 mb-4">
          <Fingerprint className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Personality Comparison</h3>
        </div>
        
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Trait</th>
                <th className="p-3 text-left">Primary Font</th>
                <th className="p-3 text-left">Secondary Font</th>
                <th className="p-3 text-left">Difference</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(personality).map(([key, value]) => (
                <tr key={key} className="border-t border-border">
                  <td className="p-3 font-medium capitalize">{key}</td>
                  <td className="p-3">{value.primary}/100</td>
                  <td className="p-3">{value.secondary}/100</td>
                  <td className="p-3">{value.difference > 0 ? '+' : ''}{value.difference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Character Set Comparison</h3>
        </div>
        
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Character Set</th>
                <th className="p-3 text-left">Primary Font</th>
                <th className="p-3 text-left">Secondary Font</th>
                <th className="p-3 text-left">Comparison</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(characterSet).map(([key, value]) => (
                <tr key={key} className="border-t border-border">
                  <td className="p-3 font-medium capitalize">{key}</td>
                  <td className="p-3">{value.primary}</td>
                  <td className="p-3">{value.secondary}</td>
                  <td className="p-3">
                    {value.difference === 'Identical' ? (
                      <span className="flex items-center text-green-500">
                        <Check className="w-4 h-4 mr-1" /> Identical
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-500">
                        <X className="w-4 h-4 mr-1" /> Different
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Pairing Recommendations</h3>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Headings & Body Text</h4>
            <p>{pairingRecommendations.headingsBody}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Contrast Pairing</h4>
            <p>{pairingRecommendations.contrastPairing}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Hierarchy</h4>
            <p>{pairingRecommendations.hierarchyPairing}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FontComparisonResults; 