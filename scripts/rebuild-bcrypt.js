#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Checking bcrypt native module...');

// Define paths for pnpm
const pnpmBcryptPath = path.resolve(process.cwd(), 'node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib/binding');

let nativeModuleFound = false;

// Check if native module exists
if (fs.existsSync(pnpmBcryptPath)) {
  console.log('✅ bcrypt binding directory exists at:', pnpmBcryptPath);

  try {
    const files = fs.readdirSync(pnpmBcryptPath, { recursive: true });
    console.log('Files in binding directory:', files);

    // Look for bcrypt_lib.node
    const nativeModules = files.filter(file => file.endsWith('bcrypt_lib.node'));
    if (nativeModules.length > 0) {
      console.log('✅ Found native bcrypt modules:', nativeModules);
      nativeModuleFound = true;
    } else {
      console.log('❌ No native bcrypt modules found in binding directory');
    }
  } catch (err) {
    console.error('Error reading binding directory:', err);
  }
} else {
  console.log('❌ bcrypt binding directory does not exist at:', pnpmBcryptPath);
}

// If native module not found, rebuild bcrypt
if (!nativeModuleFound) {
  console.log('🔨 Rebuilding bcrypt native module...');
  try {
    execSync('pnpm rebuild bcrypt', { stdio: 'inherit' });
    console.log('✅ bcrypt successfully rebuilt');
  } catch (err) {
    console.error('❌ Failed to rebuild bcrypt:', err);
    process.exit(1);
  }
}

console.log('✅ bcrypt check completed');
