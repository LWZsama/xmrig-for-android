const properties = require('java-properties');
const fs = require('fs');

const values = properties.of('version.properties');

const package = require('./package.json');

const newPackage = {
  ...package,
  version: `${values.getInt('majorVersion')}.${values.getInt('minorVersion')}.${values.getInt('patchVersion')}`,
};

fs.writeFileSync('./package.json', JSON.stringify(newPackage, null, 2));

const versionTS = `export const version = '${values.getInt('majorVersion')}.${values.getInt('minorVersion')}.${values.getInt('patchVersion')}';\n`;

fs.writeFileSync('./src/version.ts', versionTS);
