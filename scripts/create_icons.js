const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'icons', 'ingredients');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// -------------------------------------------------------------
// HERO ICONS (6 circular badges with champagne gold ring and plum line-art)
// -------------------------------------------------------------
const heroCircle = `
  <!-- Outer luxury ring -->
  <circle cx="64" cy="64" r="58" stroke="#c8963c" stroke-width="2.5" fill="none" opacity="0.85" />
  <circle cx="64" cy="64" r="55" stroke="#e8d5be" stroke-width="1" fill="#fffdfa" fill-opacity="0.4" />
`;

// 1. No Toxic Chemicals - Erlenmeyer flask with liquid and ban slash
const hero1Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="256" height="256">
  ${heroCircle}
  <g stroke="#1d052b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Flask lip -->
    <path d="M55 38h18" />
    <!-- Flask neck -->
    <path d="M57 38v12" />
    <path d="M71 38v12" />
    <!-- Flask body -->
    <path d="M57 50L40 82a5 5 0 0 0 4.4 7h39.2a5 5 0 0 0 4.4-7L71 50" />
    <!-- Liquid wave -->
    <path d="M47 72c5-3 11 3 17 0s11 3 17 0" stroke-width="2.8" opacity="0.7" />
    <!-- Bubbles -->
    <circle cx="60" cy="63" r="2.5" fill="#1d052b" stroke="none" />
    <circle cx="70" cy="76" r="2" fill="#1d052b" stroke="none" />
    <!-- Diagonal ban slash -->
    <line x1="38" y1="38" x2="90" y2="90" stroke="#1d052b" stroke-width="3.8" />
  </g>
</svg>
`;

// 2. No Parabens No Sulphates - Cosmetic pump/dropper bottle with ban slash
const hero2Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="256" height="256">
  ${heroCircle}
  <g stroke="#1d052b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Pump head -->
    <path d="M64 35v10" />
    <path d="M55 35h18" />
    <path d="M55 35c-4 0-7 3-7 6" />
    <!-- Cap collar -->
    <rect x="54" y="45" width="20" height="7" rx="2" />
    <!-- Bottle body -->
    <path d="M49 57a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v26a6 6 0 0 1-6 6H55a6 6 0 0 1-6-6V57z" />
    <!-- Fill line / botanical mark -->
    <path d="M56 68h16" stroke-width="2.5" opacity="0.6" />
    <!-- Diagonal ban slash -->
    <line x1="38" y1="38" x2="90" y2="90" stroke="#1d052b" stroke-width="3.8" />
  </g>
</svg>
`;

// 3. No Phthalates No Mineral Oils - Two lab test tubes with ban slash
const hero3Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="256" height="256">
  ${heroCircle}
  <g stroke="#1d052b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Left test tube -->
    <path d="M47 40h12" />
    <path d="M49 40v37a6 6 0 0 0 12 0V40" />
    <path d="M49 63h12" stroke-width="2.5" opacity="0.6" />
    <!-- Right test tube -->
    <path d="M67 40h12" />
    <path d="M69 40v37a6 6 0 0 0 12 0V40" />
    <path d="M69 67h12" stroke-width="2.5" opacity="0.6" />
    <!-- Diagonal ban slash -->
    <line x1="38" y1="38" x2="90" y2="90" stroke="#1d052b" stroke-width="3.8" />
  </g>
</svg>
`;

// 4. No Heavy Metals No Formaldehyde - Atom / molecular ring with ban slash
const hero4Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="256" height="256">
  ${heroCircle}
  <g stroke="#1d052b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Center nucleus -->
    <circle cx="64" cy="64" r="6" fill="#1d052b" stroke="none" />
    <!-- Orbit 1 (tilted 35 deg) -->
    <ellipse cx="64" cy="64" rx="27" ry="10" transform="rotate(-35 64 64)" stroke-width="3" />
    <!-- Orbit 2 (tilted -35 deg) -->
    <ellipse cx="64" cy="64" rx="27" ry="10" transform="rotate(35 64 64)" stroke-width="3" />
    <!-- Diagonal ban slash -->
    <line x1="38" y1="38" x2="90" y2="90" stroke="#1d052b" stroke-width="3.8" />
  </g>
</svg>
`;

