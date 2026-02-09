const rw = require('react-window');
console.log('react-window exports:', Object.keys(rw));

try {
  const as = require('react-virtualized-auto-sizer');
  console.log('react-virtualized-auto-sizer exports:', as);
  console.log('Is AutoSizer default?', as.default ? 'Yes' : 'No');
} catch (e) {
  console.log('Error loading auto-sizer:', e.message);
}
