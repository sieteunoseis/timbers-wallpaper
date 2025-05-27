// Simple iOS detection test

const userAgents = {
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.41 Mobile Safari/537.36',
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36'
};

function detectIOS(userAgent) {
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isIOSBrowser = isIOS || (isSafari && isIOS);
  
  console.log(`Testing: ${userAgent}`);
  console.log(`isIOS: ${isIOS}`);
  console.log(`isSafari: ${isSafari}`);
  console.log(`isIOSBrowser: ${isIOSBrowser}`);
  console.log('---');
}

console.log('iOS Detection Test');
console.log('=================');
detectIOS(userAgents.iphone);
detectIOS(userAgents.android);
detectIOS(userAgents.desktop);
