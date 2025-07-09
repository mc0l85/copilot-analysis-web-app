# Copilot Analysis Tool

A comprehensive NextJS web application for analyzing GitHub Copilot usage data with advanced analytics, reporting, and visualization capabilities.

## 🚀 Features

- **File Upload System**: Upload and process GitHub Copilot usage data files (CSV, Excel formats)
- **Python Backend Processing**: Robust data processing pipeline for analytics using pandas and openpyxl
- **Excel Report Generation**: Automated Excel reports with detailed metrics and license evaluation
- **HTML Report Generation**: Interactive HTML reports with visualizations and charts
- **Deep Dive Analytics**: Advanced user analytics with filtering, search, and detailed insights
- **Real-time Processing**: Live updates during data processing with progress indicators
- **Responsive Design**: Modern, mobile-friendly interface with dark/light theme support
- **Multi-format Support**: Support for CSV and Excel input formats
- **In-Memory Session Storage**: No database required - uses in-memory session management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Python (data processing), Node.js API routes
- **File Processing**: Python pandas, openpyxl for Excel generation, matplotlib for charts
- **Styling**: Tailwind CSS with shadcn/ui components, Framer Motion for animations
- **Storage**: In-memory session storage (no database required)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- yarn package manager (recommended)

## 🔧 Installation & Setup

1. **Navigate to the project directory**
   ```bash
   cd /home/ubuntu/copilot_web_app
   ```

2. **Install Node.js dependencies**
   ```bash
   cd app
   yarn install --legacy-peer-deps
   ```

3. **Install Python dependencies**
   ```bash
   cd ../python_backend
   pip install -r requirements.txt
   ```

4. **No Database Setup Required**
   This application uses in-memory session storage and temporary file processing. No database configuration or Prisma setup is needed.

## 🚀 Running the Application

### Development Mode

1. **Start the Next.js development server**
   ```bash
   cd app
   yarn dev
   ```
   The frontend will be available at [http://localhost:3000](http://localhost:3000)

2. **Python Backend**
   The Python backend runs automatically when processing files through the Next.js API routes. No separate Python server is required.

### Production Build

```bash
cd app
yarn build
yarn start
```

## 📁 Project Structure

```
copilot_web_app/
├── app/
│   ├── app/                 # Next.js app directory
│   │   ├── api/             # API routes
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Homepage
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── analysis-results.tsx
│   │   ├── copilot-analysis-app.tsx
│   │   ├── deep-dive-analysis.tsx
│   │   ├── file-upload.tsx
│   │   └── ...
│   ├── lib/                 # Utility functions
│   │   ├── analysis-store.ts # In-memory session storage
│   │   ├── types.ts         # TypeScript types
│   │   └── utils.ts         # Utility functions
│   ├── package.json         # Node.js dependencies
│   └── ...
├── python_backend/          # Python processing scripts
│   ├── copilot_analyzer.py  # Main analysis script
│   └── requirements.txt     # Python dependencies
├── temp/                    # Temporary file processing
└── README.md               # This file
```

## 📊 Usage

1. **Upload Data**: Use the file upload interface to upload GitHub Copilot usage data files (CSV or Excel format)
2. **Process Data**: The application automatically processes uploaded files using the Python backend
3. **View Analysis**: Review analysis results including:
   - Top utilizers
   - Under-utilized licenses
   - Licenses for reallocation
   - Usage statistics and trends
4. **Deep Dive Analytics**: Access detailed user analytics with:
   - Search and filtering capabilities
   - Individual user insights
   - Usage patterns and recommendations
5. **Download Results**: Download processed reports in Excel and HTML formats

## 🔍 Report Types

- **Excel Reports**: Comprehensive spreadsheets with license evaluation and user metrics
- **HTML Reports**: Interactive leaderboard with charts and visualizations
- **Analysis Dashboard**: Real-time insights with categorized user data
- **Deep Dive Analysis**: Individual user analytics with detailed recommendations

## 🌐 Access Information

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Routes**: Available at `/api/*` endpoints
- **File Processing**: Handled through `/api/analyze` endpoint
- **Deep Dive**: Accessible via `/api/deep-dive` endpoint

## 🔧 Troubleshooting

### Common Issues

1. **Dependency Installation Issues**
   - Use `yarn install --legacy-peer-deps` to resolve peer dependency conflicts
   - Ensure Node.js version is 18 or higher

2. **Python Processing Errors**
   - Verify Python dependencies are installed: `pip install -r python_backend/requirements.txt`
   - Check that uploaded files are in CSV or Excel format with proper column headers

3. **File Upload Issues**
   - Ensure files contain required columns for Copilot usage data
   - Check file format compatibility (CSV, XLS, XLSX)

4. **Session Storage Issues**
   - Sessions are stored in memory and will be lost on server restart
   - For persistent storage, consider implementing database integration

### Development Tips

- Use browser developer tools to monitor API calls and errors
- Check console logs for detailed error messages
- Temporary files are stored in `/temp/` directory during processing
- Analysis results are kept in memory via the analysis store

## 🎯 Key Features Explained

### File Processing Pipeline
1. Files uploaded through the web interface
2. Python backend processes data using pandas
3. Analysis results stored in memory
4. Excel and HTML reports generated
5. Deep dive analytics made available

### Deep Dive Analytics
- User search and filtering
- Individual user insights
- Usage recommendations
- Interactive data visualization

### Session Management
- In-memory storage for analysis results
- Temporary file handling
- No persistent database required

---

**Built for GitHub Copilot License Analysis and Optimization**
