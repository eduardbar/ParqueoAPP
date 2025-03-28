/**
 * 🧹 Herramienta de Limpieza de Logs para Producción - ParqueoAPP
 * 
 * Esta herramienta remueve o reemplaza console.log statements en el código
 * para optimizar el rendimiento en producción.
 * 
 * Funcionalidades:
 * - Detecta y reporta todos los console.log en el proyecto
 * - Opción de remover o comentar logs de desarrollo
 * - Preserva logs importantes (error, warn)
 * - Genera reporte de limpieza
 * 
 * Uso:
 * npm run clean:logs
 * 
 * @author ParqueoAPP Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class LogCleaner {
  constructor() {
    this.processed = [];
    this.errors = [];
    this.stats = {
      filesProcessed: 0,
      logsRemoved: 0,
      logsCommented: 0,
      errorsFound: 0
    };
  }

  /**
   * Ejecuta la limpieza de logs en el proyecto
   */
  async cleanProject() {
    console.log('🧹 Iniciando limpieza de logs para producción...\n');

    try {
      // Buscar archivos TypeScript y JavaScript
      const patterns = [
        'backend/src/**/*.ts',
        'backend/src/**/*.js',
        'frontend/src/**/*.ts',
        'frontend/src/**/*.tsx',
        'frontend/src/**/*.js',
        'frontend/src/**/*.jsx'
      ];

      const excludePatterns = [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.d.ts',
        '**/logger.ts', // Preservar el archivo de logger
        '**/clean-logs.js' // Preservar este archivo
      ];

      for (const pattern of patterns) {
        const files = glob.sync(pattern, { ignore: excludePatterns });
        
        for (const filePath of files) {
          await this.processFile(filePath);
        }
      }

      this.generateReport();

    } catch (error) {
      console.error('❌ Error durante la limpieza:', error.message);
      process.exit(1);
    }
  }

  /**
   * Procesa un archivo individual
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Detectar diferentes tipos de console statements
      const patterns = {
        // console.log básico
        log: /console\.log\s*\([^)]*\)\s*;?/g,
        // console.log con template strings
        logTemplate: /console\.log\s*\(`[^`]*`[^)]*\)\s*;?/g,
        // console.debug
        debug: /console\.debug\s*\([^)]*\)\s*;?/g,
        // console.info
        info: /console\.info\s*\([^)]*\)\s*;?/g
      };

      let newContent = content;
      let changes = 0;

      // Procesar cada patrón
      for (const [type, pattern] of Object.entries(patterns)) {
        const matches = [...content.matchAll(pattern)];
        
        for (const match of matches) {
          const statement = match[0];
          
          // Verificar si es un log importante que debe preservarse
          if (this.shouldPreserveLog(statement)) {
            continue;
          }

          // Comentar el log en lugar de eliminarlo (más seguro)
          const commented = `// PRODUCTION: Removed console.${type} - ${statement.replace(/\n/g, ' ')}`;
          newContent = newContent.replace(statement, commented);
          changes++;
          this.stats.logsCommented++;
        }
      }

      // Guardar archivo si hubo cambios
      if (changes > 0) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        this.processed.push({
          file: filePath,
          changes: changes
        });
        
        console.log(`✅ ${filePath}: ${changes} logs procesados`);
      }

      this.stats.filesProcessed++;

    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message
      });
      this.stats.errorsFound++;
      console.error(`❌ Error procesando ${filePath}: ${error.message}`);
    }
  }

  /**
   * Determina si un log debe preservarse
   */
  shouldPreserveLog(statement) {
    const preservePatterns = [
      /console\.error/,
      /console\.warn/,
      /Error:/,
      /WARNING:/,
      /CRITICAL:/,
      /SECURITY:/,
      // Preservar logs con comentarios específicos
      /\/\*\s*KEEP\s*\*\//,
      /\/\/\s*KEEP/
    ];

    return preservePatterns.some(pattern => pattern.test(statement));
  }

  /**
   * Genera reporte de limpieza
   */
  generateReport() {
    console.log('\n📊 REPORTE DE LIMPIEZA DE LOGS\n');
    console.log('================================');
    console.log(`📁 Archivos procesados: ${this.stats.filesProcessed}`);
    console.log(`🧹 Logs comentados: ${this.stats.logsCommented}`);
    console.log(`❌ Errores encontrados: ${this.stats.errorsFound}`);
    console.log('================================\n');

    if (this.processed.length > 0) {
      console.log('📋 Archivos modificados:');
      this.processed.forEach(item => {
        console.log(`   • ${item.file} (${item.changes} cambios)`);
      });
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log('⚠️  Errores encontrados:');
      this.errors.forEach(item => {
        console.log(`   • ${item.file}: ${item.error}`);
      });
      console.log('');
    }

    // Generar archivo de reporte
    const reportPath = 'log-cleanup-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      processed: this.processed,
      errors: this.errors
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Reporte detallado guardado en: ${reportPath}`);

    if (this.stats.logsCommented > 0) {
      console.log('\n✅ Limpieza completada. Los logs han sido comentados para producción.');
      console.log('💡 Tip: Puedes revertir los cambios con git si es necesario.');
    } else {
      console.log('\n✅ No se encontraron logs de desarrollo para limpiar.');
    }
  }

  /**
   * Revierte la limpieza (útil para desarrollo)
   */
  async revertCleaning() {
    console.log('🔄 Revirtiendo limpieza de logs...\n');

    // Esto requeriría un sistema de backup más sofisticado
    // Por ahora, sugerimos usar git revert
    console.log('Para revertir los cambios, usa:');
    console.log('git checkout -- .');
    console.log('o');
    console.log('git stash');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const cleaner = new LogCleaner();
  
  const command = process.argv[2];
  
  if (command === 'revert') {
    cleaner.revertCleaning();
  } else {
    cleaner.cleanProject();
  }
}

module.exports = LogCleaner;
