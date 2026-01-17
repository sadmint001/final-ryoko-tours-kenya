const puppeteer = require('puppeteer');
const fs = require('fs');

async function runPerformanceTest() {
  console.log('🚀 Starting Performance Test...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Enable performance monitoring
  await page.setCacheEnabled(false);

  try {
    // Test initial page load
    console.log('📊 Testing Initial Page Load...');
    const startTime = Date.now();

    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const loadTime = Date.now() - startTime;
    console.log(`✅ Initial page load: ${loadTime}ms`);

    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart
      };
    });

    console.log('📈 Performance Metrics:');
    console.log(`   DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`   Load Complete: ${performanceMetrics.loadComplete}ms`);
    console.log(`   Total Load Time: ${performanceMetrics.totalTime}ms\n`);

    // Test lazy loading
    console.log('🖼️ Testing Image Lazy Loading...');
    const images = await page.$$('img');
    console.log(`   Found ${images.length} images on page`);

    // Check for lazy loading attributes
    const lazyImages = await page.$$('img[loading="lazy"]');
    console.log(`   Images with lazy loading: ${lazyImages.length}`);

    // Test navigation performance
    console.log('🧭 Testing Navigation Performance...');
    const navStart = Date.now();
    await page.click('a[href="/destinations"]');
    await page.waitForSelector('.min-h-screen', { timeout: 10000 });
    const navTime = Date.now() - navStart;
    console.log(`✅ Navigation to destinations: ${navTime}ms`);

    // Test bundle sizes (from build output)
    console.log('📦 Bundle Size Analysis:');
    try {
      const stats = fs.readFileSync('./dist/index.html', 'utf8');
      const jsMatches = stats.match(/\/assets\/.*\.js/g);
      const cssMatches = stats.match(/\/assets\/.*\.css/g);

      console.log(`   JavaScript bundles: ${jsMatches ? jsMatches.length : 0}`);
      console.log(`   CSS bundles: ${cssMatches ? cssMatches.length : 0}`);
    } catch (error) {
      console.log('   Could not analyze bundle sizes (build may still be running)');
    }

    // Memory usage
    console.log('💾 Memory Usage:');
    const memoryInfo = await page.metrics();
    console.log(`   JS Heap Used: ${(memoryInfo.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   JS Heap Total: ${(memoryInfo.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n✅ Performance Test Complete!');
    console.log('🎯 Key Performance Indicators:');
    console.log(`   • Initial Load: ${loadTime < 3000 ? '✅ Fast' : loadTime < 5000 ? '⚠️ Moderate' : '❌ Slow'} (${loadTime}ms)`);
    console.log(`   • Navigation: ${navTime < 1000 ? '✅ Fast' : navTime < 2000 ? '⚠️ Moderate' : '❌ Slow'} (${navTime}ms)`);
    console.log(`   • Lazy Loading: ${lazyImages.length > 0 ? '✅ Enabled' : '❌ Not detected'}`);
    console.log(`   • Memory Usage: ${(memoryInfo.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
runPerformanceTest().catch(console.error);
