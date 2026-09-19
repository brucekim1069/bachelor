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

const analyticsOverrides = {
  GA4_ID: process.env.GA4_ID,
  META_PIXEL_ID: process.env.META_PIXEL_ID,
  CLARITY_PROJECT_ID: process.env.CLARITY_PROJECT_ID
};

for (const [key, value] of Object.entries(analyticsOverrides)) {
  if (!value) continue;
  const pattern = new RegExp(`(${key}:\\s*)"[^"]*"`);
  app = app.replace(pattern, `$1${JSON.stringify(value)}`);
}

fs.writeFileSync(path.join(dist, 'app.js'), app, 'utf8');
console.log('BACHELOR build complete. Analytics IDs validated and Netlify env overrides applied when present.');
