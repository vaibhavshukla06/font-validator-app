// Font Validator - Core font analysis functionality
// Adapted from the Python implementation in Fontfeel repository
import * as opentype from 'opentype.js';

/**
 * Analyzes a font file and extracts its properties
 * @param {File} fontFile - The font file to analyze
 * @returns {Promise<Object>} - Font properties and analysis results
 */
export async function analyzeFontFile(fontFile) {
  try {
    // Read the font file as an ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(fontFile);
    
    // Parse the font using opentype.js
    const font = opentype.parse(arrayBuffer);
    
    // Extract basic font information
    const fontInfo = {
      name: font.names.fullName ? font.names.fullName.en : fontFile.name.split('.')[0],
      size: fontFile.size,
      type: fontFile.type,
      lastModified: new Date(fontFile.lastModified).toLocaleString(),
      format: determineFontFormat(font),
      version: font.names.version ? font.names.version.en : 'Unknown',
      copyright: font.names.copyright ? font.names.copyright.en : 'Unknown',
      manufacturer: font.names.manufacturer ? font.names.manufacturer.en : 'Unknown',
    };
    
    // Analyze font style (serif, sans-serif, etc.)
    const fontStyle = determineFontStyle(font);
    
    // Analyze font metrics
    const fontMetrics = calculateFontMetrics(font);
    
    // Analyze font personality
    const fontPersonality = analyzeFontPersonality(fontStyle, fontMetrics);
    
    // Generate recommendations
    const recommendations = generateRecommendations(fontStyle, fontMetrics, fontPersonality);
    
    // Extract character set information
    const characterSet = analyzeCharacterSet(font);
    
    // Extract font weight and width
    const fontWeight = determineFontWeight(font);
    const fontWidth = determineFontWidth(font);
    
    return {
      ...fontInfo,
      style: fontStyle,
      metrics: fontMetrics,
      personality: fontPersonality,
      recommendations: recommendations,
      characterSet: characterSet,
      weight: fontWeight,
      width: fontWidth
    };
  } catch (error) {
    console.error('Error analyzing font:', error);
    throw new Error(`Failed to analyze font: ${error.message}`);
  }
}

/**
 * Reads a file as an ArrayBuffer
 * @param {File} file - The file to read
 * @returns {Promise<ArrayBuffer>} - The file contents as an ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Determines the font format
 * @param {Object} font - The parsed font object
 * @returns {string} - The font format
 */
function determineFontFormat(font) {
  if (font.outlinesFormat === 'truetype') {
    return 'TrueType';
  } else if (font.outlinesFormat === 'cff') {
    return 'OpenType/CFF';
  } else {
    return font.outlinesFormat || 'Unknown';
  }
}

/**
 * Determines the font style (serif, sans-serif, script, decorative)
 * @param {Object} font - The parsed font object
 * @returns {string} - The font style
 */
function determineFontStyle(font) {
  // Check font name for style indicators
  const fontFamily = font.names.fontFamily ? font.names.fontFamily.en.toLowerCase() : '';
  const fullName = font.names.fullName ? font.names.fullName.en.toLowerCase() : '';
  const postScriptName = font.names.postScriptName ? font.names.postScriptName.en.toLowerCase() : '';
  
  // Combine all name fields for better detection
  const combinedName = `${fontFamily} ${fullName} ${postScriptName}`;
  
  // Check for explicit style indicators in the name
  if (combinedName.includes('sans') && !combinedName.includes('serif')) {
    return 'sans-serif';
  } else if (combinedName.includes('serif') && !combinedName.includes('sans')) {
    return 'serif';
  } else if (
    combinedName.includes('script') || 
    combinedName.includes('handwriting') || 
    combinedName.includes('cursive') || 
    combinedName.includes('brush') ||
    combinedName.includes('calligraph')
  ) {
    return 'script';
  } else if (
    combinedName.includes('deco') || 
    combinedName.includes('display') || 
    combinedName.includes('ornament') || 
    combinedName.includes('fancy') ||
    combinedName.includes('comic') ||
    combinedName.includes('grunge')
  ) {
    return 'decorative';
  }
  
  // Check OS/2 table if available
  if (font.tables.os2) {
    // Check panose classification if available
    if (font.tables.os2.panose) {
      const panose = font.tables.os2.panose;
      
      // Family Type (index 0)
      // 2 = Latin Text, 3 = Script, 4 = Decorative, 5 = Pictorial
      if (panose[0] === 3) {
        return 'script';
      } else if (panose[0] === 4 || panose[0] === 5) {
        return 'decorative';
      } else if (panose[0] === 2) {
        // Serif Style (index 1)
        // 11 or 0 = normal sans serif, 2-10 = various serif styles
        if (panose[1] === 11 || panose[1] === 0) {
          return 'sans-serif';
        } else if (panose[1] >= 2 && panose[1] <= 10) {
          return 'serif';
        }
      }
    }
    
    // Check if monospaced
    if (font.tables.os2.panose && font.tables.os2.panose[3] === 9) {
      return 'monospace';
    }
    
    // Check IBM font class
    const ibmFontClass = font.tables.os2.sFamilyClass;
    if (ibmFontClass) {
      const classID = (ibmFontClass >> 8) & 0xFF;
      
      if (classID === 2 || classID === 3 || classID === 4 || classID === 5) {
        return 'serif';
      } else if (classID === 8) {
        return 'sans-serif';
      } else if (classID === 9 || classID === 10) {
        return 'script';
      } else if (classID === 12) {
        return 'decorative';
      }
    }
  }
  
  // Check post table for monospace
  if (font.tables.post && font.tables.post.isFixedPitch) {
    return 'monospace';
  }
  
  // Default to sans-serif if we can't determine
  return 'sans-serif';
}

/**
 * Calculates font metrics
 * @param {Object} font - The parsed font object
 * @returns {Object} - Font metrics
 */