// 5. No Carcinogenic Ingredients - Scientific microscope with ban slash
const hero5Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="256" height="256">
  ${heroCircle}
  <g stroke="#1d052b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Eyepiece angled -->
    <path d="M70 36l-12 18" stroke-width="4.5" />
    <circle cx="73" cy="32" r="3" fill="#1d052b" stroke="none" />
    <!-- Objective lens -->
    <path d="M56 57l-4 6" stroke-width="4" />
    <!-- Stage -->
    <path d="M43 68h24" stroke-width="3.5" />
    <!-- Arm / stand -->
    <path d="M68 47c7 5 9 14 6 22l-3 15" stroke-width="3.5" />
    <!-- Base -->
    <path d="M42 88h38" stroke-width="4" />
    <!-- Diagonal ban slash -->
    <line x1="38" y1="38" x2="90" y2="90" stroke="#1d052b" stroke-width="3.8" />
  </g>
</svg>
`;

// 6. 100% Safe For Everyday Use - Elegant heart with checkmark & delicate aura (NO slash!)
const hero6Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="256" height="256">
  ${heroCircle}
  <g stroke="#1d052b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Heart outline -->
    <path d="M64 88s-24-14.5-24-29c0-8 6.5-14.5 14.5-14.5 5 0 9.5 2.5 12 6.5 2.5-4 7-6.5 12-6.5 8 0 14.5 6.5 14.5 14.5 0 14.5-24 29-24 29z" stroke-width="3.5" />
    <!-- Checkmark inside -->
    <path d="M53 62l8 8 16-16" stroke-width="3.8" />
  </g>
</svg>
`;


// -------------------------------------------------------------
// PROMISE ICONS (5 pure radiant gold icons for dark purple container)
// -------------------------------------------------------------
const goldColor = "#d4a038";

// 1. Dermatologically Tested - Elegant face profile with gentle caring touch & dermatologist star
const promise1Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="192" height="192">
  <g stroke="${goldColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Gentle circular aura ring for consistency -->
    <circle cx="48" cy="48" r="38" stroke="${goldColor}" stroke-width="1.8" stroke-dasharray="3 5" opacity="0.35" />
    
    <!-- Graceful feminine face profile facing right -->
    <path d="M40 26c8-3 15 1 17 8 1 3.5 1 6.5-.5 9.5l2 1.5c1 .8.8 2.2-.4 2.6l-2.6 1c-.8 2-2 3.5-4 4.5l-1.5 5.5c-4 3.5-9 5-15 4.5" />
    <!-- Serene closed eyelash -->
    <path d="M47 36c1.5.8 3 .8 4.5 0" stroke-width="2.2" />
    <!-- Caring palm / thumb cupping the chin -->
    <path d="M28 58c4-2 9-2 13 1l4-2" />
    <path d="M31 66c5-2 11-2 16 2" opacity="0.6" stroke-width="2.5" />
    
    <!-- Dermatologist verification star at top right -->
    <path d="M68 22l1.5 3 3.5 1-2.5 2.5 1 3.5-3.5-2-3.5 2 1-3.5-2.5-2.5 3.5-1z" fill="${goldColor}" stroke="none" />
  </g>
</svg>
`;

// 2. Clinically Proven - Laboratory flask with measurement lines and clinical star
const promise2Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="192" height="192">
  <g stroke="${goldColor}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Flask lip -->
    <path d="M40 22h16" />
    <!-- Neck -->
    <path d="M42 22v12" />
    <path d="M54 22v12" />
    <!-- Triangular body -->
    <path d="M42 34L25 66a4 4 0 0 0 3.5 6h39a4 4 0 0 0 3.5-6L54 34" />
    <!-- Graduation marks -->
    <path d="M35 56h8" stroke-width="2.5" />
    <path d="M38 48h6" stroke-width="2.5" />
    <!-- Proven Clinical Star Badge top-right -->
    <path d="M68 20l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="${goldColor}" stroke="none" />
  </g>
</svg>
`;

