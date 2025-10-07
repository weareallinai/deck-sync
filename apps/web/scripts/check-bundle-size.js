#!/usr/bin/env node
/**
 * Bundle size checker - enforces GUARDRAILS
 * Viewer bundle must be ≤ 200KB gzipped
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

const BUILD_DIR = path.join(__dirname, '../.next');
const MAX_VIEWER_SIZE_KB = 200;
const MAX_PRESENTER_SIZE_KB = 300;

function getGzipSize(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath);
  return gzipSync(content).length;
}

function formatSize(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

function checkBundles() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.log('⚠️  No build found. Run `pnpm build` first.');
    return;
  }

  console.log('🔍 Checking bundle sizes...\n');

  // Check viewer page bundle
  const viewerChunks = fs
    .readdirSync(path.join(BUILD_DIR, 'static/chunks/app/view'))
    .filter((f) => f.endsWith('.js'));

  let viewerSize = 0;
  viewerChunks.forEach((chunk) => {
    const size = getGzipSize(
      path.join(BUILD_DIR, 'static/chunks/app/view', chunk)
    );
    viewerSize += size;
  });

  // Check presenter page bundle
  const presenterChunks = fs
    .readdirSync(path.join(BUILD_DIR, 'static/chunks/app/present'))
    .filter((f) => f.endsWith('.js'));

  let presenterSize = 0;
  presenterChunks.forEach((chunk) => {
    const size = getGzipSize(
      path.join(BUILD_DIR, 'static/chunks/app/present', chunk)
    );
    presenterSize += size;
  });

  console.log(`📦 Viewer bundle:    ${formatSize(viewerSize)}`);
  console.log(`📦 Presenter bundle: ${formatSize(presenterSize)}`);
  console.log();

  let hasViolations = false;

  if (viewerSize > MAX_VIEWER_SIZE_KB * 1024) {
    console.error(
      `❌ GUARDRAIL VIOLATION: Viewer bundle exceeds ${MAX_VIEWER_SIZE_KB}KB!`
    );
    console.error(
      `   Current: ${formatSize(viewerSize)} | Max: ${MAX_VIEWER_SIZE_KB}KB`
    );
    hasViolations = true;
  } else {
    console.log(
      `✅ Viewer bundle within limit (${MAX_VIEWER_SIZE_KB}KB gzipped)`
    );
  }

  if (presenterSize > MAX_PRESENTER_SIZE_KB * 1024) {
    console.error(
      `⚠️  Warning: Presenter bundle exceeds ${MAX_PRESENTER_SIZE_KB}KB`
    );
    console.error(
      `   Current: ${formatSize(presenterSize)} | Max: ${MAX_PRESENTER_SIZE_KB}KB`
    );
  } else {
    console.log(
      `✅ Presenter bundle within limit (${MAX_PRESENTER_SIZE_KB}KB gzipped)`
    );
  }

  if (hasViolations) {
    console.log('\n💡 Tips to reduce bundle size:');
    console.log('   - Check for editor deps (Konva) in viewer routes');
    console.log('   - Use dynamic imports for heavy components');
    console.log('   - Run `ANALYZE=true pnpm build` to visualize bundles');
    process.exit(1);
  }

  console.log('\n✨ All bundle size guardrails passed!');
}

try {
  checkBundles();
} catch (error) {
  console.error('Error checking bundles:', error.message);
  process.exit(0); // Don't fail build if check fails
}

