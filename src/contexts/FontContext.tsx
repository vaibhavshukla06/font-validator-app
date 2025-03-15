
import { createContext, useState, ReactNode } from "react";

interface FontPersonality {
  formality: number;
  approachability: number;
  gentleness: number;
  sophistication: number;
  traditionality: number;
  playfulness: number;
}

export interface FontMetrics {
  xHeight: string;
  capHeight: string;
  ascender: string;
  descender: string;
  contrast: string;
  strokeTerminals: string;
  shape: string;
  personality?: FontPersonality;
  recommendedUses?: string[];
  notRecommendedUses?: string[];
  fontPairings?: string[];
}

interface FontContextProps {
  fontFile: File | null;
  setFontFile: (file: File | null) => void;
  fontName: string;
  fontMetrics: FontMetrics | null;
  setFontMetrics: (metrics: FontMetrics | null) => void;
}

export const FontContext = createContext<FontContextProps>({
  fontFile: null,
  setFontFile: () => {},
  fontName: "",
  fontMetrics: null,
  setFontMetrics: () => {},
});

interface FontProviderProps {
  children: ReactNode;
}

export const FontProvider = ({ children }: FontProviderProps) => {
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontMetrics, setFontMetrics] = useState<FontMetrics | null>(null);

  // Extract font name from file if available
  const fontName = fontFile ? fontFile.name.split('.')[0] : "";

  return (
    <FontContext.Provider
      value={{
        fontFile,
        setFontFile,
        fontName,
        fontMetrics,
        setFontMetrics,
      }}
    >
      {children}
    </FontContext.Provider>
  );
};
