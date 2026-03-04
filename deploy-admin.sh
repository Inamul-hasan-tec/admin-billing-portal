#!/bin/bash
# Admin Panel Deployment Script

echo "🚀 Starting Admin Panel Deployment..."

# Create .gitignore if it doesn't exist
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment
.env
.env.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

# Create .env.example
cat > .env.example << 'EOF'
# API Configuration
VITE_API_URL=https://your-backend-api.com/api
VITE_HOTELEMPIRE_API_URL=https://your-backend-api.com/api/hotelempire
EOF

echo "✅ Created .gitignore and .env.example"

# Initialize git if needed
if [ ! -d .git ]; then
    git init
    echo "✅ Initialized git repository"
fi

# Stage all files
git add .

# Commit
git commit -m "feat: Initial admin panel with Hotel Empire integration

Features:
- Order management with comprehensive filtering
- Hotel Empire orders section with orange highlighting
- Tomorrow's orders preview for inventory planning
- Status management for all order types
- Zoho-compatible CSV export (single and bulk)
- Order details modal with items display
- Search and filter functionality
- Delivery time tracking for Hotel Empire orders

Technical:
- React + Vite setup
- Tailwind CSS styling
- Axios for API calls
- Date-fns for date handling
- Lucide React icons"

echo "✅ Committed admin panel code"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. CREATE GITHUB REPO:"
echo "   - Go to: https://github.com/new"
echo "   - Name: billing-admin-panel"
echo "   - Description: Admin panel for billing software"
echo "   - Public/Private: Your choice"
echo "   - Don't initialize with README"
echo "   - Click 'Create repository'"
echo ""
echo "2. ADD REMOTE (replace YOUR_USERNAME):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/billing-admin-panel.git"
echo ""
echo "3. PUSH TO GITHUB:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. DEPLOY TO VERCEL:"
echo "   Option A - CLI:"
echo "     npm install -g vercel"
echo "     vercel login"
echo "     vercel"
echo "     vercel --prod"
echo ""
echo "   Option B - Dashboard:"
echo "     - Go to: https://vercel.com/dashboard"
echo "     - Click 'Add New Project'"
echo "     - Import billing-admin-panel repo"
echo "     - Set environment variables:"
echo "       VITE_API_URL = https://your-backend-api.com/api"
echo "       VITE_HOTELEMPIRE_API_URL = https://your-backend-api.com/api/hotelempire"
echo "     - Click Deploy"
echo ""
echo "5. ADD CUSTOM SUBDOMAIN:"
echo "   - In Vercel project settings → Domains"
echo "   - Add: admin.yourdomain.com"
echo "   - Update DNS with CNAME record:"
echo "     Type: CNAME"
echo "     Name: admin"
echo "     Value: cname.vercel-dns.com"
