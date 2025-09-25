require('dotenv').config();

console.log('🔍 DEBUG: Environment Variables Check');
console.log('=====================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI (first 50 chars):', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'UNDEFINED');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

if (!process.env.MONGODB_URI) {
  console.log('❌ ERROR: MONGODB_URI is not defined in .env file!');
  console.log('📝 Check if .env file exists and contains MONGODB_URI');
} else {
  console.log('✅ MONGODB_URI is properly loaded');
}
