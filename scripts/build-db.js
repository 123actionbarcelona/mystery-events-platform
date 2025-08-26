#!/usr/bin/env node

/**
 * Script para construir la base de datos SQLite para deployment
 * Se ejecuta durante el build en Vercel
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building SQLite database for production...');

// Crear directorio prisma si no existe
const prismaDir = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

// Función para ejecutar comandos
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: "file:./prisma/database.db"
      }
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function buildDatabase() {
  try {
    console.log('📦 Generating Prisma Client...');
    await runCommand('npx', ['prisma', 'generate']);
    
    console.log('🗄️  Deploying migrations...');
    await runCommand('npx', ['prisma', 'migrate', 'deploy']);
    
    console.log('🌱 Seeding database...');
    await runCommand('npx', ['tsx', 'prisma/seed.ts']);
    
    console.log('✅ Database built successfully!');
    
    // Verificar que el archivo de base de datos existe
    const dbPath = path.join(process.cwd(), 'prisma', 'database.db');
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`📊 Database size: ${(stats.size / 1024).toFixed(2)}KB`);
    } else {
      throw new Error('Database file was not created');
    }
    
  } catch (error) {
    console.error('❌ Failed to build database:', error.message);
    process.exit(1);
  }
}

buildDatabase();