function calculateFontMetrics(font) {
  // Get font units
  const unitsPerEm = font.unitsPerEm;
  
  // Get key metrics from OS/2 table if available
  let xHeight = 0.5;
  let capHeight = 0.7;
  let ascender = 0.8;
  let descender = 0.2;
  
  if (font.tables.os2) {
    // Try to get xHeight from OS/2 table
    if (font.tables.os2.sxHeight) {
      xHeight = font.tables.os2.sxHeight / unitsPerEm;
    }
    
    // Try to get capHeight from OS/2 table
    if (font.tables.os2.sCapHeight) {
      capHeight = font.tables.os2.sCapHeight / unitsPerEm;
    }
    
    // Get ascender and descender
    if (font.tables.os2.sTypoAscender) {
      ascender = font.tables.os2.sTypoAscender / unitsPerEm;
    }
    
    if (font.tables.os2.sTypoDescender) {
      // Descender is typically negative in the font, but we want a positive value
      descender = Math.abs(font.tables.os2.sTypoDescender) / unitsPerEm;
    }
  }
  
  // If metrics are not available in OS/2 table, try to measure them from glyphs
  if (xHeight === 0) {
    const xGlyph = font.charToGlyph('x');
    if (xGlyph && xGlyph.advanceWidth) {
      xHeight = xGlyph.yMax / unitsPerEm;
    }
  }
  
  if (capHeight === 0) {
    const HGlyph = font.charToGlyph('H');
    if (HGlyph && HGlyph.advanceWidth) {
      capHeight = HGlyph.yMax / unitsPerEm;
    }
  }
  
  // If still not available, use hhea table
  if (ascender === 0 && font.tables.hhea) {
    ascender = font.tables.hhea.ascender / unitsPerEm;
  }
  
  if (descender === 0 && font.tables.hhea) {
    descender = Math.abs(font.tables.hhea.descender) / unitsPerEm;
  }
  
  // Estimate contrast (thickness variation)
  const contrast = estimateContrast(font);
  
  // Determine stroke terminals
  const strokeTerminals = determineStrokeTerminals(font);
  
  // Determine overall shape
  const shape = determineShape(xHeight, capHeight, ascender, descender);
  
  return {
    xHeight: `${xHeight.toFixed(2)} em`,
    capHeight: `${capHeight.toFixed(2)} em`,
    ascender: `${ascender.toFixed(2)} em`,
    descender: `${descender.toFixed(2)} em`,
    contrast,
    strokeTerminals,
    shape
  };
}

/**
 * Estimates the contrast of a font
 * @param {Object} font - The parsed font object
 * @returns {string} - Contrast description
 */
function estimateContrast(font) {
  // Try to get contrast from OS/2 table panose values
  if (font.tables.os2 && font.tables.os2.panose) {
    const strokeVariation = font.tables.os2.panose[7];
    
    // Stroke Variation (index 7)
    // 1 = No Variation, 2 = Gradual/Diagonal, 3 = Gradual/Transitional, 4 = Gradual/Vertical
    // 5 = Gradual/Horizontal, 6 = Abrupt/Vertical, 7 = Abrupt/Horizontal, 8 = Instant/Vertical
    if (strokeVariation === 1) {
      return 'No Variation (1.0)';
    } else if (strokeVariation >= 2 && strokeVariation <= 5) {
      return 'Medium (3.5)';
    } else if (strokeVariation >= 6) {
      return 'High (7.0)';
    }
  }
  
  // Default to medium contrast if we can't determine
  return 'Medium (3.5)';
}

/**
 * Determines the stroke terminals of a font
 * @param {Object} font - The parsed font object
 * @returns {string} - Description of stroke terminals
 */
function determineStrokeTerminals(font) {
  // Try to get stroke terminals from OS/2 table panose values
  if (font.tables.os2 && font.tables.os2.panose) {
    const strokeTerminals = font.tables.os2.panose[8];
    
    // Stroke Terminals (index 8)
    // 1 = None, 2 = Gradual/Rounded, 3 = Gradual/Flared, 4 = Gradual/Pointed
    // 5 = Abrupt/Square, 6 = Abrupt/Rounded, 7 = Abrupt/Flared, 8 = Abrupt/Pointed
    if (strokeTerminals === 1) {
      return 'None';
    } else if (strokeTerminals === 2 || strokeTerminals === 6) {
      return 'Rounded';
    } else if (strokeTerminals === 3 || strokeTerminals === 7) {
      return 'Flared';
    } else if (strokeTerminals === 4 || strokeTerminals === 8) {
      return 'Pointed';
    } else if (strokeTerminals === 5) {
      return 'Square';
    }
  }
  
  // Default to rounded if we can't determine
  return 'Rounded';
}

/**
 * Determines the overall shape of a font
 * @param {number} xHeight - x-height
 * @param {number} capHeight - Cap height
 * @param {number} ascender - Ascender height
 * @param {number} descender - Descender depth
 * @returns {string} - Description of font shape
 */
function determineShape(xHeight, capHeight, ascender, descender) {
  // Calculate x-height to cap-height ratio
  const xToCapRatio = xHeight / capHeight;
  
  // Calculate ascender to cap-height ratio
  const ascenderToCapRatio = ascender / capHeight;
  
  // Calculate descender to cap-height ratio
  const descenderToCapRatio = descender / capHeight;
  
  // Determine shape based on ratios
  if (xToCapRatio > 0.7) {
    return 'Large x-height, more open and readable';
  } else if (xToCapRatio < 0.5) {
    return 'Small x-height, more elegant and traditional';
  } else if (ascenderToCapRatio > 1.2) {
    return 'Tall ascenders, more distinctive and elegant';
  } else if (descenderToCapRatio > 0.5) {
    return 'Deep descenders, more distinctive and elegant';
  } else {
    return 'Balanced proportions, versatile and readable';
  }
}

/**
 * Analyzes the personality traits of a font
 * @param {string} fontStyle - Font style
 * @param {Object} fontMetrics - Font metrics
 * @returns {Object} - Personality traits
 */
