#!/usr/bin/env node

/**
 * Script para limpiar console.logs de desarrollo del código de producción
 * Uso: node clean-logs.js
 */

const fs = require('fs');
const path = require('path');

// Archivos y directorios a excluir
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '*.log',
  'clean-logs.js',
  '*.test.*',
  '*.spec.*',
  'seed.ts',
  'scripts',
  'test-*'
];

// Tipos de console que queremos mantener en producción
const KEEP_PATTERNS = [
  'console.error',
  'console.warn'
];

// Tipos de console que queremos remover
const REMOVE_PATTERNS = [
  /console\.log\([^)]*\);?\s*$/gm,
  /console\.debug\([^)]*\);?\s*$/gm,
  /console\.info\([^)]*\);?\s*$/gm,
  /console\.trace\([^)]*\);?\s*$/gm
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(path.basename(filePath));
    }
    return filePath.includes(pattern);
  });
}

function cleanConsoleLogsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let cleanedContent = content;
    let changesMade = false;

    // Aplicar patrones de limpieza
    REMOVE_PATTERNS.forEach(pattern => {
      const newContent = cleanedContent.replace(pattern, '');
      if (newContent !== cleanedContent) {
        changesMade = true;
        cleanedContent = newContent;
      }
    });

    // Si se hicieron cambios, escribir el archivo
    if (changesMade) {
      fs.writeFileSync(filePath, cleanedContent);
      console.log(`✅ Cleaned: ${filePath}`);
      return 1;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath) {
  let filesProcessed = 0;

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      
      if (shouldExcludeFile(fullPath)) {
        continue;
      }

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        filesProcessed += processDirectory(fullPath);
      } else if (stat.isFile() && /\.(js|ts|jsx|tsx)$/.test(item)) {
        filesProcessed += cleanConsoleLogsFromFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error.message);
  }

  return filesProcessed;
}

function main() {
  console.log('🧹 Cleaning console.logs from production code...\n');
  
  const rootDir = process.cwd();
  const filesProcessed = processDirectory(rootDir);
  
  console.log(`\n✅ Cleaning completed!`);
  console.log(`📊 Files processed: ${filesProcessed}`);
  
  if (filesProcessed > 0) {
    console.log('\n💡 Recommendation: Review the changes and commit them.');
  } else {
    console.log('\n🎉 No console.logs found to clean!');
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { cleanConsoleLogsFromFile, processDirectory };
