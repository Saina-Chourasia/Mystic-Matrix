const fs = require('fs');
const path = require('path');
const esbuild = require('../frontend/node_modules/.pnpm/node_modules/esbuild');
const React = require('../frontend/node_modules/react');
const ReactDOMServer = require('../frontend/node_modules/react-dom/server');

// 1. Transform PixelArt.jsx to CommonJS
const pixelArtPath = path.resolve(__dirname, '../frontend/src/components/PixelArt.jsx');
const sourceCode = fs.readFileSync(pixelArtPath, 'utf8');

const { code: transformedCode } = esbuild.transformSync(sourceCode, {
    loader: 'jsx',
    format: 'cjs',
    target: 'node18'
});

// 2. Evaluate module in context
const moduleExports = {};
const evaluateModule = new Function('require', 'module', 'exports', 'React', transformedCode);
const mockModule = { exports: moduleExports };
evaluateModule((modName) => {
    if (modName === 'react') return React;
    return require(modName);
}, mockModule, moduleExports, React);

const { PixelIcon } = mockModule.exports;
if (!PixelIcon) {
    throw new Error('PixelIcon not exported from PixelArt.jsx');
}

// 3. Mapping of item names to output SVG file names
const itemsToExport = [
    { name: 'Bat Wings', file: 'bat-wings.svg' },
    { name: 'Ghost Pepper', file: 'ghost-pepper.svg' },
    { name: 'Stardust', file: 'stardust.svg' },
    { name: 'Fairy Wings', file: 'fairy-wings.svg' },
    { name: 'Dragon Scales', file: 'dragon-scales.svg' },
    { name: 'Phoenix Feathers', file: 'phoenix-feathers.svg' },
    { name: 'Unicorn Hair', file: 'unicorn-hair.svg' },
    { name: 'Mandrake Roots', file: 'mandrake-roots.svg' },
    { name: 'Moon Dust', file: 'moon-dust.svg' },
    { name: 'Vampire Blood', file: 'vampire-blood.svg' },
    { name: 'Witch Hazel', file: 'witch-hazel.svg' },
    { name: 'Crystal Shards', file: 'crystal-shards.svg' },
    { name: 'Love Potion', file: 'love-potion.svg' },
    { name: 'Invisibility Potion', file: 'invisibility-potion.svg' },
    { name: 'Flying Potion', file: 'flying-potion.svg' },
    { name: 'Beauty Potion', file: 'beauty-potion.svg' },
    { name: 'Disguise Potion', file: 'disguise-potion.svg' },
    { name: 'Fame Potion', file: 'fame-potion.svg' },
    { name: 'Luck Potion', file: 'luck-potion.svg' },
    { name: 'Memory Potion', file: 'memory-potion.svg' },
    { name: 'Healing Potion', file: 'healing-potion.svg' },
    { name: 'Truth Serum', file: 'truth-serum.svg' },
    { name: 'PotionCrate', file: 'potion-crate.svg' },
    { name: 'Cauldron', file: 'cauldron.svg' },
    { name: 'Spellbook', file: 'spellbook.svg' },
    { name: 'Magic Wand', file: 'magic-wand.svg' },
    { name: 'WitchHat', file: 'witch-hat.svg' },
    // Fallbacks
    { name: 'Healing Potion', file: 'default-potion.svg' },
    { name: 'Healing Potion', file: 'default_potion.svg' },
    { name: 'Cauldron', file: 'default-ingredient.svg' }
];

const targetDirs = [
    path.resolve(__dirname, '../frontend/public/images'),
    path.resolve(__dirname, '../backend/public/images'),
    path.resolve('/tmp/staging-frontend/public/images'),
    path.resolve('/tmp/staging-backend/public/images')
];

for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

console.log('🔮 Generating original pixel-art standalone SVG assets...\n');

let count = 0;
for (const item of itemsToExport) {
    // Render icon with size 128
    const element = React.createElement(PixelIcon, { name: item.name, size: 128, className: 'magical-pixel-art' });
    let svgMarkup = ReactDOMServer.renderToStaticMarkup(element);
    
    // Ensure xmlns is present for standalone SVG files
    if (!svgMarkup.includes('xmlns=')) {
        svgMarkup = svgMarkup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    }

    for (const dir of targetDirs) {
        if (fs.existsSync(dir)) {
            const outPath = path.join(dir, item.file);
            fs.writeFileSync(outPath, svgMarkup, 'utf8');
        }
    }
    console.log(`  ✔ [${item.file}] Generated from "${item.name}"`);
    count++;
}

console.log(`\n✨ Successfully generated ${count} original pixel-art SVG assets across all directories!`);