function analyzeFontPersonality(fontStyle, fontMetrics) {
  // This is a simplified implementation based on font style and metrics
  let formality = 50;
  let approachability = 50;
  let gentleness = 50;
  let sophistication = 50;
  let traditionality = 50;
  let playfulness = 50;
  
  // Adjust based on font style
  if (fontStyle === 'serif') {
    formality += 25;
    sophistication += 20;
    traditionality += 25;
    playfulness -= 10;
  } else if (fontStyle === 'sans-serif') {
    approachability += 15;
    gentleness += 10;
    traditionality -= 10;
  } else if (fontStyle === 'script') {
    formality += 10;
    gentleness += 25;
    sophistication += 15;
    playfulness += 20;
  } else if (fontStyle === 'decorative') {
    formality -= 15;
    playfulness += 30;
    traditionality -= 20;
  } else if (fontStyle === 'monospace') {
    formality += 15;
    approachability -= 10;
    traditionality += 5;
    playfulness -= 15;
  }
  
  // Adjust based on x-height
  const xHeight = parseFloat(fontMetrics.xHeight);
  if (!isNaN(xHeight)) {
    if (xHeight > 0.6) {
      approachability += 10;
      formality -= 5;
    } else if (xHeight < 0.4) {
      sophistication += 10;
      formality += 5;
    }
  }
  
  // Adjust based on contrast
  if (fontMetrics.contrast.includes('High')) {
    sophistication += 15;
    traditionality += 10;
    approachability -= 5;
  } else if (fontMetrics.contrast.includes('No')) {
    approachability += 10;
    traditionality -= 10;
  } else if (fontMetrics.contrast.includes('Medium')) {
    sophistication += 5;
    approachability += 5;
  }
  
  // Adjust based on stroke terminals
  if (fontMetrics.strokeTerminals === 'Rounded') {
    gentleness += 15;
    approachability += 10;
    playfulness += 5;
  } else if (fontMetrics.strokeTerminals === 'Pointed') {
    sophistication += 10;
    gentleness -= 10;
    formality += 5;
  } else if (fontMetrics.strokeTerminals === 'Square') {
    formality += 10;
    gentleness -= 5;
    traditionality += 5;
  } else if (fontMetrics.strokeTerminals === 'Flared') {
    sophistication += 15;
    playfulness += 5;
    traditionality += 5;
  }
  
  // Adjust based on overall shape description
  if (fontMetrics.shape.includes('large x-height')) {
    approachability += 10;
    traditionality -= 5;
    playfulness += 5;
  } else if (fontMetrics.shape.includes('small x-height')) {
    sophistication += 10;
    traditionality += 5;
    playfulness -= 5;
  } else if (fontMetrics.shape.includes('tall ascenders')) {
    sophistication += 5;
    formality += 5;
    gentleness += 5;
  } else if (fontMetrics.shape.includes('deep descenders')) {
    sophistication += 5;
    playfulness += 5;
  }
  
  // Add variance based on font metrics to ensure different fonts get different personality values
  // Create a hash from font metrics measurements
  const metricsSum = xHeight * 100 + 
                     parseFloat(fontMetrics.capHeight) * 200 + 
                     parseFloat(fontMetrics.ascender) * 300 + 
                     parseFloat(fontMetrics.descender) * 400;
  
  // Use the hash to add small variations to each personality trait
  const hash = Math.abs(Math.round(metricsSum * 1000)) % 100;
  
  formality += (hash % 10) - 5;       // -5 to +4
  approachability += ((hash + 3) % 10) - 5;
  gentleness += ((hash + 7) % 10) - 5;
  sophistication += ((hash + 13) % 10) - 5;
  traditionality += ((hash + 19) % 10) - 5;
  playfulness += ((hash + 23) % 10) - 5;
  
  // Ensure values are within 0-100 range
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));
  
  const personalityTraits = {
    formality: clamp(formality),
    approachability: clamp(approachability),
    gentleness: clamp(gentleness),
    sophistication: clamp(sophistication),
    traditionality: clamp(traditionality),
    playfulness: clamp(playfulness)
  };
  
  // Generate emotional description based on personality traits
  const emotionalDescription = generateCustomEmotionalDescription(personalityTraits, fontStyle, fontMetrics);
  
  return {
    ...personalityTraits,
    emotionalDescription
  };
}

/**
 * Generates a custom human-readable description of the font's personality
 * @param {Object} personality - Font personality traits (0-100 scale)
 * @param {string} fontStyle - Font style
 * @param {Object} fontMetrics - Font metrics
 * @returns {string} - Human-readable description
 */
function generateCustomEmotionalDescription(personality, fontStyle, fontMetrics) {
  // Extract most notable traits (highest and lowest values)
  const traits = Object.entries(personality).sort((a, b) => b[1] - a[1]);
  const highestTrait = traits[0];
  const lowestTrait = traits[traits.length - 1];
  
  // Generate style-based description
  let styleDesc = "";
  switch (fontStyle) {
    case 'serif':
      styleDesc = "With its classic serif details, this font ";
      break;
    case 'sans-serif':
      styleDesc = "This modern sans-serif font ";
      break;
    case 'script':
      styleDesc = "With its flowing script characteristics, this font ";
      break;
    case 'decorative':
      styleDesc = "As a decorative design, this font ";
      break;
    case 'monospace':
      styleDesc = "With its uniform character widths, this monospace font ";
      break;
    default:
      styleDesc = "This font ";
  }
  
  // Add contrast description
  let contrastDesc = "";
  if (fontMetrics.contrast.includes('High')) {
    contrastDesc = "has dramatic contrast between thick and thin strokes, which ";
  } else if (fontMetrics.contrast.includes('No')) {
    contrastDesc = "maintains even stroke weight throughout, which ";
  } else if (fontMetrics.contrast.includes('Medium')) {
    contrastDesc = "shows moderate contrast in its strokes, which ";
  }
  
  // Add terminal description
  let terminalDesc = "";
  if (fontMetrics.strokeTerminals === 'Rounded') {
    terminalDesc = "features soft, rounded terminals that ";
  } else if (fontMetrics.strokeTerminals === 'Pointed') {
    terminalDesc = "has sharp, pointed terminals that ";
  } else if (fontMetrics.strokeTerminals === 'Square') {
    terminalDesc = "uses solid, square terminals that ";
  } else if (fontMetrics.strokeTerminals === 'Flared') {
    terminalDesc = "incorporates elegantly flared terminals that ";
  }
  
  // Add description based on highest personality trait
  let highTraitDesc = "";
  if (highestTrait[0] === 'formality' && highestTrait[1] > 70) {
    highTraitDesc = "appears quite formal and structured, suitable for professional contexts";
  } else if (highestTrait[0] === 'approachability' && highestTrait[1] > 70) {
    highTraitDesc = "feels friendly and approachable, putting readers at ease";
  } else if (highestTrait[0] === 'gentleness' && highestTrait[1] > 70) {
    highTraitDesc = "conveys a gentle and soft impression with balanced forms";
  } else if (highestTrait[0] === 'sophistication' && highestTrait[1] > 70) {
    highTraitDesc = "exudes sophistication and elegance through its refined proportions";
  } else if (highestTrait[0] === 'traditionality' && highestTrait[1] > 70) {
    highTraitDesc = "embraces traditional typographic principles with a classical feel";
  } else if (highestTrait[0] === 'playfulness' && highestTrait[1] > 70) {
    highTraitDesc = "has a playful and energetic character that adds personality to text";
  } else {
    // If highest trait isn't very high, use metrics instead
    if (fontMetrics.shape.includes('large x-height')) {
      highTraitDesc = "offers excellent readability with its large x-height and open forms";
    } else if (fontMetrics.shape.includes('small x-height')) {
      highTraitDesc = "creates an elegant appearance with its modest x-height and refined proportions";
    } else if (fontMetrics.shape.includes('tall ascenders')) {
      highTraitDesc = "features distinctive tall ascenders that create vertical rhythm and elegance";
    } else if (fontMetrics.shape.includes('deep descenders')) {
      highTraitDesc = "uses pronounced descenders that add character and distinctiveness";
    } else {
      highTraitDesc = "balances various typographic qualities for versatile use";
    }
  }
  
  // Add low trait description as a contrast if it's notably low
  let lowTraitDesc = "";
  if (lowestTrait[1] < 30) {
    if (lowestTrait[0] === 'formality') {
      lowTraitDesc = " while maintaining a relaxed, casual atmosphere";
    } else if (lowestTrait[0] === 'approachability') {
      lowTraitDesc = " while projecting a sense of authority and distance";
    } else if (lowestTrait[0] === 'gentleness') {
      lowTraitDesc = " with strong, confident strokes that command attention";
    } else if (lowestTrait[0] === 'sophistication') {
      lowTraitDesc = " with a straightforward, functional approach to typography";
    } else if (lowestTrait[0] === 'traditionality') {
      lowTraitDesc = " with a contemporary aesthetic that breaks from convention";
    } else if (lowestTrait[0] === 'playfulness') {
      lowTraitDesc = " with a serious tone that prioritizes clarity and professionalism";
    }
  }
  
  // Construct the final description
  let description = styleDesc;
  
  // Add either contrast or terminal description, but not both (avoid wordiness)
  if (Math.random() > 0.5 && contrastDesc) {
    description += contrastDesc;
  } else if (terminalDesc) {
    description += terminalDesc;
  }
  
  description += highTraitDesc + lowTraitDesc + ".";
  
  // Replace double spaces if any
  return description.replace(/\s\s+/g, ' ');
}

