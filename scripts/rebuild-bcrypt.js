#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Checking bcrypt native module...');

// Define possible bcrypt paths - check both standard and pnpm paths
const possiblePaths = [
  // pnpm path
  path.resolve(process.cwd(), 'node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib/binding'),
  // Direct path
  path.resolve(process.cwd(), 'node_modules/bcrypt/lib/binding'),
];

let nativeModuleFound = false;

// Check all possible paths for the native module
for (const bcryptPath of possiblePaths) {
  if (fs.existsSync(bcryptPath)) {
    console.log('✅ bcrypt binding directory exists at:', bcryptPath);

    try {
      const files = fs.readdirSync(bcryptPath, { recursive: true });

      // Look for bcrypt_lib.node
      const nativeModules = files.filter(file => file.endsWith('bcrypt_lib.node'));
      if (nativeModules.length > 0) {
        console.log('✅ Found native bcrypt modules:', nativeModules);
        nativeModuleFound = true;
        break;
      } else {
        console.log('⚠️ No native bcrypt modules found in this binding directory');
      }
    } catch (err) {
      console.error('Error reading binding directory:', err);
    }
  } else {
    console.log('⚠️ bcrypt binding directory does not exist at:', bcryptPath);
  }
}

// If native module not found, rebuild bcrypt
if (!nativeModuleFound) {
  console.log('🔨 Rebuilding bcrypt native module...');
  try {
    execSync('pnpm rebuild bcrypt', { stdio: 'inherit' });
    console.log('✅ bcrypt successfully rebuilt');

    // Verify the rebuild was successful
    let rebuildSuccess = false;
    for (const bcryptPath of possiblePaths) {
      if (fs.existsSync(bcryptPath)) {
        try {
          const files = fs.readdirSync(bcryptPath, { recursive: true });
          const nativeModules = files.filter(file => file.endsWith('bcrypt_lib.node'));
          if (nativeModules.length > 0) {
            console.log('✅ Verified native bcrypt modules after rebuild:', nativeModules);
            rebuildSuccess = true;
            break;
          }
        } catch (err) {
          console.error('Error verifying rebuild:', err);
        }
      }
    }

    if (!rebuildSuccess) {
      console.log('⚠️ Could not verify successful rebuild, but continuing anyway');
    }
  } catch (err) {
    console.error('❌ Failed to rebuild bcrypt:', err);
    // Don't exit with error - let the process continue
    console.log('⚠️ Continuing despite rebuild failure');
  }
}

console.log('✅ bcrypt check completed');
