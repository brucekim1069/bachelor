const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const copyFiles = [
  'index.html',
  'styles.css',
  'bachelor_300g.webp',
  'bachelor_500g.webp',
  'bachelor_room_spray.webp',
  'bachelor_car_diffuser.webp'
];

for (const file of copyFiles) {
  fs.copyFileSync(path.join(__dirname, file), path.join(dist, file));
}

let app = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const replacements = [
  ['G-REPLACE_ME', process.env.GA4_ID],
  ['META_PIXEL_ID: "REPLACE_ME"', process.env.META_PIXEL_ID ? `META_PIXEL_ID: "${process.env.META_PIXEL_ID}"` : null],
  ['CLARITY_PROJECT_ID: "REPLACE_ME"', process.env.CLARITY_PROJECT_ID ? `CLARITY_PROJECT_ID: "${process.env.CLARITY_PROJECT_ID}"` : null]
];

if (process.env.GA4_ID) app = app.replace('G-REPLACE_ME', process.env.GA4_ID);
if (process.env.META_PIXEL_ID) app = app.replace('META_PIXEL_ID: "REPLACE_ME"', `META_PIXEL_ID: "${process.env.META_PIXEL_ID}"`);
if (process.env.CLARITY_PROJECT_ID) app = app.replace('CLARITY_PROJECT_ID: "REPLACE_ME"', `CLARITY_PROJECT_ID: "${process.env.CLARITY_PROJECT_ID}"`);

fs.writeFileSync(path.join(dist, 'app.js'), app, 'utf8');
console.log('BACHELOR build complete. Analytics IDs injected from Netlify env vars when present.');
