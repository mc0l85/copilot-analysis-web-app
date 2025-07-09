# Copilot Analysis Web App

A comprehensive web application for analyzing GitHub Copilot usage and performance metrics.

## Project Structure

- `/app` - Next.js frontend application with TypeScript and Tailwind CSS
- `/backend` - Python backend API for data processing
- Additional configuration and documentation files

## System Requirements

- **Operating System**: Ubuntu 20.04 LTS or later
- **RAM**: Minimum 4GB, recommended 8GB
- **Storage**: At least 2GB free space
- **Network**: Internet connection for package downloads

## Prerequisites

Before starting, ensure your Ubuntu system is up to date:

```bash
sudo apt update && sudo apt upgrade -y
```

## Installation Guide

### 1. Install Essential Build Tools

```bash
sudo apt install -y curl wget git build-essential software-properties-common
```

### 2. Install Node.js and npm

We recommend using Node Version Manager (nvm) for easy Node.js management:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your shell configuration
source ~/.bashrc

# Install Node.js (LTS version recommended)
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

**Alternative method using NodeSource repository:**

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install Python and Required Packages

```bash
# Install Python 3 and pip
sudo apt install -y python3 python3-pip python3-venv

# Install Python packages for data processing
pip3 install pandas openpyxl xlsxwriter numpy matplotlib seaborn requests flask flask-cors python-dotenv

# Verify Python installation
python3 --version
pip3 --version
```

### 4. Install Database Dependencies

This project uses Prisma with SQLite by default, but you may need PostgreSQL for production:

```bash
# Install SQLite (usually pre-installed)
sudo apt install -y sqlite3

# Optional: Install PostgreSQL if needed
sudo apt install -y postgresql postgresql-contrib
```

### 5. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/mc0l85/copilot-analysis-web-app.git

# Navigate to the project directory
cd copilot-analysis-web-app
```

### 6. Frontend Setup (Next.js Application)

```bash
# Navigate to the app directory
cd app

# Install Node.js dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Run database migrations (if applicable)
npx prisma db push
```

### 7. Environment Configuration

Create environment files for both frontend and backend:

**Frontend (.env.local in /app directory):**

```bash
cd app
cp .env.example .env.local  # if example exists, otherwise create manually
```

Create `.env.local` with the following content:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Add other environment variables as needed
```

**Backend (.env in /backend directory):**

```bash
cd ../backend
touch .env
```

Add backend-specific environment variables to `/backend/.env`:

```env
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL="sqlite:///copilot_analysis.db"
```

### 8. Backend Setup (Python API)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install backend dependencies (if requirements.txt exists)
# pip install -r requirements.txt

# If no requirements.txt, install common packages
pip install flask flask-cors pandas openpyxl requests python-dotenv
```

## Running the Application

### Start the Backend Server

```bash
# Navigate to backend directory and activate virtual environment
cd backend
source venv/bin/activate

# Start the Python backend (adjust filename as needed)
python3 app.py
# or
python3 main.py
# or
flask run
```

The backend should start on `http://localhost:5000` (or another port as configured).

### Start the Frontend Development Server

Open a new terminal window/tab:

```bash
# Navigate to the app directory
cd copilot-analysis-web-app/app

# Start the Next.js development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

To create a production build:

```bash
cd app
npm run build
npm start
```

## Usage Instructions

### Uploading Files

1. **Access the Application**: Open your browser and navigate to `http://localhost:3000`

2. **File Upload**: 
   - Look for the file upload component on the main dashboard
   - Supported formats: Excel files (.xlsx, .xls), CSV files
   - Click "Choose File" or drag and drop your Copilot usage data

3. **Data Processing**:
   - After upload, the system will process your data
   - View analytics and metrics on the dashboard
   - Export processed results if needed

### Key Features

- **Dashboard Analytics**: View comprehensive Copilot usage statistics
- **Data Visualization**: Interactive charts and graphs using Plotly.js and Chart.js
- **File Processing**: Upload and analyze Excel/CSV files containing Copilot data
- **Export Functionality**: Download processed data and reports
- **Responsive Design**: Works on desktop and mobile devices

## Troubleshooting

### Common Issues and Solutions

#### Node.js/npm Issues

**Problem**: `npm install` fails with permission errors
```bash
# Solution: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Problem**: Node.js version conflicts
```bash
# Solution: Use nvm to manage versions
nvm list
nvm use 18  # or your preferred version
```

#### Python Issues

**Problem**: `pip3 install` fails with permission errors
```bash
# Solution: Use virtual environment or --user flag
pip3 install --user package_name
# or create virtual environment as shown above
```

**Problem**: Python module not found
```bash
# Solution: Ensure virtual environment is activated
source backend/venv/bin/activate
pip install missing_package
```

#### Database Issues

**Problem**: Prisma client generation fails
```bash
# Solution: Regenerate Prisma client
cd app
npx prisma generate
npx prisma db push
```

**Problem**: Database connection errors
```bash
# Solution: Check DATABASE_URL in .env files
# Ensure database file permissions are correct
chmod 664 app/dev.db  # for SQLite
```

#### Port Conflicts

**Problem**: Port 3000 or 5000 already in use
```bash
# Solution: Kill processes using the ports
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5000 | xargs kill -9

# Or use different ports
npm run dev -- -p 3001  # for Next.js
# Modify backend port in Python code
```

#### File Upload Issues

**Problem**: File upload fails or times out
- Check file size limits in Next.js configuration
- Ensure backend server is running and accessible
- Verify file format is supported (.xlsx, .csv)
- Check browser console for JavaScript errors

#### Memory Issues

**Problem**: Application runs out of memory
```bash
# Solution: Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### Getting Help

1. **Check Logs**: Look at terminal output for error messages
2. **Browser Console**: Open Developer Tools (F12) to check for JavaScript errors
3. **File Permissions**: Ensure all files have proper read/write permissions
4. **Dependencies**: Verify all required packages are installed correctly

### System Resource Monitoring

```bash
# Monitor system resources
htop  # install with: sudo apt install htop
df -h  # check disk space
free -h  # check memory usage
```

## Development Notes

- The application uses TypeScript for type safety
- Tailwind CSS for styling with custom components
- Prisma ORM for database operations
- React Query for data fetching and caching
- NextAuth.js for authentication (if implemented)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]

---

For additional support or questions, please open an issue on the GitHub repository.
