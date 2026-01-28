const fs = require('fs');
const path = require('path');

/**
 * 复制 dbgate 文件到 dist 目录
 * 用于打包后的应用能够找到 dbgate 的文件
 */
function copyDbgateFiles() {
  const projectRoot = path.resolve(__dirname, '..');
  const distDir = path.join(projectRoot, 'dist');
  const dbgateSource = path.join(projectRoot, 'dbgate-master');
  const dbgateDest = path.join(distDir, 'dbgate-master');

  console.log('Copying dbgate files to dist...');
  console.log('Source:', dbgateSource);
  console.log('Destination:', dbgateDest);

  // 需要复制的目录和文件
  const itemsToCopy = [
    // API bundle
    {
      src: 'packages/api/dist',
      dest: 'packages/api/dist',
      description: 'API bundle'
    },
    // Web public files
    {
      src: 'app/packages/web/public',
      dest: 'app/packages/web/public',
      description: 'Web public files'
    },
    // Plugins
    {
      src: 'plugins',
      dest: 'plugins',
      description: 'Plugins'
    },
    // App packages (如果已经构建)
    {
      src: 'app/packages',
      dest: 'app/packages',
      description: 'App packages (if built)',
      optional: true
    }
  ];

  // 确保目标目录存在
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 复制每个项目
  itemsToCopy.forEach(item => {
    const srcPath = path.join(dbgateSource, item.src);
    const destPath = path.join(dbgateDest, item.dest);

    if (!fs.existsSync(srcPath)) {
      if (item.optional) {
        console.log(`⚠ Skipping optional: ${item.description} (not found)`);
        return;
      }
      console.warn(`⚠ Warning: ${item.description} not found at: ${srcPath}`);
      return;
    }

    try {
      // 确保目标目录存在
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // 复制文件或目录
      if (fs.statSync(srcPath).isDirectory()) {
        copyDirectory(srcPath, destPath);
        console.log(`✓ Copied: ${item.description}`);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✓ Copied: ${item.description}`);
      }
    } catch (error) {
      console.error(`✗ Failed to copy ${item.description}:`, error.message);
    }
  });

  console.log('✓ Dbgate files copied to dist');
}

/**
 * 递归复制目录
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 执行复制
if (require.main === module) {
  copyDbgateFiles();
}

module.exports = { copyDbgateFiles };

