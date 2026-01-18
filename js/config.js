const hostname = window.location.hostname;
const protocol = window.location.protocol;

// Check if running on localhost, 127.0.0.1, or file protocol
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || protocol === 'file:';

const API_BASE_URL = isLocal ? 'http://localhost:3000' : '';

console.log('Detected environment:', isLocal ? 'Local' : 'Production');
console.log('API Base URL set to:', API_BASE_URL || 'Relative Path (Vercel/Production)');
