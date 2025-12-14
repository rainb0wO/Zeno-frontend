import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkPackageStructure() {
  try {
    // Check package structure
    const iconsPath = path.join(__dirname, 'node_modules', '@ant-design', 'icons');
    console.log('Checking @ant-design/icons package structure...');
    console.log('Package path:', iconsPath);
    
    // Check if directory exists
    try {
      await fs.access(iconsPath);
      console.log('Directory exists: true');
      
      // List directory contents
      const contents = await fs.readdir(iconsPath);
      console.log('Directory contents:', contents);
      
      // Check lib directory
      const libPath = path.join(iconsPath, 'lib');
      try {
        await fs.access(libPath);
        console.log('lib/ directory exists: true');
      } catch {
        console.log('lib/ directory exists: false');
      }
      
      // Check es directory  
      const esPath = path.join(iconsPath, 'es');
      try {
        await fs.access(esPath);
        console.log('es/ directory exists: true');
      } catch {
        console.log('es/ directory exists: false');
      }
      
      // Check package.json
      const packageJsonPath = path.join(iconsPath, 'package.json');
      try {
        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);
        console.log('\nPackage.json main:', packageJson.main);
        console.log('Package.json module:', packageJson.module);
        console.log('Package.json exports:', packageJson.exports);
      } catch (error) {
        console.error('Error reading package.json:', error.message);
      }
    } catch {
      console.log('Directory exists: false');
    }
  } catch (error) {
    console.error('Error checking package structure:', error.message);
  }
}

checkPackageStructure();
