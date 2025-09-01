#!/usr/bin/env node

/**
 * Production Deployment Check Script
 * 
 * This script validates that the application is properly configured for production deployment.
 * Run with: node deployment-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Stellarium AI Production Deployment Check\n');

let issues = [];
let warnings = [];

// Check build output exists
console.log('📦 Checking build output...');
const distPublicPath = path.join(__dirname, 'dist', 'public');
const distIndexPath = path.join(__dirname, 'dist', 'index.js');

if (!fs.existsSync(distPublicPath)) {
  issues.push('❌ dist/public directory not found. Run "npm run build:vercel" first.');
} else {
  console.log('✅ Client build output found');
}

if (!fs.existsSync(distIndexPath)) {
  warnings.push('⚠️  dist/index.js not found. Run "npm run build" for Node.js deployment.');
} else {
  console.log('✅ Server build output found');
}

// Check required files
console.log('\n📋 Checking required files...');
const requiredFiles = [
  'package.json',
  'vercel.json',
  'api/serverless.ts',
  'server/index.ts',
  'server/config.ts',
  'DEPLOYMENT.md'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    issues.push(`❌ Missing required file: ${file}`);
  }
});

// Check package.json configuration
console.log('\n📋 Checking package.json configuration...');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  const requiredScripts = ['build', 'build:vercel', 'start', 'vercel-build'];
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`✅ Script "${script}" configured`);
    } else {
      issues.push(`❌ Missing script: ${script}`);
    }
  });

  // Check for required dependencies
  const requiredDeps = ['express', 'zod', 'drizzle-orm'];
  requiredDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      console.log(`✅ Dependency "${dep}" found`);
    } else {
      issues.push(`❌ Missing dependency: ${dep}`);
    }
  });

} catch (error) {
  issues.push('❌ Could not read package.json');
}

// Check Vercel configuration
console.log('\n📋 Checking Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
  
  if (vercelConfig.builds) {
    console.log('✅ Vercel builds configuration found');
  } else {
    warnings.push('⚠️  No builds configuration in vercel.json');
  }

  if (vercelConfig.routes) {
    console.log('✅ Vercel routes configuration found');
  } else {
    warnings.push('⚠️  No routes configuration in vercel.json');
  }

  if (vercelConfig.outputDirectory) {
    console.log('✅ Output directory configured');
  } else {
    warnings.push('⚠️  No output directory specified');
  }

} catch (error) {
  issues.push('❌ Could not read vercel.json');
}

// Check environment configuration
console.log('\n📋 Checking environment configuration...');
const envExample = path.join(__dirname, '.env.example');
if (fs.existsSync(envExample)) {
  console.log('✅ .env.example found');
  try {
    const envContent = fs.readFileSync(envExample, 'utf8');
    const requiredEnvVars = ['POSTGRES_URL', 'SESSION_SECRET', 'NODE_ENV'];
    
    requiredEnvVars.forEach(envVar => {
      if (envContent.includes(envVar)) {
        console.log(`✅ Environment variable "${envVar}" documented`);
      } else {
        warnings.push(`⚠️  Environment variable "${envVar}" not documented in .env.example`);
      }
    });
  } catch (error) {
    warnings.push('⚠️  Could not read .env.example');
  }
} else {
  warnings.push('⚠️  .env.example not found');
}

// Check TypeScript configuration
console.log('\n📋 Checking TypeScript configuration...');
try {
  const tsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8'));
  
  if (tsConfig.include && tsConfig.include.includes('api/**/*')) {
    console.log('✅ TypeScript includes API directory');
  } else {
    warnings.push('⚠️  TypeScript config may not include API directory');
  }

  if (tsConfig.compilerOptions && tsConfig.compilerOptions.skipLibCheck) {
    console.log('✅ TypeScript skipLibCheck enabled');
  } else {
    warnings.push('⚠️  Consider enabling skipLibCheck for faster builds');
  }

} catch (error) {
  warnings.push('⚠️  Could not read tsconfig.json');
}

// Display results
console.log('\n' + '='.repeat(50));
console.log('📊 Deployment Check Results');
console.log('='.repeat(50));

if (issues.length === 0) {
  console.log('🎉 No critical issues found!');
} else {
  console.log('🚨 Critical Issues:');
  issues.forEach(issue => console.log(`  ${issue}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`  ${warning}`));
}

console.log('\n📚 Next Steps:');
console.log('  1. Fix any critical issues above');
console.log('  2. Set up environment variables in your deployment platform');
console.log('  3. Test your deployment');
console.log('  4. Monitor the /api/health endpoint after deployment');
console.log('\n📖 For detailed instructions, see DEPLOYMENT.md');

// Exit with error code if there are critical issues
process.exit(issues.length > 0 ? 1 : 0);