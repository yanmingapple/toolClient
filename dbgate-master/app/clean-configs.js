const fs = require('fs');
const path = require('path');

function deleteConfigFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        // Check if it's a symbolic link
        if (stat.isSymbolicLink()) {
          // Don't follow symbolic links to avoid accessing files outside app directory
          return;
        }
        if (stat.isDirectory()) {
          deleteConfigFiles(filePath);
        } else if (
          file === 'jest.config.js' ||
          file === 'webpack.config.js' ||
          file === 'rollup.config.js' ||
          file === 'vite.config.js' ||
          file === 'tsconfig.json' ||
          file.startsWith('.eslintrc') ||
          file.startsWith('.prettierrc')
        ) {
          fs.unlinkSync(filePath);
          console.log('Deleted:', filePath);
        }
      } catch (err) {
        // Ignore errors
      }
    });
  } catch (err) {
    // Ignore errors
  }
}

function cleanConfigs() {
  // Clean config files in dbgate-* packages in node_modules
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    const files = fs.readdirSync(nodeModulesPath);
    files.forEach(file => {
      if (file.startsWith('dbgate-')) {
        const packagePath = path.join(nodeModulesPath, file);
        try {
          const stat = fs.statSync(packagePath);
          // If it's a symbolic link, also clean the target directory
          if (stat.isSymbolicLink()) {
            try {
              const targetPath = fs.readlinkSync(packagePath);
              const resolvedPath = path.isAbsolute(targetPath) 
                ? targetPath 
                : path.resolve(path.dirname(packagePath), targetPath);
              console.log('Cleaning symbolic link target:', resolvedPath);
              if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
                deleteConfigFiles(resolvedPath);
              }
            } catch (err) {
              console.log('Error reading symlink:', err.message);
            }
          } else if (stat.isDirectory()) {
            deleteConfigFiles(packagePath);
          }
        } catch (err) {
          // Ignore errors
        }
      }
    });
  }
  
  // Also clean config files in packages directory (workspace packages)
  const packagesPath = path.join(__dirname, '..', 'packages');
  if (fs.existsSync(packagesPath)) {
    const files = fs.readdirSync(packagesPath);
    files.forEach(file => {
      if (file.startsWith('dbgate-') || file === 'datalib' || file === 'tools' || file === 'sqltree') {
        const packagePath = path.join(packagesPath, file);
        try {
          const stat = fs.statSync(packagePath);
          if (stat.isDirectory()) {
            deleteConfigFiles(packagePath);
          }
        } catch (err) {
          // Ignore errors
        }
      }
    });
  }
  
  console.log('Config files cleaned');
}

// If called directly (not as electron-builder hook)
if (require.main === module) {
  cleanConfigs();
}

// Export for electron-builder beforePack hook
module.exports = cleanConfigs;