/**
 * Generates a human-readable description of the font's personality
 * This original function is kept for compatibility, but we now use the custom version above
 * @param {Object} personality - Font personality traits (0-100 scale)
 * @returns {string} - Human-readable description
 */
function generateEmotionalDescription(personality) {
  const descriptions = [];
  
  // Add descriptions based on personality traits
  // Formality
  if (personality.formality > 75) {
    descriptions.push("projects considerable formality and seriousness, making it suitable for professional documents and formal communications");
  } else if (personality.formality > 60) {
    descriptions.push("has a somewhat formal character that balances professionalism with accessibility");
  } else if (personality.formality < 25) {
    descriptions.push("has a very casual and informal character that creates an inviting, relaxed atmosphere");
  } else if (personality.formality < 40) {
    descriptions.push("has a relaxed, casual feel that works well for friendly communications");
  }
  
  // Approachability
  if (personality.approachability > 75) {
    descriptions.push("has a welcoming and approachable quality that instantly puts readers at ease");
  } else if (personality.approachability > 60) {
    descriptions.push("appears friendly and accessible, encouraging engagement with the text");
  } else if (personality.approachability < 25) {
    descriptions.push("may appear somewhat cold or distant, creating a sense of authority or exclusivity");
  } else if (personality.approachability < 40) {
    descriptions.push("has a slightly reserved quality that maintains a professional distance");
  }
  
  // Gentleness
  if (personality.gentleness > 75) {
    descriptions.push("conveys a gentle and soft impression with flowing, rounded forms that feel nurturing");
  } else if (personality.gentleness > 60) {
    descriptions.push("has a somewhat gentle character with balanced strokes that avoid harshness");
  } else if (personality.gentleness < 25) {
    descriptions.push("presents a strong and bold presence with decisive strokes that command attention");
  } else if (personality.gentleness < 40) {
    descriptions.push("has a moderately firm character that communicates confidence without aggression");
  }
  
  // Sophistication
  if (personality.sophistication > 75) {
    descriptions.push("exudes sophistication and elegance through refined proportions and carefully balanced details");
  } else if (personality.sophistication > 60) {
    descriptions.push("has a refined, polished quality that elevates the visual presentation of text");
  } else if (personality.sophistication < 25) {
    descriptions.push("has a deliberately unrefined, raw quality that feels authentic and grounded");
  } else if (personality.sophistication < 40) {
    descriptions.push("prioritizes function over aesthetic refinement, focusing on clarity and readability");
  }
  
  // Traditionality
  if (personality.traditionality > 75) {
    descriptions.push("has a distinctly traditional or classical feel rooted in historical typography principles");
  } else if (personality.traditionality > 60) {
    descriptions.push("has somewhat traditional characteristics while incorporating contemporary elements");
  } else if (personality.traditionality < 25) {
    descriptions.push("has a very contemporary, modern aesthetic that breaks from conventional typography");
  } else if (personality.traditionality < 40) {
    descriptions.push("feels current and up-to-date with clean lines and contemporary proportions");
  }
  
  // Playfulness
  if (personality.playfulness > 75) {
    descriptions.push("is playful and fun with expressive forms that bring energy and creativity to the text");
  } else if (personality.playfulness > 60) {
    descriptions.push("has a touch of playfulness that adds character without sacrificing readability");
  } else if (personality.playfulness < 25) {
    descriptions.push("is very serious and businesslike, focusing on clarity and professionalism");
  } else if (personality.playfulness < 40) {
    descriptions.push("maintains a certain seriousness while allowing for subtle personality");
  }
  
  // Filter out empty descriptions
  const filteredDescriptions = descriptions.filter(desc => desc);
  
  // Combine descriptions into a coherent paragraph
  if (filteredDescriptions.length === 0) {
    return "This font has a balanced personality without strongly pronounced characteristics, making it versatile for a wide range of applications.";
  } else if (filteredDescriptions.length === 1) {
    return `This font ${filteredDescriptions[0]}.`;
  } else if (filteredDescriptions.length === 2) {
    return `This font ${filteredDescriptions[0]} and ${filteredDescriptions[1]}.`;
  } else {
    const lastDesc = filteredDescriptions.pop();
    return `This font ${filteredDescriptions.join(', ')}, and ${lastDesc}.`;
  }
}

/**
 * Generates recommendations for font usage
 * @param {string} fontStyle - Font style
 * @param {Object} fontMetrics - Font metrics
 * @param {Object} fontPersonality - Font personality traits
 * @returns {Object} - Recommendations
 */
