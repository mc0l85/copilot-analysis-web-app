# Copilot Analysis Web App

A comprehensive NextJS web application for analyzing GitHub Copilot usage data with advanced analytics, reporting, and visualization capabilities.

## 🚀 Features

- **File Upload System**: Upload and process GitHub Copilot usage data files
- **Python Backend Processing**: Robust data processing pipeline for analytics
- **Excel Report Generation**: Automated Excel reports with detailed metrics
- **HTML Report Generation**: Interactive HTML reports with visualizations
- **Deep Dive Analytics**: Advanced analytics and insights into Copilot usage patterns
- **Real-time Processing**: Live updates during data processing
- **Responsive Design**: Modern, mobile-friendly interface
- **Multi-format Support**: Support for various data input formats

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Python (data processing), Node.js API routes
- **File Processing**: Python pandas, openpyxl for Excel generation
- **Styling**: Tailwind CSS, modern responsive design
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mc0l85/copilot-analysis-web-app.git
   cd copilot-analysis-web-app
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Create necessary directories**
   ```bash
   mkdir -p uploads reports
   touch uploads/.gitkeep reports/.gitkeep
   ```

5. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   # Add other environment variables as needed
   ```

## 🚀 Running the Application

### Development Mode

1. **Start the Next.js development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Ensure Python environment is activated**
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
copilot-analysis-web-app/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   └── styles/              # CSS styles
├── public/                  # Static assets
├── python/                  # Python processing scripts
├── uploads/                 # File upload directory
├── reports/                 # Generated reports directory
├── requirements.txt         # Python dependencies
├── package.json            # Node.js dependencies
└── README.md               # This file
```

## 📊 Usage

1. **Upload Data**: Use the file upload interface to upload GitHub Copilot usage data
2. **Process Data**: The application will automatically process the uploaded files using Python backend
3. **View Reports**: Access generated Excel and HTML reports in the reports section
4. **Analytics Dashboard**: Explore deep dive analytics and visualizations
5. **Download Results**: Download processed reports in various formats

## 🔍 Report Types

- **Excel Reports**: Detailed spreadsheets with metrics and data tables
- **HTML Reports**: Interactive web-based reports with charts and graphs
- **Summary Analytics**: High-level insights and key performance indicators
- **Deep Dive Analysis**: Comprehensive analysis with advanced metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or need support, please:

1. Check the existing [Issues](https://github.com/mc0l85/copilot-analysis-web-app/issues)
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🚀 Deployment

This application is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

For other deployment platforms, ensure Python runtime is available and configure build scripts accordingly.

## 📈 Performance

- Optimized for large file processing
- Efficient memory usage during data analysis
- Progressive loading for better user experience
- Caching strategies for improved performance

---

**Built with ❤️ for GitHub Copilot Analytics**
