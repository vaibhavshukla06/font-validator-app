import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, FileType, Download, ArrowRight, Star, Info, FileBarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { FontContext, FontMetrics } from '@/contexts/FontContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Mock data for visualizations
const fontPersonalityData = [{
  trait: 'Professional',
  value: 80
}, {
  trait: 'Elegant',
  value: 65
}, {
  trait: 'Friendly',
  value: 45
}, {
  trait: 'Playful',
  value: 30
}, {
  trait: 'Modern',
  value: 70
}, {
  trait: 'Traditional',
  value: 50
}];
const weightDistributionData = [{
  name: 'Thin',
  weight: 15
}, {
  name: 'Light',
  weight: 25
}, {
  name: 'Regular',
  weight: 40
}, {
  name: 'Medium',
  weight: 30
}, {
  name: 'Bold',
  weight: 20
}, {
  name: 'Black',
  weight: 10
}];
const characterProportionsData = [{
  subject: 'Ascender',
  A: 80,
  fullMark: 100
}, {
  subject: 'Descender',
  A: 55,
  fullMark: 100
}, {
  subject: 'X-Height',
  A: 70,
  fullMark: 100
}, {
  subject: 'Width',
  A: 65,
  fullMark: 100
}, {
  subject: 'Contrast',
  A: 45,
  fullMark: 100
}, {
  subject: 'Counter',
  A: 60,
  fullMark: 100
}];

// Character set data - This will now be replaced with real data from the font analysis
// We'll keep this as a fallback
const characterSetInfo = {
  latin: 'Complete (220 glyphs)',
  numerals: 'Proportional and Tabular',
  symbols: 'Basic (+currency)',
  punctuation: 'Complete',
  languages: 'Latin-based (Western European)'
};

// Mock personality analysis - This will be replaced with real data
// Keeping as fallback
const personalityAnalysis = "This font projects considerable formality and seriousness, has a welcoming and approachable quality, has a somewhat gentle character, exudes sophistication and elegance, has somewhat traditional characteristics, and has a touch of playfulness.";

// Mock recommended use cases
const recommendedUses = ["Business documents and presentations", "Formal invitations", "Book covers and interior text", "Academic publications"];
const notRecommendedUses = ["Children's publications", "Casual social media content", "Mobile interfaces requiring compact text", "Display text at very small sizes"];