function generateRecommendations(fontStyle, fontMetrics, fontPersonality) {
  const recommendedUses = [];
  const notRecommendedUses = [];
  const fontPairings = [];
  
  // Base recommendations on font style
  if (fontStyle === 'serif') {
    recommendedUses.push(
      "Business documents and presentations",
      "Book covers and interior text",
      "Academic publications"
    );
    
    notRecommendedUses.push(
      "Casual social media content",
      "Mobile interfaces requiring compact text",
      "Display text at very small sizes"
    );
    
    fontPairings.push(
      "Open Sans (for body text)",
      "Roboto (for UI elements)",
      "Lato (for versatile use alongside)"
    );
  } else if (fontStyle === 'sans-serif') {
    recommendedUses.push(
      "Website and mobile interfaces",
      "Corporate branding",
      "Information displays"
    );
    
    notRecommendedUses.push(
      "Traditional formal documents",
      "Luxury brand materials",
      "Classical literature"
    );
    
    fontPairings.push(
      "Merriweather (for headings)",
      "Georgia (for body text in print)",
      "Playfair Display (for elegant headings)"
    );
  } else if (fontStyle === 'script') {
    recommendedUses.push(
      "Wedding invitations",
      "Certificates",
      "Luxury branding"
    );
    
    notRecommendedUses.push(
      "Long-form body text",
      "User interfaces",
      "Technical documentation"
    );
    
    fontPairings.push(
      "Montserrat (for body text)",
      "Raleway (for subheadings)",
      "Open Sans (for UI elements)"
    );
  } else if (fontStyle === 'decorative') {
    recommendedUses.push(
      "Headlines and titles",
      "Posters and banners",
      "Logo design"
    );
    
    notRecommendedUses.push(
      "Body text",
      "Legal documents",
      "Technical content"
    );
    
    fontPairings.push(
      "Roboto (for body text)",
      "Lato (for secondary text)",
      "Open Sans (for UI elements)"
    );
  } else if (fontStyle === 'monospace') {
    recommendedUses.push(
      "Code displays",
      "Technical documentation",
      "Tabular data"
    );
    
    notRecommendedUses.push(
      "Long-form reading",
      "Elegant branding",
      "Flowing text layouts"
    );
    
    fontPairings.push(
      "Open Sans (for headings)",
      "Roboto (for UI elements)",
      "Source Sans Pro (for body text)"
    );
  }
  
  // Modify recommendations based on x-height
  const xHeight = parseFloat(fontMetrics.xHeight);
  if (!isNaN(xHeight)) {
    if (xHeight > 0.6) {
      recommendedUses.push("Small text sizes", "Mobile applications", "Accessibility-focused designs");
      if (!notRecommendedUses.includes("Traditional formal documents")) {
        notRecommendedUses.push("Traditional formal documents");
      }
    } else if (xHeight < 0.4) {
      recommendedUses.push("Display typography", "Formal invitations", "Luxury branding");
      notRecommendedUses.push("User interfaces with limited space", "Body text below 12pt");
    }
  }
  
  // Modify recommendations based on contrast
  if (fontMetrics.contrast.includes('High')) {
    recommendedUses.push("Magazine layouts", "Fashion publications", "Luxury product packaging");
    notRecommendedUses.push("Small text on screens", "Low-resolution displays");
  } else if (fontMetrics.contrast.includes('No')) {
    recommendedUses.push("Digital interfaces", "Wayfinding signage", "Text for small screens");
    notRecommendedUses.push("Traditional book typography", "Formal certificates");
  }
  
  // Modify recommendations based on stroke terminals
  if (fontMetrics.strokeTerminals === 'Rounded') {
    recommendedUses.push("Children's content", "Friendly communications", "Educational materials");
  } else if (fontMetrics.strokeTerminals === 'Pointed') {
    recommendedUses.push("Fashion branding", "Luxury products", "Editorial design");
  } else if (fontMetrics.strokeTerminals === 'Square') {
    recommendedUses.push("Corporate communications", "Technical documentation", "Informational displays");
  }
  
  // Modify recommendations based on shape description
  if (fontMetrics.shape.includes('large x-height')) {
    recommendedUses.push("User interfaces", "Mobile applications", "Wayfinding signage");
  } else if (fontMetrics.shape.includes('tall ascenders')) {
    recommendedUses.push("Magazine headlines", "Book titles", "Elegant branding");
    notRecommendedUses.push("Tight line spacing layouts", "Mobile UI with space constraints");
  } else if (fontMetrics.shape.includes('deep descenders')) {
    recommendedUses.push("Editorial design", "Pull quotes", "Distinctive headlines");
    notRecommendedUses.push("Designs with minimal line spacing", "Compact layouts");
  }
  
  // Adjust recommendations based on personality
  if (fontPersonality.formality > 70) {
    recommendedUses.push("Formal business communications", "Legal documents", "Government publications");
    notRecommendedUses.push("Casual social media", "Children's books", "Friendly marketing materials");
  } else if (fontPersonality.formality < 30) {
    recommendedUses.push("Casual blogs", "Social media content", "Friendly marketing");
    notRecommendedUses.push("Legal documents", "Academic publications", "Formal business reports");
  }
  
  if (fontPersonality.playfulness > 70) {
    recommendedUses.push("Children's content", "Entertainment brands", "Casual social media");
    notRecommendedUses.push("Legal documents", "Financial reports", "Medical publications");
  } else if (fontPersonality.playfulness < 30) {
    recommendedUses.push("Financial reports", "Technical documentation", "Research papers");
    notRecommendedUses.push("Children's content", "Entertainment brands", "Casual blogging");
  }
  
  if (fontPersonality.sophistication > 70) {
    recommendedUses.push("Luxury branding", "High-end publications", "Art and culture magazines");
    notRecommendedUses.push("Technical manuals", "Casual communications", "Budget-friendly marketing");
  } else if (fontPersonality.sophistication < 30) {
    recommendedUses.push("Technical manuals", "Utilitarian designs", "Information-focused content");
    notRecommendedUses.push("Luxury branding", "Fashion magazines", "Premium marketing");
  }
  
  if (fontPersonality.approachability > 70) {
    recommendedUses.push("Educational materials", "Healthcare communications", "Customer-facing content");
    notRecommendedUses.push("High-security communications", "Legal warnings", "Authoritative messaging");
  } else if (fontPersonality.approachability < 30) {
    recommendedUses.push("Security notices", "Warning messages", "Authoritative communications");
    notRecommendedUses.push("Education for young children", "Community outreach", "Friendly marketing");
  }
  
  // Generate font pairings based on style and personality
  // Add more variety by using personality traits to influence pairings
  if (fontPersonality.sophistication > 65) {
    fontPairings.push("Baskerville (for elegant body text)", "Didot (for high-contrast headings)");
  } else if (fontPersonality.approachability > 65) {
    fontPairings.push("Nunito (for friendly headlines)", "Quicksand (for approachable UI elements)");
  } else if (fontPersonality.formality > 65) {
    fontPairings.push("Garamond (for traditional text)", "Bodoni (for formal headings)");
  } else if (fontPersonality.playfulness > 65) {
    fontPairings.push("Comic Neue (for casual text)", "Marker Felt (for playful highlights)");
  }
  
  // Add variety based on metrics to ensure different fonts get different recommendations
  // Create a fingerprint from the font metrics
  const metricsFingerprint = (
    parseFloat(fontMetrics.xHeight) * 100 + 
    parseFloat(fontMetrics.capHeight) * 200 + 
    parseFloat(fontMetrics.ascender) * 300 + 
    parseFloat(fontMetrics.descender) * 400
  );
  
  // Use the fingerprint to select additional recommendations
  const uniqueRecommendations = [
    "Editorial design", "Branding and identity", "User experience design",
    "Product packaging", "Signage systems", "Data visualization",
    "Email templates", "Social media graphics", "Presentation slides",
    "App interfaces", "Video subtitles", "Book covers",
    "Event materials", "Restaurant menus", "Marketing collateral",
    "Annual reports", "Digital advertisements", "Print brochures"
  ];
  
  const uniqueNonRecommendations = [
    "Emergency signage", "Medical instructions", "Financial disclaimers",
    "Legal contracts", "Academic papers", "Technical manuals",
    "Educational flashcards", "Children's books", "Comic strips",
    "Navigation systems", "Code editors", "Stock tickers",
    "Data tables", "Mathematical formulas", "Bibliography listings"
  ];
  
  // Select 1-2 additional unique recommendations based on the fingerprint
  const fpIndex1 = Math.abs(Math.round(metricsFingerprint * 100)) % uniqueRecommendations.length;
  const fpIndex2 = Math.abs(Math.round(metricsFingerprint * 200)) % uniqueRecommendations.length;
  
  if (fpIndex1 !== fpIndex2) {
    recommendedUses.push(uniqueRecommendations[fpIndex1]);
    recommendedUses.push(uniqueRecommendations[fpIndex2]);
  } else {
    recommendedUses.push(uniqueRecommendations[fpIndex1]);
  }
  
  // Select 1-2 additional unique non-recommendations based on the fingerprint
  const fpNonIndex1 = Math.abs(Math.round(metricsFingerprint * 300)) % uniqueNonRecommendations.length;
  const fpNonIndex2 = Math.abs(Math.round(metricsFingerprint * 400)) % uniqueNonRecommendations.length;
  
  if (fpNonIndex1 !== fpNonIndex2) {
    notRecommendedUses.push(uniqueNonRecommendations[fpNonIndex1]);
    notRecommendedUses.push(uniqueNonRecommendations[fpNonIndex2]);
  } else {
    notRecommendedUses.push(uniqueNonRecommendations[fpNonIndex1]);
  }
  
  // Remove duplicates and limit the number of recommendations to avoid overwhelming the UI
  const uniqueRecommendedUses = [...new Set(recommendedUses)].slice(0, 6);
  const uniqueNotRecommendedUses = [...new Set(notRecommendedUses)].slice(0, 6);
  const uniqueFontPairings = [...new Set(fontPairings)].slice(0, 4);
  
  return {
    recommendedUses: uniqueRecommendedUses,
    notRecommendedUses: uniqueNotRecommendedUses,
    fontPairings: uniqueFontPairings
  };
}