// 3. Non-Irritating Formulas - Protective shield containing a pure soothing droplet
const promise3Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="192" height="192">
  <g stroke="${goldColor}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Outer elegant shield -->
    <path d="M48 18l24 9v18c0 16-11 27-24 31C35 72 24 61 24 45V27z" />
    <!-- Inner soothing water droplet -->
    <path d="M48 34c-6 8-9 12-9 16a9 9 0 0 0 18 0c0-4-3-8-9-16z" stroke-width="2.8" />
    <!-- Gentle calm leaf curve inside droplet -->
    <path d="M48 44c0 4-2 6-4 6" stroke-width="2" />
  </g>
</svg>
`;

// 4. Suitable For All Skin Types - Sacred geometry 4-petal bloom / 4 skin types harmony
const promise4Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="192" height="192">
  <g stroke="${goldColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Central pure core -->
    <circle cx="48" cy="48" r="5" fill="${goldColor}" stroke="none" />
    <!-- 4 harmonized petal lobes (representing oily, dry, normal, sensitive) -->
    <!-- North petal -->
    <path d="M48 43c-6-11-2-19 0-21 2 2 6 10 0 21z" />
    <!-- South petal -->
    <path d="M48 53c-6 11-2 19 0 21 2-2 6-10 0-21z" />
    <!-- East petal -->
    <path d="M53 48c11-6 19-2 21 0-2 2-10 6-21 0z" />
    <!-- West petal -->
    <path d="M43 48c-11-6-19-2-21 0 2 2 10 6 21 0z" />
    <!-- Subtle connecting orbital ring -->
    <circle cx="48" cy="48" r="18" stroke-dasharray="2 4" stroke-width="1.8" opacity="0.6" />
  </g>
</svg>
`;

// 5. Pregnancy Safe Formulas - Gentle maternal cradle & baby silhouette inside protective droplet
const promise5Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="192" height="192">
  <g stroke="${goldColor}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Outer maternal teardrop / seed -->
    <path d="M48 16c-16 20-22 30-22 40a22 22 0 0 0 44 0c0-10-6-20-22-40z" />
    <!-- Mother silhouette: head -->
    <circle cx="48" cy="38" r="4.5" />
    <!-- Mother silhouette: gentle pregnant belly and loving arm embrace -->
    <path d="M45 44c-5 2-8 7-8 13 0 7 5 12 12 12 6 0 10-4 10-9 0-4-3-8-8-9" />
    <!-- Little heart over womb -->
    <path d="M50 56a2 2 0 0 1 3 0 2 2 0 0 1 0 3l-3 3-3-3a2 2 0 0 1 0-3 2 2 0 0 1 3 0z" fill="${goldColor}" stroke="none" />
  </g>
</svg>
`;

const icons = [
  { name: 'hero_icon_1', svg: hero1Svg, size: 256 },
  { name: 'hero_icon_2', svg: hero2Svg, size: 256 },
  { name: 'hero_icon_3', svg: hero3Svg, size: 256 },
  { name: 'hero_icon_4', svg: hero4Svg, size: 256 },
  { name: 'hero_icon_5', svg: hero5Svg, size: 256 },
  { name: 'hero_icon_6', svg: hero6Svg, size: 256 },
  { name: 'promise_icon_1', svg: promise1Svg, size: 256 },
  { name: 'promise_icon_2', svg: promise2Svg, size: 256 },
  { name: 'promise_icon_3', svg: promise3Svg, size: 256 },
  { name: 'promise_icon_4', svg: promise4Svg, size: 256 },
  { name: 'promise_icon_5', svg: promise5Svg, size: 256 },
];

async function generate() {
  for (const item of icons) {
    const svgPath = path.join(outDir, `${item.name}.svg`);
    const pngPath = path.join(outDir, `${item.name}.png`);
    
    // Write SVG
    fs.writeFileSync(svgPath, item.svg.trim(), 'utf8');
    
    // Render ultra crisp PNG
    await sharp(Buffer.from(item.svg))
      .resize(item.size, item.size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(pngPath);
      
    console.log(`Generated: ${item.name}.svg and ${item.name}.png`);
  }
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
