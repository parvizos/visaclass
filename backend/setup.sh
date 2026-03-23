# Create uploads directory
mkdir -p uploads/documents

# Install backend dependencies
cd backend
npm install

# Copy environment variables and configure
cp .env.example .env

echo "Backend setup complete!"
echo "Please configure your .env file with:"
echo "- Firebase credentials"
echo "- Email service credentials"
echo "- Admin email address"
echo ""
echo "Then start the server with:"
echo "npm run dev (for development)"
echo "npm start (for production)"