/**
 * Analyzes the character set of a font
 * @param {Object} font - The parsed font object
 * @returns {Object} - Character set information
 */
function analyzeCharacterSet(font) {
  // Initialize character set info
  const characterSetInfo = {
    latin: 'Unknown',
    numerals: 'Unknown',
    symbols: 'Unknown',
    punctuation: 'Unknown',
    languages: 'Unknown'
  };
  
  try {
    // Count glyphs
    const totalGlyphs = font.glyphs.length;
    
    // Count Latin characters
    let latinCount = 0;
    let numeralsCount = 0;
    let symbolsCount = 0;
    let punctuationCount = 0;
    
    // Check for specific character ranges
    const hasBasicLatin = hasCharacterRange(font, 0x0020, 0x007F);
    const hasLatinSupplement = hasCharacterRange(font, 0x00A0, 0x00FF);
    const hasLatinExtendedA = hasCharacterRange(font, 0x0100, 0x017F);
    const hasLatinExtendedB = hasCharacterRange(font, 0x0180, 0x024F);
    
    // Check for numerals
    const hasProportionalNumerals = hasSpecificCharacters(font, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    const hasTabularNumerals = checkForTabularNumerals(font);
    
    // Check for currency symbols
    const hasCurrencySymbols = hasSpecificCharacters(font, ['$', '€', '£', '¥', '¢']);
    
    // Check for punctuation
    const hasBasicPunctuation = hasSpecificCharacters(font, ['.', ',', ';', ':', '!', '?', '"', "'", '(', ')', '[', ']', '{', '}']);
    const hasExtendedPunctuation = hasSpecificCharacters(font, ['-', '--', '...', '<', '>', '"', '"', "'", "'"]);
    
    // Set Latin coverage
    if (hasBasicLatin && hasLatinSupplement && hasLatinExtendedA && hasLatinExtendedB) {
      characterSetInfo.latin = `Complete (${totalGlyphs} glyphs)`;
    } else if (hasBasicLatin && hasLatinSupplement) {
      characterSetInfo.latin = `Extended (Western European)`;
    } else if (hasBasicLatin) {
      characterSetInfo.latin = `Basic (ASCII only)`;
    }
    
    // Set numerals coverage
    if (hasProportionalNumerals && hasTabularNumerals) {
      characterSetInfo.numerals = 'Proportional and Tabular';
    } else if (hasTabularNumerals) {
      characterSetInfo.numerals = 'Tabular';
    } else if (hasProportionalNumerals) {
      characterSetInfo.numerals = 'Proportional';
    }
    
    // Set symbols coverage
    if (hasCurrencySymbols) {
      characterSetInfo.symbols = 'Basic (+currency)';
    } else {
      characterSetInfo.symbols = 'Basic';
    }
    
    // Set punctuation coverage
    if (hasBasicPunctuation && hasExtendedPunctuation) {
      characterSetInfo.punctuation = 'Complete';
    } else if (hasBasicPunctuation) {
      characterSetInfo.punctuation = 'Basic';
    }
    
    // Determine language support
    if (hasBasicLatin && hasLatinSupplement && hasLatinExtendedA) {
      characterSetInfo.languages = 'Latin-based (Western European)';
    } else if (hasBasicLatin && hasLatinSupplement) {
      characterSetInfo.languages = 'Latin-based (limited)';
    } else if (hasBasicLatin) {
      characterSetInfo.languages = 'English only';
    }
    
    return characterSetInfo;
  } catch (error) {
    console.error('Error analyzing character set:', error);
    return characterSetInfo;
  }
}

/**
 * Checks if a font has characters in a specific range
 * @param {Object} font - The parsed font object
 * @param {number} startCode - Start of Unicode range
 * @param {number} endCode - End of Unicode range
 * @returns {boolean} - Whether the font has characters in the range
 */
function hasCharacterRange(font, startCode, endCode) {
  let count = 0;
  const threshold = Math.floor((endCode - startCode + 1) * 0.7); // 70% coverage threshold
  
  for (let code = startCode; code <= endCode; code++) {
    const char = String.fromCodePoint(code);
    try {
      const glyph = font.charToGlyph(char);
      if (glyph && glyph.name !== '.notdef') {
        count++;
      }
    } catch (e) {
      // Skip errors for unsupported characters
    }
  }
  
  return count >= threshold;
}

/**
 * Checks if a font has specific characters
 * @param {Object} font - The parsed font object
 * @param {Array<string>} characters - Array of characters to check
 * @returns {boolean} - Whether the font has all the characters
 */
function hasSpecificCharacters(font, characters) {
  let count = 0;
  const threshold = Math.floor(characters.length * 0.7); // 70% coverage threshold
  
  for (const char of characters) {
    try {
      const glyph = font.charToGlyph(char);
      if (glyph && glyph.name !== '.notdef') {
        count++;
      }
    } catch (e) {
      // Skip errors for unsupported characters
    }
  }
  
  return count >= threshold;
}

/**
 * Checks if a font has tabular numerals
 * @param {Object} font - The parsed font object
 * @returns {boolean} - Whether the font has tabular numerals
 */
function checkForTabularNumerals(font) {
  try {
    // Get widths of digits
    const widths = [];
    for (let i = 0; i <= 9; i++) {
      const glyph = font.charToGlyph(i.toString());
      if (glyph && glyph.advanceWidth) {
        widths.push(glyph.advanceWidth);
      }
    }
    
    // If we have at least 5 digits and they all have the same width, it's tabular
    if (widths.length >= 5) {
      const firstWidth = widths[0];
      const allSameWidth = widths.every(width => width === firstWidth);
      return allSameWidth;
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Determines the font weight
 * @param {Object} font - The parsed font object
 * @returns {string} - Font weight description
 */
function determineFontWeight(font) {
  try {
    if (font.tables.os2 && font.tables.os2.usWeightClass) {
      const weightClass = font.tables.os2.usWeightClass;
      
      // Map weight class to description
      if (weightClass <= 100) return 'Thin (100)';
      if (weightClass <= 200) return 'Extra Light (200)';
      if (weightClass <= 300) return 'Light (300)';
      if (weightClass <= 400) return 'Regular (400)';
      if (weightClass <= 500) return 'Medium (500)';
      if (weightClass <= 600) return 'Semi Bold (600)';
      if (weightClass <= 700) return 'Bold (700)';
      if (weightClass <= 800) return 'Extra Bold (800)';
      if (weightClass <= 900) return 'Black (900)';
      return `Heavy (${weightClass})`;
    }
    
    // Check font name for weight indicators if OS/2 table is not available
    const fullName = font.names.fullName ? font.names.fullName.en.toLowerCase() : '';
    const fontFamily = font.names.fontFamily ? font.names.fontFamily.en.toLowerCase() : '';
    const subfamilyName = font.names.fontSubfamily ? font.names.fontSubfamily.en.toLowerCase() : '';
    
    const combinedName = `${fullName} ${fontFamily} ${subfamilyName}`;
    
    if (combinedName.includes('thin')) return 'Thin (100)';
    if (combinedName.includes('extra light') || combinedName.includes('ultralight')) return 'Extra Light (200)';
    if (combinedName.includes('light')) return 'Light (300)';
    if (combinedName.includes('regular') || combinedName.includes('normal')) return 'Regular (400)';
    if (combinedName.includes('medium')) return 'Medium (500)';
    if (combinedName.includes('semibold') || combinedName.includes('demibold')) return 'Semi Bold (600)';
    if (combinedName.includes('bold') && !combinedName.includes('extra') && !combinedName.includes('ultra')) return 'Bold (700)';
    if (combinedName.includes('extra bold') || combinedName.includes('ultrabold')) return 'Extra Bold (800)';
    if (combinedName.includes('black') || combinedName.includes('heavy')) return 'Black (900)';
    
    // Default to Regular if we can't determine
    return 'Regular (400)';
  } catch (error) {
    console.error('Error determining font weight:', error);
    return 'Regular (400)';
  }
}

/**
 * Determines the font width
 * @param {Object} font - The parsed font object
 * @returns {string} - Font width description
 */
function determineFontWidth(font) {
  try {
    if (font.tables.os2 && font.tables.os2.usWidthClass) {
      const widthClass = font.tables.os2.usWidthClass;
      
      // Map width class to description (1-9 scale)
      if (widthClass === 1) return 'Ultra Condensed (1)';
      if (widthClass === 2) return 'Extra Condensed (2)';
      if (widthClass === 3) return 'Condensed (3)';
      if (widthClass === 4) return 'Semi Condensed (4)';
      if (widthClass === 5) return 'Normal (5)';
      if (widthClass === 6) return 'Semi Expanded (6)';
      if (widthClass === 7) return 'Expanded (7)';
      if (widthClass === 8) return 'Extra Expanded (8)';
      if (widthClass === 9) return 'Ultra Expanded (9)';
      return `Custom (${widthClass})`;
    }
    
    // Check font name for width indicators if OS/2 table is not available
    const fullName = font.names.fullName ? font.names.fullName.en.toLowerCase() : '';
    const fontFamily = font.names.fontFamily ? font.names.fontFamily.en.toLowerCase() : '';
    const subfamilyName = font.names.fontSubfamily ? font.names.fontSubfamily.en.toLowerCase() : '';
    
    const combinedName = `${fullName} ${fontFamily} ${subfamilyName}`;
    
    if (combinedName.includes('ultra condensed')) return 'Ultra Condensed (1)';
    if (combinedName.includes('extra condensed')) return 'Extra Condensed (2)';
    if (combinedName.includes('condensed') && !combinedName.includes('semi')) return 'Condensed (3)';
    if (combinedName.includes('semi condensed')) return 'Semi Condensed (4)';
    if (combinedName.includes('semi expanded')) return 'Semi Expanded (6)';
    if (combinedName.includes('expanded') && !combinedName.includes('semi') && !combinedName.includes('extra') && !combinedName.includes('ultra')) return 'Expanded (7)';
    if (combinedName.includes('extra expanded')) return 'Extra Expanded (8)';
    if (combinedName.includes('ultra expanded')) return 'Ultra Expanded (9)';
    
    // Default to Normal if we can't determine
    return 'Normal (5)';
  } catch (error) {
    console.error('Error determining font width:', error);
    return 'Normal (5)';
  }
}

/**
 * Compares two font files and returns a detailed comparison of their properties
 * @param {File} primaryFontFile - The primary font file
 * @param {File} secondaryFontFile - The secondary font file to compare against
 * @returns {Promise<Object>} - Comparison results between the two fonts
 */
export async function compareFonts(primaryFontFile, secondaryFontFile) {
  try {
    // Analyze both fonts
    const primaryFont = await analyzeFontFile(primaryFontFile);
    const secondaryFont = await analyzeFontFile(secondaryFontFile);
    
    // Compare metrics
    const metricsComparison = {
      xHeight: {
        primary: primaryFont.metrics.xHeight,
        secondary: secondaryFont.metrics.xHeight,
        difference: calculateDifference(primaryFont.metrics.xHeight, secondaryFont.metrics.xHeight)
      },
      capHeight: {
        primary: primaryFont.metrics.capHeight,
        secondary: secondaryFont.metrics.capHeight,
        difference: calculateDifference(primaryFont.metrics.capHeight, secondaryFont.metrics.capHeight)
      },
      ascender: {
        primary: primaryFont.metrics.ascender,
        secondary: secondaryFont.metrics.ascender,
        difference: calculateDifference(primaryFont.metrics.ascender, secondaryFont.metrics.ascender)
      },
      descender: {
        primary: primaryFont.metrics.descender,
        secondary: secondaryFont.metrics.descender,
        difference: calculateDifference(primaryFont.metrics.descender, secondaryFont.metrics.descender)
      },
      contrast: {
        primary: primaryFont.metrics.contrast,
        secondary: secondaryFont.metrics.contrast,
        difference: null // Qualitative comparison
      },
      strokeTerminals: {
        primary: primaryFont.metrics.strokeTerminals,
        secondary: secondaryFont.metrics.strokeTerminals,
        difference: null // Qualitative comparison
      },
      shape: {
        primary: primaryFont.metrics.shape,
        secondary: secondaryFont.metrics.shape,
        difference: null // Qualitative comparison
      }
    };
    
    // Compare personality traits
    const personalityComparison = {
      formality: {
        primary: primaryFont.personality.formality,
        secondary: secondaryFont.personality.formality,
        difference: primaryFont.personality.formality - secondaryFont.personality.formality
      },
      approachability: {
        primary: primaryFont.personality.approachability,
        secondary: secondaryFont.personality.approachability,
        difference: primaryFont.personality.approachability - secondaryFont.personality.approachability
      },
      gentleness: {
        primary: primaryFont.personality.gentleness,
        secondary: secondaryFont.personality.gentleness,
        difference: primaryFont.personality.gentleness - secondaryFont.personality.gentleness
      },
      sophistication: {
        primary: primaryFont.personality.sophistication,
        secondary: secondaryFont.personality.sophistication,
        difference: primaryFont.personality.sophistication - secondaryFont.personality.sophistication
      },
      traditionality: {
        primary: primaryFont.personality.traditionality,
        secondary: secondaryFont.personality.traditionality,
        difference: primaryFont.personality.traditionality - secondaryFont.personality.traditionality
      },
      playfulness: {
        primary: primaryFont.personality.playfulness,
        secondary: secondaryFont.personality.playfulness,
        difference: primaryFont.personality.playfulness - secondaryFont.personality.playfulness
      }
    };
    
    // Compare character sets
    const characterSetComparison = {
      latin: compareCharacterSets(primaryFont.characterSet.latin, secondaryFont.characterSet.latin),
      numerals: compareCharacterSets(primaryFont.characterSet.numerals, secondaryFont.characterSet.numerals),
      symbols: compareCharacterSets(primaryFont.characterSet.symbols, secondaryFont.characterSet.symbols),
      punctuation: compareCharacterSets(primaryFont.characterSet.punctuation, secondaryFont.characterSet.punctuation),
      languages: compareCharacterSets(primaryFont.characterSet.languages, secondaryFont.characterSet.languages)
    };
    
    // Compare general properties
    const generalComparison = {
      weight: {
        primary: primaryFont.weight,
        secondary: secondaryFont.weight,
        difference: null // Qualitative comparison
      },
      width: {
        primary: primaryFont.width,
        secondary: secondaryFont.width,
        difference: null // Qualitative comparison
      }
    };
    
    // Generate compatibility score (0-100)
    const compatibilityScore = calculateCompatibilityScore(primaryFont, secondaryFont);
    
    // Generate pairing recommendations
    const pairingRecommendations = generatePairingRecommendations(primaryFont, secondaryFont);
    
    return {
      primaryFont: {
        name: primaryFont.name,
        format: primaryFont.format
      },
      secondaryFont: {
        name: secondaryFont.name,
        format: secondaryFont.format
      },
      metrics: metricsComparison,
      personality: personalityComparison,
      characterSet: characterSetComparison,
      general: generalComparison,
      compatibilityScore,
      pairingRecommendations
    };
  } catch (error) {
    console.error('Error comparing fonts:', error);
    throw new Error(`Font comparison failed: ${error.message}`);
  }
}

/**
 * Calculate the difference between two metric values
 * @param {string} value1 - First metric value
 * @param {string} value2 - Second metric value
 * @returns {string} - Difference description
 */
function calculateDifference(value1, value2) {
  // Extract numeric values if they exist
  const num1 = parseFloat(value1);
  const num2 = parseFloat(value2);
  
  if (!isNaN(num1) && !isNaN(num2)) {
    const diff = num1 - num2;
    const percentage = ((diff / num1) * 100).toFixed(1);
    return `${Math.abs(percentage)}% ${diff > 0 ? 'larger' : 'smaller'}`;
  }
  
  // For non-numeric values, return a simple comparison
  return value1 === value2 ? 'Identical' : 'Different';
}

/**
 * Compare two character sets and determine differences
 * @param {string} set1 - First character set description
 * @param {string} set2 - Second character set description
 * @returns {Object} - Comparison results
 */
function compareCharacterSets(set1, set2) {
  return {
    primary: set1,
    secondary: set2,
    difference: set1 === set2 ? 'Identical' : 'Different'
  };
}

/**
 * Calculate compatibility score between two fonts
 * @param {Object} font1 - First font analysis results
 * @param {Object} font2 - Second font analysis results
 * @returns {number} - Compatibility score (0-100)
 */
function calculateCompatibilityScore(font1, font2) {
  // Start with a base score
  let score = 50;
  
  // Add points for complementary styles (serif with sans-serif, etc.)
  if (font1.format !== font2.format) {
    score += 10;
  }
  
  // Add points for contrasting weights
  if (font1.weight !== font2.weight) {
    score += 10;
  }
  
  // Add points for similar x-heights (better alignment)
  const xHeight1 = parseFloat(font1.metrics.xHeight);
  const xHeight2 = parseFloat(font2.metrics.xHeight);
  if (!isNaN(xHeight1) && !isNaN(xHeight2)) {
    const xHeightDiff = Math.abs(xHeight1 - xHeight2) / Math.max(xHeight1, xHeight2);
    if (xHeightDiff < 0.1) {
      score += 15;
    } else if (xHeightDiff < 0.2) {
      score += 10;
    } else if (xHeightDiff < 0.3) {
      score += 5;
    }
  }
  
  // Add points for complementary personality traits
  const formalityDiff = Math.abs(font1.personality.formality - font2.personality.formality);
  if (formalityDiff > 30) {
    score += 10;
  }
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate pairing recommendations based on font comparison
 * @param {Object} font1 - First font analysis results
 * @param {Object} font2 - Second font analysis results
 * @returns {Object} - Pairing recommendations
 */
function generatePairingRecommendations(font1, font2) {
  const recommendations = {
    headingsBody: null,
    contrastPairing: null,
    hierarchyPairing: null
  };
  
  // Determine which font is better for headings vs body text
  if (font1.weight === 'Bold' || font1.weight === 'Heavy' || font1.weight === 'Black') {
    recommendations.headingsBody = `${font1.name} for headings, ${font2.name} for body text`;
  } else if (font2.weight === 'Bold' || font2.weight === 'Heavy' || font2.weight === 'Black') {
    recommendations.headingsBody = `${font2.name} for headings, ${font1.name} for body text`;
  } else if (font1.personality.formality > font2.personality.formality) {
    recommendations.headingsBody = `${font1.name} for headings, ${font2.name} for body text`;
  } else {
    recommendations.headingsBody = `${font2.name} for headings, ${font1.name} for body text`;
  }
  
  // Determine contrast pairing
  if (font1.metrics.contrast !== font2.metrics.contrast) {
    recommendations.contrastPairing = `Good contrast between ${font1.name} and ${font2.name} creates visual interest`;
  } else {
    recommendations.contrastPairing = `Similar contrast levels may create a more unified look`;
  }
  
  // Determine hierarchy pairing
  if (Math.abs(font1.personality.formality - font2.personality.formality) > 30) {
    recommendations.hierarchyPairing = `Strong personality difference creates clear hierarchy`;
  } else {
    recommendations.hierarchyPairing = `Similar personalities create a harmonious design`;
  }
  
  return recommendations;
} 