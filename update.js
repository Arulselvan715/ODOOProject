const fs = require('fs');
const files = fs.readdirSync('frontend').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync('frontend/' + f, 'utf8');
  
  // Favicon
  if (!content.includes('<link rel="icon"')) {
    content = content.replace('</head>', '  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✈️</text></svg>">\n</head>');
  }
  
  // Sidebar (only on pages with sidebar)
  if (content.includes('nav-section-label">Main</div>') && !content.includes('social.html')) {
    content = content.replace(
      '<div class="nav-section-label">Main</div>',
      '<div class="nav-section-label">Main</div>\n      <a href="social.html" class="nav-link"><span class="nav-icon">🌍</span> Social</a>'
    );
  }
  
  fs.writeFileSync('frontend/' + f, content);
});
console.log('done');
