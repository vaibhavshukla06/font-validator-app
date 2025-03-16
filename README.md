# Font Validator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.0-purple.svg)](https://vitejs.dev/)

A modern web application for analyzing font files and providing detailed insights about their properties, personality traits, and recommended use cases.

## 🚀 Features

- **Font Upload**: Easily upload TTF, OTF, WOFF, or WOFF2 font files via drag-and-drop interface
- **Detailed Font Analysis**: Extract and analyze font properties including style, weight, width, shape, and spacing
- **Personality Insights**: Understand the emotional impact and personality traits conveyed by your fonts
- **Use Case Recommendations**: Get suggestions for the best applications and contexts for your fonts
- **Font Pairing Suggestions**: Receive recommendations for complementary fonts based on analysis
- **Visual Reports**: Generate visualizations for font metrics, personality traits, and character proportions
- **Downloadable Reports**: Export comprehensive reports of your font analysis
- **Font Comparison**: Compare multiple fonts to identify similarities and differences
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## 📋 Requirements

- Node.js (v16 or higher)
- npm or yarn

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/vaibhavshukla06/font-validator-app.git

# Navigate to the project directory
cd font-validator-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🎮 Usage

1. **Upload Font**: Drag and drop your font file onto the upload area or click to browse
2. **Analyze**: Click "Analyze Font" to process the font file
3. **View Results**: Explore the detailed analysis including:
   - Font metrics (x-height, cap height, ascenders, descenders)
   - Character set coverage
   - Personality analysis
   - Font pairing recommendations
   - Suitable and unsuitable use cases
4. **Visualizations**: Switch to the Visualizations tab to see graphical representations of:
   - Font personality traits
   - Weight distribution
   - Character proportions
5. **Download Report**: Save a comprehensive report of your font analysis
6. **Compare Fonts**: Use the comparison feature to analyze multiple fonts side by side

## 🏗️ Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

## 🧩 Project Structure

- `src/`
  - `components/`: Reusable UI components
  - `contexts/`: React context providers
  - `hooks/`: Custom React hooks
  - `lib/`: Utility functions and helpers
  - `pages/`: Main application pages
  - `styles/`: Global styles and theme configuration
  - `types/`: TypeScript type definitions
  - `utils/`: Helper functions for font analysis
- `public/`: Static assets
- `index.html`: Entry HTML file

## 📚 Technologies Used

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion
- **Visualization**: Recharts
- **Font Processing**: fontTools (via backend API)
- **State Management**: React Context API
- **Routing**: React Router

## 🔜 Roadmap

### Phase 1: Core Features Enhancement
- Add support for folder uploads with multiple fonts
- Improve font metrics accuracy
- Enhance personality analysis algorithms

### Phase 2: Advanced Features
- Add variable font support
- Implement non-Latin script analysis
- Create an API for third-party integration
- Add font collection management

### Phase 3: User Experience
- Add user accounts for saving font analyses
- Implement font library organization
- Create shareable font analysis reports

### Phase 4: Expansion
- Develop a font marketplace integration
- Add font creation and editing tools
- Implement AI-powered font recommendations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the visualization capabilities
- [Framer Motion](https://www.framer.com/motion/) for the smooth animations
- [fontTools](https://github.com/fonttools/fonttools) for the font parsing capabilities
- The typography community for inspiration and guidance
