import AutoSizerPkg from 'react-virtualized-auto-sizer';
console.log('Default:', AutoSizerPkg);
try {
  // dynamic import to check named export
  import('react-virtualized-auto-sizer').then(m => {
    console.log('Module keys:', Object.keys(m));
    console.log('AutoSizer named export:', m.AutoSizer);
  });
} catch(e) {
  console.log(e);
}
