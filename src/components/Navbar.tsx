
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileType, Home } from "lucide-react";

const Navbar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="nav-glassmorphism fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
    >
      <Link 
        to="/" 
        className="flex items-center space-x-2 text-foreground"
      >
        <FileType className="w-6 h-6 text-primary" />
        <span className="font-semibold text-lg">Font Validator</span>
      </Link>
      
      <div className="flex items-center space-x-6">
        <Link 
          to="/" 
          className="flex items-center space-x-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link 
          to="/compare" 
          className="flex items-center space-x-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
        >
          <span>Compare Fonts</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default Navbar;
