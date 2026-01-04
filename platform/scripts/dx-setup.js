#!/usr/bin/env node

/**
 * WARIS DevEx Setup Script
 * Sets up the local development environment
 */

import { execSync } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('');
  log(`━━━ ${title} ━━━`, 'cyan');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function run(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', cwd: ROOT, ...options });
    return true;
  } catch (e) {
    return false;
  }
}

function checkCommand(command) {
  try {
    execSync(`which ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  log('', 'bold');
  log('🚀 WARIS Development Environment Setup', 'bold');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  // Step 1: Check prerequisites
  section('1. Checking Prerequisites');

  const prerequisites = [
    { name: 'node', minVersion: '22.0.0' },
    { name: 'npm', minVersion: '10.0.0' },
    { name: 'python3', alias: 'python' },
    { name: 'docker' },
    { name: 'git' },
  ];

  let allPrereqsMet = true;
  for (const prereq of prerequisites) {
    if (checkCommand(prereq.name) || (prereq.alias && checkCommand(prereq.alias))) {
      success(`${prereq.name} is installed`);
    } else {
      error(`${prereq.name} is not installed`);
      allPrereqsMet = false;
    }
  }

  if (!allPrereqsMet) {
    error('Please install missing prerequisites and try again.');
    process.exit(1);
  }

  // Step 2: Install Node dependencies
  section('2. Installing Node.js Dependencies');
  if (run('npm install')) {
    success('Node.js dependencies installed');
  } else {
    error('Failed to install Node.js dependencies');
    process.exit(1);
  }

  // Step 3: Setup Git hooks
  section('3. Setting Up Git Hooks');
  if (run('npx husky')) {
    success('Husky Git hooks configured');
  } else {
    warning('Husky setup may need manual configuration');
  }

  // Step 4: Setup environment file
  section('4. Setting Up Environment');
  const envExample = resolve(ROOT, '.env.example');
  const envFile = resolve(ROOT, '.env');

  if (!existsSync(envFile) && existsSync(envExample)) {
    copyFileSync(envExample, envFile);
    success('Created .env file from .env.example');
    warning('Please update .env with your configuration');
  } else if (existsSync(envFile)) {
    success('.env file already exists');
  } else {
    warning('.env.example not found');
  }

  // Step 5: Setup Python environments
  section('5. Setting Up Python Environments');

  const pythonApps = ['api', 'ai'];
  for (const app of pythonApps) {
    const appDir = resolve(ROOT, 'apps', app);
    if (existsSync(resolve(appDir, 'pyproject.toml'))) {
      log(`Setting up ${app}...`);
      if (run('pip install -e ".[dev]"', { cwd: appDir })) {
        success(`${app} Python dependencies installed`);
      } else {
        warning(`${app} Python setup may need manual configuration`);
      }
    }
  }

  // Step 6: Verify setup
  section('6. Verification');
  success('Setup complete!');

  console.log('');
  log('━━━ Next Steps ━━━', 'cyan');
  console.log('');
  log('1. Update .env with your configuration', 'yellow');
  log('2. Start databases: docker-compose -f infra/docker/docker-compose.yml up -d', 'yellow');
  log('3. Start development: npm run dev', 'yellow');
  console.log('');
  log('Run "npm run dx:check" to verify all services are running.', 'cyan');
  console.log('');
}

main().catch((e) => {
  error(`Setup failed: ${e.message}`);
  process.exit(1);
});
