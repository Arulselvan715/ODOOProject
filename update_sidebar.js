const fs = require('fs');
const path = require('path');

const files = [
  'dashboard.html',
  'myTrips.html',
  'createTrip.html',
  'profile.html',
  'settings.html',
  'trip.html',
  'social.html'
];

const inboxLink = '<a href="inbox.html" class="nav-link"><span class="nav-icon">📥</span> Inbox</a>';

files.forEach(file => {
  const filePath = path.join(__dirname, 'frontend', file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Only add if not already there
  if (content.includes('inbox.html')) return;

  // Insert before the Social link or after "Main" label
  if (content.includes('<div class="nav-section-label">Main</div>')) {
    content = content.replace(
      '<div class="nav-section-label">Main</div>',
      '<div class="nav-section-label">Main</div>\n      ' + inboxLink
    );
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});

console.log('Sidebar update complete.');
