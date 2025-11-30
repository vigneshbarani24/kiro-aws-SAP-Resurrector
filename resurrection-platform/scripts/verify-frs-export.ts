/**
 * Verify FRS Generator Export
 * 
 * Quick check to ensure FRSGenerator is properly exported
 */

import { FRSGenerator } from '../lib/generators';

console.log('✅ FRSGenerator successfully imported from lib/generators');
console.log('✅ Class type:', typeof FRSGenerator);
console.log('✅ Can instantiate:', new FRSGenerator() instanceof FRSGenerator);

const generator = new FRSGenerator();
console.log('✅ Methods available:');
console.log('  - generateFRS:', typeof generator.generateFRS);
console.log('  - formatBusinessLogic:', typeof generator.formatBusinessLogic);
console.log('  - formatTransformationMapping:', typeof generator.formatTransformationMapping);

console.log('\n🎉 FRSGenerator is properly exported and ready to use!');
