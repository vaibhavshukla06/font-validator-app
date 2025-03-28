import { useState, useRef, useContext } from "react";
import { motion } from "framer-motion";
import { Upload, FileType, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { FontContext } from "@/contexts/FontContext";

// Extend HTMLInputElement to include webkitdirectory and directory attributes
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add custom attributes
    directory?: string;
    webkitdirectory?: string;
  }
}

const FontUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDirectoryMode, setIsDirectoryMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);
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
      // Process the dropped files regardless of directory mode
      let foundValidFile = false;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const validFormats = ['.ttf', '.otf', '.woff', '.woff2'];
        
        if (validFormats.includes(fileExtension)) {
          validateAndSetFile(file);
          foundValidFile = true;
          break;
        }
      }
      
      if (!foundValidFile) {
        toast.error("No valid font files found. Please upload TTF, OTF, WOFF, or WOFF2 files.");
      } else if (files.length > 1) {
        toast.info(`Multiple files detected. Only the first valid font file will be used.`);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // If it's a single file or we're not in directory mode
      if (e.target.files.length === 1 && !isDirectoryMode) {
        validateAndSetFile(e.target.files[0]);
      } else {
        // For now, we still only support one file in the context
        // So we'll just use the first valid font file
        const files = e.target.files;
        let foundValidFile = false;
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
          const validFormats = ['.ttf', '.otf', '.woff', '.woff2'];
          
          if (validFormats.includes(fileExtension)) {
            validateAndSetFile(file);
            foundValidFile = true;
            break;
          }
        }
        
        if (!foundValidFile && files.length > 0) {
          toast.error("No valid font files found in the selected folder");
        } else if (files.length > 1) {
          toast.info(`Multiple files detected. Only the first valid font file will be used.`);
        }
      }
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
    if (isDirectoryMode) {
      dirInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const toggleDirectoryMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDirectoryMode(!isDirectoryMode);
    toast.info(isDirectoryMode ? "Switched to single file mode" : "Switched to folder mode");
  };

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Upload Your Font</h2>
        <button 
          onClick={toggleDirectoryMode}
          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
            isDirectoryMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          {isDirectoryMode ? 'Folder Mode' : 'File Mode'}
        </button>
      </div>
      
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
        {/* Regular file input for single files */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleFileChange}
        />
        
        {/* Directory input for folders */}
        <input
          type="file"
          ref={dirInputRef}
          className="hidden"
          webkitdirectory="true"
          directory="true"
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
              {isDirectoryMode ? (
                <FolderOpen className="h-12 w-12 text-primary mb-4" />
              ) : (
                <Upload className="h-12 w-12 text-primary mb-4" />
              )}
            </motion.div>
            <p className="text-base font-medium text-foreground">
              {isDirectoryMode 
                ? "Drag & drop a font folder here or click to browse" 
                : "Drag & drop your font file here or click to browse"
              }
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
