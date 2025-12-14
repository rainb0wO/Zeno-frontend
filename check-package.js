const fs = require('fs');
const path = require('path');

// Check package structure
const iconsPath = path.join(__dirname, 'node_modules', '@ant-design', 'icons');
console.log('Checking @ant-design/icons package structure...');
console.log('Package path:', iconsPath);
console.log('Directory exists:', fs.existsSync(iconsPath));

// Check lib directory
const libPath = path.join(iconsPath, 'lib');
console.log('lib/ directory exists:', fs.existsSync(libPath));

// Check es directory  
const esPath = path.join(iconsPath, 'es');
console.log('es/ directory exists:', fs.existsSync(esPath));

// List directory contents
if (fs.existsSync(iconsPath)) {
  console.log('Directory contents:', fs.readdirSync(iconsPath));
}

// Check package.json
const packageJsonPath = path.join(iconsPath, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = require(packageJsonPath);
  console.log('\nPackage.json main:', packageJson.main);
  console.log('Package.json module:', packageJson.module);
  console.log('Package.json exports:', packageJson.exports);
}