// Font pairing recommendations
const fontPairings = ["Open Sans (for body text)", "Roboto (for UI elements)", "Merriweather (for complementary headings)", "Lato (for versatile use alongside)"];
const AnalysisResults = () => {
  const [activeTab, setActiveTab] = useState('fullReport');
  const {
    fontFile,
    fontName,
    fontMetrics,
    setFontMetrics
  } = useContext(FontContext);
  const navigate = useNavigate();
  const visualizationsRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Redirect if no font file is uploaded
  useEffect(() => {
    if (!fontFile) {
      navigate('/');
    } else if (!fontMetrics) {
      // Mock font metrics data generation on first load if not set
      setFontMetrics({
        xHeight: '0.52 em',
        capHeight: '0.72 em',
        ascender: '0.82 em',
        descender: '0.22 em',
        contrast: 'Medium (3.5)',
        strokeTerminals: 'Rounded',
        shape: 'Moderately curvy',
        personality: {
          formality: 75,
          approachability: 65,
          gentleness: 60,
          sophistication: 80,
          traditionality: 55,
          playfulness: 35
        },
        recommendedUses: recommendedUses,
        notRecommendedUses: notRecommendedUses
      });
    }
  }, [fontFile, navigate, fontMetrics, setFontMetrics]);

  // Define fontData before it's used in the useMemo hooks
  const fontData = {
    name: fontName || 'Unknown Font',
    format: fontFile?.name.split('.').pop()?.toUpperCase() || 'Unknown',
    style: fontMetrics?.style || 'serif',
    weight: fontMetrics?.weight || 'Regular (400)',
    width: fontMetrics?.width || 'Normal (5)'
  };

  // Generate real personality data for the chart if available
  const realFontPersonalityData = useMemo(() => {
    if (!fontMetrics?.personality) return fontPersonalityData;
    
    return [
      {
        trait: 'Formality',
        value: fontMetrics.personality.formality
      },
      {
        trait: 'Approachability',
        value: fontMetrics.personality.approachability
      },
      {
        trait: 'Gentleness',
        value: fontMetrics.personality.gentleness
      },
      {
        trait: 'Sophistication',
        value: fontMetrics.personality.sophistication
      },
      {
        trait: 'Traditionality',
        value: fontMetrics.personality.traditionality
      },
      {
        trait: 'Playfulness',
        value: fontMetrics.personality.playfulness
      }
    ];
  }, [fontMetrics]);
  
  // Generate real weight distribution data based on font weight
  const realWeightDistributionData = useMemo(() => {
    if (!fontMetrics?.weight) return weightDistributionData;
    
    // Extract weight class from the weight string (e.g., "Regular (400)" -> 400)
    const weightMatch = fontMetrics.weight.match(/\((\d+)\)/);
    const weightClass = weightMatch ? parseInt(weightMatch[1]) : 400;
    
    // Create a distribution centered around the actual weight
    return [
      {
        name: 'Thin (100)',
        weight: Math.max(5, 100 - Math.abs(weightClass - 100) / 8)
      },
      {
        name: 'Light (300)',
        weight: Math.max(5, 100 - Math.abs(weightClass - 300) / 8)
      },
      {
        name: 'Regular (400)',
        weight: Math.max(5, 100 - Math.abs(weightClass - 400) / 8)
      },
      {
        name: 'Medium (500)',
        weight: Math.max(5, 100 - Math.abs(weightClass - 500) / 8)
      },
      {
        name: 'Bold (700)',
        weight: Math.max(5, 100 - Math.abs(weightClass - 700) / 8)
      },
      {
        name: 'Black (900)',
        weight: Math.max(5, 100 - Math.abs(weightClass - 900) / 8)
      }
    ];
  }, [fontMetrics]);
  
  // Generate real character proportions data based on font metrics
  const realCharacterProportionsData = useMemo(() => {
    if (!fontMetrics) return characterProportionsData;
    
    // Extract numeric values from metrics strings
    const extractValue = (metricStr) => {
      const match = metricStr?.match(/(\d+\.\d+)/);
      return match ? parseFloat(match[1]) * 100 : 50; // Default to 50 if not found
    };
    
    // Calculate contrast value (0-100)
    const getContrastValue = (contrastStr) => {
      if (!contrastStr) return 50;
      if (contrastStr.includes('No')) return 10;
      if (contrastStr.includes('Low')) return 30;
      if (contrastStr.includes('Medium')) return 50;
      if (contrastStr.includes('High')) return 80;
      if (contrastStr.includes('Extreme')) return 95;
      return 50;
    };
    
    return [
      {
        subject: 'Ascender',
        A: extractValue(fontMetrics.ascender),
        fullMark: 100
      },
      {
        subject: 'Descender',
        A: extractValue(fontMetrics.descender),
        fullMark: 100
      },
      {
        subject: 'X-Height',
        A: extractValue(fontMetrics.xHeight),
        fullMark: 100
      },
      {
        subject: 'Cap Height',
        A: extractValue(fontMetrics.capHeight),
        fullMark: 100
      },
      {
        subject: 'Contrast',
        A: getContrastValue(fontMetrics.contrast),
        fullMark: 100
      },
      {
        subject: 'Width',
        A: fontMetrics.width ? parseInt(fontMetrics.width) * 10 : 50,
        fullMark: 100
      }
    ];
  }, [fontMetrics]);
  
  // Generate real font pairing recommendations based on font style and personality
  const realFontPairings = useMemo(() => {
    if (!fontMetrics) return fontPairings;
    
    // Extract font style from font data
    const fontStyle = fontData.style || 'serif';
    
    // Get personality traits
    const personality = fontMetrics.personality || {
      formality: 50,
      approachability: 50,
      gentleness: 50,
      sophistication: 50,
      traditionality: 50,
      playfulness: 50
    };
    
    // Define font pairing database with categories
    const fontPairingDatabase = {
      serif: {
        bodyText: ["Open Sans", "Roboto", "Lato", "Source Sans Pro"],
        headings: ["Montserrat", "Raleway", "Poppins"],
        ui: ["Roboto", "Inter", "Open Sans"]
      },
      "sans-serif": {
        bodyText: ["Merriweather", "Georgia", "Lora", "PT Serif"],
        headings: ["Playfair Display", "Libre Baskerville", "Crimson Text"],
        ui: ["Roboto", "Open Sans", "Lato"]
      },
      script: {
        bodyText: ["Montserrat", "Open Sans", "Roboto", "Lato"],
        headings: ["Oswald", "Raleway", "Poppins"],
        ui: ["Open Sans", "Roboto", "Source Sans Pro"]
      },
      decorative: {
        bodyText: ["Roboto", "Open Sans", "Lato", "Source Sans Pro"],
        headings: ["Montserrat", "Oswald", "Raleway"],
        ui: ["Roboto", "Open Sans", "Inter"]
      },
      monospace: {
        bodyText: ["Open Sans", "Roboto", "Source Sans Pro"],
        headings: ["Montserrat", "Raleway", "Oswald"],
        ui: ["Roboto", "Open Sans", "Lato"]
      }
    };
    
    // Select appropriate category based on font style
    const category = fontPairingDatabase[fontStyle] || fontPairingDatabase.serif;
    
    // Select specific fonts based on personality traits
    const recommendations = [];
    
    // For formal fonts, prefer more traditional pairings
    if (personality.formality > 70) {
      recommendations.push(`${category.bodyText[0]} (for body text)`);
      recommendations.push(`${category.headings[0]} (for headings)`);
    } 
    // For playful fonts, prefer more modern pairings
    else if (personality.playfulness > 70) {
      recommendations.push(`${category.bodyText[1]} (for body text)`);
      recommendations.push(`${category.headings[1]} (for complementary headings)`);
    }
    // For sophisticated fonts, prefer elegant pairings
    else if (personality.sophistication > 70) {
      recommendations.push(`${category.bodyText[2] || category.bodyText[0]} (for body text)`);
      recommendations.push(`${category.headings[2] || category.headings[0]} (for elegant headings)`);
    }
    // Default recommendations
    else {
      recommendations.push(`${category.bodyText[0]} (for body text)`);
      recommendations.push(`${category.ui[0]} (for UI elements)`);
    }
    
    // Always add a UI recommendation if not already included
    if (!recommendations.some(rec => rec.includes("UI elements"))) {
      recommendations.push(`${category.ui[0]} (for UI elements)`);
    }
    
    // Add a versatile option if we have less than 4 recommendations
    if (recommendations.length < 4) {
      recommendations.push(`${category.bodyText[3] || category.bodyText[0]} (for versatile use alongside)`);
    }
    
    // Ensure we have at least 3 unique recommendations
    return [...new Set(recommendations)].slice(0, 4);
  }, [fontMetrics, fontData.style]);

  // Function to handle downloading all visualizations
  const handleDownloadVisualizations = async () => {
    if (!visualizationsRef.current) return;
    
    try {
      toast.info('Preparing visualizations for download...');
      
      // Create a zip file
      const zip = new JSZip();
      
      // Capture each visualization
      const charts = visualizationsRef.current.querySelectorAll('.chart-container');
      
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        const canvas = await html2canvas(chart as HTMLElement);
        const blob = await new Promise<Blob>(resolve => {
          canvas.toBlob(blob => resolve(blob as Blob), 'image/png');
        });
        
        zip.file(`chart-${i+1}.png`, blob);
      }
      
      // Generate and download the zip file
      const content = await zip.generateAsync({type: 'blob'});
      saveAs(content, `${fontName || 'font'}-visualizations.zip`);
      
      toast.success('Visualizations downloaded successfully!');
    } catch (error) {
      console.error('Error downloading visualizations:', error);
      toast.error('Failed to download visualizations');
    }
  };
  
  // Function to handle downloading the full report
  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    
    try {
      toast.info('Preparing report for download...');
      
      const canvas = await html2canvas(reportRef.current);
      canvas.toBlob(blob => {
        if (blob) {
          saveAs(blob, `${fontName || 'font'}-analysis-report.png`);
          toast.success('Report downloaded successfully!');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  return <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20">
        <motion.div className="flex justify-between items-center mb-8" initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate('/')} className="rounded-full">
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Font Analysis Results</h1>
          </div>
          <Link to="/analysis-results">
            <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
              <FileType className="w-4 h-4" />
              Analyze Another Font
            </Button>
          </Link>
        </motion.div>
        
        <Tabs defaultValue="fullReport" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 mx-auto flex justify-center w-auto px-0">
            <TabsTrigger value="fullReport" className="flex items-center gap-2">
              <FileType className="w-5 h-5" />
              Full Report
            </TabsTrigger>
            <TabsTrigger value="visualizations" className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Visualizations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="fullReport" className="mt-0">
            <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
              {/* Left Panel - Report */}
              <ResizablePanel defaultSize={65} minSize={40}>
                <div ref={reportRef} className="h-full overflow-auto">
                  <div className="bg-white rounded-tl-xl overflow-hidden">
                    {/* Report Header */}
                    <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                      <h2 className="text-2xl font-bold text-center text-gray-800">
                        Font Analysis Report: {fontData.name}
                      </h2>
                      <div className="text-center text-gray-500 mt-2">
                        Format: {fontData.format} | Style: {fontData.style}
                      </div>
                    </div>
                    
                    {/* Font Metrics Section */}
                    <div className="px-8 py-6 border-b">
                      <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xl font-semibold text-gray-800">Font Metrics</h3>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Weight</div>
                          <div className="font-medium">{fontData.weight}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Width</div>
                          <div className="font-medium">{fontData.width}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">X-Height</div>
                          <div className="font-medium">{fontMetrics?.xHeight || '0.52 em'}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Cap Height</div>
                          <div className="font-medium">{fontMetrics?.capHeight || '0.72 em'}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Ascender</div>
                          <div className="font-medium">{fontMetrics?.ascender || '0.82 em'}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Descender</div>
                          <div className="font-medium">{fontMetrics?.descender || '0.22 em'}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Contrast</div>
                          <div className="font-medium">{fontMetrics?.contrast || 'Medium (3.5)'}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Stroke Terminals</div>
                          <div className="font-medium">{fontMetrics?.strokeTerminals || 'Rounded'}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Shape</div>
                          <div className="font-medium">{fontMetrics?.shape || 'Moderately curvy'}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Character Set Section */}
                    <div className="px-8 py-6 border-b">
                      <div className="flex items-center gap-2 mb-4">
                        <FileBarChart className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xl font-semibold text-gray-800">Character Set</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Latin:</span>
                          <span className="font-medium">{fontMetrics?.characterSet?.latin || characterSetInfo.latin}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Numerals:</span>
                          <span className="font-medium">{fontMetrics?.characterSet?.numerals || characterSetInfo.numerals}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Symbols:</span>
                          <span className="font-medium">{fontMetrics?.characterSet?.symbols || characterSetInfo.symbols}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Punctuation:</span>
                          <span className="font-medium">{fontMetrics?.characterSet?.punctuation || characterSetInfo.punctuation}</span>
                        </div>
                        
                        <div className="col-span-2 flex justify-between">
                          <span className="text-gray-500">Languages:</span>
                          <span className="font-medium">{fontMetrics?.characterSet?.languages || characterSetInfo.languages}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Personality Analysis */}
                    <div className="px-8 py-6 border-b">
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xl font-semibold text-gray-800">Personality Analysis</h3>
                      </div>
                      
                      <p className="italic text-gray-600">
                        {fontMetrics?.personality?.emotionalDescription || personalityAnalysis}
                      </p>
                    </div>
                    
                    {/* Font Pairings Recommendation */}
                    <div className="px-8 py-6 border-b">
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xl font-semibold text-gray-800">Font Pairing Recommendations</h3>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        Based on this font's characteristics, it pairs well with:
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {(fontMetrics?.fontPairings || realFontPairings).map((font, index) => <div key={index} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span>{font}</span>
                          </div>)}
                      </div>
                    </div>
                    
                    {/* Font Sample */}
                    <div className="px-8 py-6 border-b">
                      <div className="flex items-center gap-2 mb-4">
                        <FileType className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xl font-semibold text-gray-800">Font Sample</h3>
                      </div>
                      
                      <div className="rounded-lg bg-gray-50 p-6" style={{
                      fontFamily: fontName
                    }}>
                        <p className="text-3xl mb-3">ABCDEFGHIJKLM</p>
                        <p className="text-3xl mb-5">abcdefghijklm</p>
                        <p className="text-xl mb-3">The quick brown fox jumps over the lazy dog.</p>
                        <p className="text-lg">0123456789 !@#$%^&*()</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Right Panel - Recommended Uses and Actions */}
              <ResizablePanel defaultSize={35} minSize={30}>
                <div className="h-full p-6 bg-gray-50 rounded-tr-xl">
                  {/* Recommended Use Cases */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Use Cases</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <h4 className="font-medium text-green-700 mb-3">Suitable For:</h4>
                        <ul className="space-y-2">
                          {(fontMetrics?.recommendedUses || recommendedUses).map((use, index) => <li key={index} className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{use}</span>
                            </li>)}
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <h4 className="font-medium text-red-700 mb-3">Less Suitable For:</h4>
                        <ul className="space-y-2">
                          {(fontMetrics?.notRecommendedUses || notRecommendedUses).map((use, index) => <li key={index} className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-red-500 flex-shrink-0" />
                              <span className="text-sm">{use}</span>
                            </li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Actions</h3>
                    
                    <Button variant="outline" onClick={handleDownloadReport} className="w-full flex items-center justify-center gap-2 py-6 text-base">
                      <Download className="w-5 h-5" />
                      Download Full Report
                    </Button>
                    
                    <Button variant="outline" onClick={handleDownloadVisualizations} className="w-full flex items-center justify-center gap-2 py-6 text-base">
                      <Download className="w-5 h-5" />
                      Download All Visualizations
                    </Button>
                    
                    <Link to="/compare" className="block w-full">
                      <Button className="w-full flex items-center justify-center gap-2 py-6 text-base">
                        <BarChart3 className="w-5 h-5" />
                        Compare With Other Fonts
                      </Button>
                    </Link>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>
          
          <TabsContent value="visualizations" className="mt-0">
            <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
              {/* Left Panel - Visualizations */}
              <ResizablePanel defaultSize={65} minSize={40}>
                <div ref={visualizationsRef} className="h-full overflow-auto p-6 bg-white rounded-tl-xl">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Font Personality Traits */}
                    <Card className="shadow-md visualization-chart" data-name="personality-traits">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Font Personality Traits</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={realFontPersonalityData}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="trait" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Weight Distribution */}
                    <Card className="shadow-md visualization-chart" data-name="weight-distribution">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Weight Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={realWeightDistributionData} margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5
                          }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="weight" fill="#22c55e" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Character Proportions */}
                    <Card className="shadow-md visualization-chart lg:col-span-2" data-name="character-proportions">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Character Proportions</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={realCharacterProportionsData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} />
                              <Radar name={fontData.name} dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Right Panel - Actions for Visualizations tab */}
              <ResizablePanel defaultSize={35} minSize={30}>
                <div className="h-full p-6 bg-gray-50 rounded-tr-xl">
                  {/* Recommended Use Cases */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommended Use Cases</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <h4 className="font-medium text-green-700 mb-3">Suitable For:</h4>
                        <ul className="space-y-2">
                          {(fontMetrics?.recommendedUses || recommendedUses).map((use, index) => <li key={index} className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{use}</span>
                            </li>)}
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <h4 className="font-medium text-red-700 mb-3">Less Suitable For:</h4>
                        <ul className="space-y-2">
                          {(fontMetrics?.notRecommendedUses || notRecommendedUses).map((use, index) => <li key={index} className="flex items-center gap-2">
                              <ArrowRight className="w-3 h-3 text-red-500 flex-shrink-0" />
                              <span className="text-sm">{use}</span>
                            </li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Actions</h3>
                    
                    <Button variant="outline" onClick={handleDownloadReport} className="w-full flex items-center justify-center gap-2 py-6 text-base">
                      <Download className="w-5 h-5" />
                      Download Full Report
                    </Button>
                    
                    <Button variant="outline" onClick={handleDownloadVisualizations} className="w-full flex items-center justify-center gap-2 py-6 text-base">
                      <Download className="w-5 h-5" />
                      Download All Visualizations
                    </Button>
                    
                    <Link to="/compare" className="block w-full">
                      <Button className="w-full flex items-center justify-center gap-2 py-6 text-base">
                        <BarChart3 className="w-5 h-5" />
                        Compare With Other Fonts
                      </Button>
                    </Link>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 mt-12 bg-secondary/50 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Font Validator © 2024 - A tool for analyzing font properties</p>
          <p className="mt-1 text-xs">
            Our font analysis tool leverages the TrueType and OpenType specifications, insights from font psychology, and a diverse range of sample fonts from Google Fonts and Font Squirrel, utilizing fontTools and Python's struct module to deliver precise emotional and personality insights for typography.
          </p>
        </div>
      </footer>
    </div>;
};
export default AnalysisResults;