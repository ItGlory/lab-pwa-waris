#!/usr/bin/env node

/**
 * WARIS DevEx Health Check Script
 * Checks if all services are running correctly
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
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
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPort(port) {
  try {
    execSync(`lsof -i :${port}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function checkUrl(url, timeout = 3000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

function checkDocker() {
  try {
    execSync('docker info', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getDockerContainers() {
  try {
    const output = execSync('docker ps --format "{{.Names}}:{{.Status}}"', {
      stdio: 'pipe',
    }).toString();
    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [name, status] = line.split(':');
        return { name, status, running: status.includes('Up') };
      });
  } catch {
    return [];
  }
}

async function main() {
  log('');
  log('🔍 WARIS Health Check', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  const checks = [];

  // Check Node.js
  log('\n📦 Environment', 'cyan');
  try {
    const nodeVersion = execSync('node --version', { stdio: 'pipe' }).toString().trim();
    log(`  ✅ Node.js ${nodeVersion}`, 'green');
    checks.push({ name: 'Node.js', status: 'ok' });
  } catch {
    log('  ❌ Node.js not found', 'red');
    checks.push({ name: 'Node.js', status: 'error' });
  }

  try {
    const npmVersion = execSync('npm --version', { stdio: 'pipe' }).toString().trim();
    log(`  ✅ npm ${npmVersion}`, 'green');
  } catch {
    log('  ⚠️  npm not found', 'yellow');
  }

  // Check Python
  try {
    const pythonVersion = execSync('python3 --version', { stdio: 'pipe' }).toString().trim();
    log(`  ✅ ${pythonVersion}`, 'green');
    checks.push({ name: 'Python', status: 'ok' });
  } catch {
    log('  ❌ Python 3 not found', 'red');
    checks.push({ name: 'Python', status: 'error' });
  }

  // Check Docker
  log('\n🐳 Docker', 'cyan');
  if (checkDocker()) {
    log('  ✅ Docker is running', 'green');
    checks.push({ name: 'Docker', status: 'ok' });

    const containers = getDockerContainers();
    const warisContainers = containers.filter((c) => c.name.startsWith('waris-'));

    if (warisContainers.length > 0) {
      for (const container of warisContainers) {
        const icon = container.running ? '✅' : '❌';
        const color = container.running ? 'green' : 'red';
        log(`  ${icon} ${container.name} (${container.status})`, color);
      }
    } else {
      log('  ⚠️  No WARIS containers running', 'yellow');
      log('     Run: docker-compose -f infra/docker/docker-compose.yml up -d', 'gray');
    }
  } else {
    log('  ❌ Docker is not running', 'red');
    checks.push({ name: 'Docker', status: 'error' });
  }

  // Check services
  log('\n🌐 Services', 'cyan');

  const services = [
    { name: 'Web (Next.js)', port: 3000, url: 'http://localhost:3000' },
    { name: 'API (FastAPI)', port: 8000, url: 'http://localhost:8000/health' },
    { name: 'AI Service', port: 8001, url: 'http://localhost:8001/health' },
    { name: 'PostgreSQL', port: 5432 },
    { name: 'MongoDB', port: 27017 },
    { name: 'Redis', port: 6379 },
    { name: 'Milvus', port: 19530 },
    { name: 'Ollama', port: 11434, url: 'http://localhost:11434' },
  ];

  for (const service of services) {
    let isRunning = false;

    if (service.url) {
      isRunning = await checkUrl(service.url);
    } else {
      isRunning = checkPort(service.port);
    }

    if (isRunning) {
      log(`  ✅ ${service.name} (:${service.port})`, 'green');
      checks.push({ name: service.name, status: 'ok' });
    } else {
      log(`  ⚪ ${service.name} (:${service.port}) - not running`, 'gray');
      checks.push({ name: service.name, status: 'stopped' });
    }
  }

  // Check files
  log('\n📁 Configuration', 'cyan');

  const configFiles = [
    { path: '.env', name: 'Environment file' },
    { path: 'node_modules', name: 'Node modules' },
    { path: '.husky', name: 'Git hooks' },
  ];

  for (const file of configFiles) {
    const fullPath = resolve(ROOT, file.path);
    if (existsSync(fullPath)) {
      log(`  ✅ ${file.name}`, 'green');
    } else {
      log(`  ⚠️  ${file.name} missing`, 'yellow');
    }
  }

  // Summary
  log('\n━━━ Summary ━━━', 'cyan');
  const errors = checks.filter((c) => c.status === 'error');
  const stopped = checks.filter((c) => c.status === 'stopped');

  if (errors.length === 0) {
    log('✅ All critical checks passed!', 'green');
  } else {
    log(`❌ ${errors.length} critical issue(s) found`, 'red');
  }

  if (stopped.length > 0) {
    log(`⚪ ${stopped.length} service(s) not running`, 'gray');
  }

  console.log('');
}

main().catch(console.error);
