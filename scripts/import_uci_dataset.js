const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const datasetImportService = require('../backend/services/datasetImportService');

async function main() {
    const force = process.argv.includes('--force');
    const sampleArg = process.argv.find(a => a.startsWith('--sample='));
    const sampleLimit = sampleArg ? parseInt(sampleArg.split('=')[1], 10) : null;

    console.log('🔮 Mystic Matrix — UCI Online Retail II Import Tool');
    console.log(`Source: https://archive.ics.uci.edu/dataset/502/online+retail+ii`);
    console.log(`Attribution: Chen, D. (2012). Online Retail II [Dataset]. UCI Machine Learning Repository.`);
    console.log(`Options: force=${force}, sampleLimit=${sampleLimit || 'ALL (1,067,371 rows)'}\n`);

    const startTime = Date.now();
    try {
        const result = await datasetImportService.runImportPipeline({ force, sampleLimit });
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✨ Result:`, result.message);
        console.log(`⏱ Time taken: ${elapsedSec}s\n`);
    } catch (err) {
        console.error('❌ Import failed:', err.message);
        process.exit(1);
    }
}

main();

