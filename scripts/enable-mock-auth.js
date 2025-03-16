import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths to the files we need to modify
const useAuthPath = path.join(__dirname, '..', 'src', 'lib', 'hooks', 'useAuth.ts');
const authServicePath = path.join(__dirname, '..', 'src', 'lib', 'services', 'auth.service.ts');
const profileServicePath = path.join(__dirname, '..', 'src', 'lib', 'services', 'profile.service.ts');

// Read the current files
const useAuthContent = fs.readFileSync(useAuthPath, 'utf8');
const authServiceContent = fs.readFileSync(authServicePath, 'utf8');
const profileServiceContent = fs.readFileSync(profileServicePath, 'utf8');

// Create backup files
fs.writeFileSync(`${useAuthPath}.bak`, useAuthContent);
fs.writeFileSync(`${authServicePath}.bak`, authServiceContent);
fs.writeFileSync(`${profileServicePath}.bak`, profileServiceContent);

console.log('Created backup files');

// Modify the auth.service.ts file to use the mock service
const newAuthServiceContent = authServiceContent.replace(
  '// Always use the real auth service\nexport const authService = new SupabaseAuthService();',
  '// Use the mock auth service for testing\nimport { mockAuthService } from \'./mock-auth.service\';\nexport const authService = mockAuthService;'
);

// Modify the profile.service.ts file to use the mock service
const newProfileServiceContent = profileServiceContent.replace(
  '// Always use the real profile service\nexport const profileService = new SupabaseProfileService();',
  '// Use the mock profile service for testing\nimport { mockProfileService } from \'./mock-profile.service\';\nexport const profileService = mockProfileService;'
);

// Write the modified files
fs.writeFileSync(authServicePath, newAuthServiceContent);
fs.writeFileSync(profileServicePath, newProfileServiceContent);

console.log('Modified service files to use mock services');
console.log('Restart the development server to apply changes');
