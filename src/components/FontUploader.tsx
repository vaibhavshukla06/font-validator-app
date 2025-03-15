
import { useState, useRef, useContext } from "react";
import { motion } from "framer-motion";
import { Upload, FileType } from "lucide-react";
import { toast } from "sonner";
import { FontContext } from "@/contexts/FontContext";

const FontUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fontFile, setFontFile } = useContext(FontContext);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validFormats = ['.ttf', '.otf', '.woff', '.woff2'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (validFormats.includes(fileExtension)) {
      setFontFile(file);
      toast.success("Font file uploaded successfully");
    } else {
      toast.error("Invalid file format. Please upload TTF, OTF, WOFF, or WOFF2");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-2xl font-semibold text-foreground mb-4">Upload Your Font</h2>
      
      <motion.div
        className={`upload-area rounded-xl h-60 flex flex-col items-center justify-center cursor-pointer ${
          isDragging ? "border-primary bg-primary/5" : ""
        } ${fontFile ? "bg-primary/5 border-primary/50" : ""}`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleFileChange}
        />
        
        {fontFile ? (
          <div className="flex flex-col items-center justify-center text-center">
            <FileType className="h-12 w-12 text-primary mb-4 animate-pulse-soft" />
            <p className="text-lg font-medium text-foreground">{fontFile.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(fontFile.size / 1024).toFixed(2)} KB
            </p>
            <button 
              className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFontFile(null);
              }}
            >
              Remove & Upload Another
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <motion.div 
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Upload className="h-12 w-12 text-primary mb-4" />
            </motion.div>
            <p className="text-base font-medium text-foreground">
              Drag & drop your font file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Supported formats: TTF, OTF, WOFF, WOFF2
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FontUploader;
