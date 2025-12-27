// Test API access
import { api } from './convex/_generated/api';

console.log('API object:', api);
console.log('API.auth:', api.auth);
console.log('API.auth.verifyResetToken:', api.auth?.verifyResetToken);

// Check all auth functions
if (api.auth) {
  console.log('All auth functions:', Object.keys(api.auth));
} else {
  console.log('ERROR: api.auth is undefined!');
}
