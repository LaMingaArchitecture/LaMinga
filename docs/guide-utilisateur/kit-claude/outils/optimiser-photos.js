// Prépare des photos pour le site LaMinga, sans rien installer (macOS : JavaScript for Automation +
// Core Image). Même résultat que scripts/optimize-image.sh : rotation EXIF appliquée aux pixels,
// conversion vers sRGB, métadonnées retirées, grand côté limité, transparence sur fond blanc.
//
// Ligne de commande : osascript -l JavaScript optimiser-photos.js <fichier ou dossier>…
// Application : osacompile -l JavaScript -o "Optimiser pour le web.app" optimiser-photos.js
//               puis glisser des photos ou des dossiers sur l'icône.
//
// Chaque fichier est écrit dans un sous-dossier « web » à côté de l'original, en .jpg, avec un nom
// sans accents ni espaces (le nom fait partie de l'adresse de l'image sur le site).

ObjC.import('Foundation');
ObjC.import('CoreImage');
ObjC.import('CoreGraphics');

const MAX_EDGE = 2560;
const PHOTO_QUALITY = 0.82;
// Un dessin au trait (plan) supporte mal la compression : les traits fins bavent.
const DRAWING_QUALITY = 0.9;
// En dessous, la photo sera floue en plein écran.
const MIN_SHARP_EDGE = 1100;
const OUTPUT_DIR = 'web';
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'tif', 'tiff', 'webp'];

const fm = $.NSFileManager.defaultManager;

function isDirectory(path) {
  const isDir = Ref();
  return fm.fileExistsAtPathIsDirectory(path, isDir) && isDir[0];
}

function extensionOf(path) {
  const dot = path.lastIndexOf('.');
  return dot < 0 ? '' : path.slice(dot + 1).toLowerCase();
}

function webName(path) {
  const base = path
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '');
  const clean = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${clean || 'image'}.jpg`;
}

function collectImages(path, found) {
  if (isDirectory(path)) {
    if (path.split('/').pop() === OUTPUT_DIR) return;
    const names = ObjC.deepUnwrap(fm.contentsOfDirectoryAtPathError(path, null)) || [];
    names
      .filter((n) => !n.startsWith('.'))
      .sort()
      .forEach((n) => collectImages(`${path}/${n}`, found));
  } else if (IMAGE_EXTENSIONS.includes(extensionOf(path))) {
    found.push(path);
  }
}

function optimise(src) {
  const outDir = `${src.slice(0, src.lastIndexOf('/'))}/${OUTPUT_DIR}`;
  fm.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(outDir, true, $(), null);
  const dest = `${outDir}/${webName(src)}`;

  const readOptions = $.NSDictionary.dictionaryWithObjectForKey(
    $.NSNumber.numberWithBool(true),
    'kCIImageApplyOrientationProperty',
  );
  let img = $.CIImage.imageWithContentsOfURLOptions($.NSURL.fileURLWithPath(src), readOptions);
  if (img.isNil()) return { src, error: 'illisible' };

  const width = img.extent.size.width;
  const height = img.extent.size.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  if (scale < 1) {
    const filter = $.CIFilter.filterWithName('CILanczosScaleTransform');
    filter.setValueForKey(img, 'inputImage');
    filter.setValueForKey($.NSNumber.numberWithDouble(scale), 'inputScale');
    filter.setValueForKey($.NSNumber.numberWithDouble(1), 'inputAspectRatio');
    img = filter.valueForKey('outputImage');
  }
  const white = $.CIImage.imageWithColor(
    $.CIColor.colorWithRedGreenBlue(1, 1, 1),
  ).imageByCroppingToRect(img.extent);
  img = img.imageByCompositingOverImage(white).imageBySettingProperties($.NSDictionary.dictionary);

  const quality = /plan/i.test(src.split('/').pop()) ? DRAWING_QUALITY : PHOTO_QUALITY;
  const writeOptions = $.NSDictionary.dictionaryWithObjectForKey(
    $.NSNumber.numberWithDouble(quality),
    'kCGImageDestinationLossyCompressionQuality',
  );
  const context = $.CIContext.contextWithOptions($.NSDictionary.dictionary);
  const srgb = $.CGColorSpaceCreateWithName($.kCGColorSpaceSRGB);
  const ok = context.writeJPEGRepresentationOfImageToURLColorSpaceOptionsError(
    img,
    $.NSURL.fileURLWithPath(dest),
    srgb,
    writeOptions,
    null,
  );
  if (!ok) return { src, error: 'écriture impossible' };

  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);
  const size = ObjC.unwrap(fm.attributesOfItemAtPathError(dest, null).fileSize);
  return {
    src,
    dest,
    width: outW,
    height: outH,
    kb: Math.round(size / 1024),
    blurry: Math.max(outW, outH) < MIN_SHARP_EDGE,
  };
}

function processAll(paths) {
  const images = [];
  paths.forEach((p) => collectImages(p, images));
  return images.map(optimise);
}

function summary(results) {
  const done = results.filter((r) => !r.error);
  const lines = [`${done.length} image(s) prête(s) dans les dossiers « ${OUTPUT_DIR} ».`];
  done
    .filter((r) => r.blurry)
    .forEach((r) =>
      lines.push(
        `⚠ Trop petite (${r.width}×${r.height}), floue en plein écran : ${r.src.split('/').pop()}`,
      ),
    );
  results
    .filter((r) => r.error)
    .forEach((r) => lines.push(`✗ ${r.error} : ${r.src.split('/').pop()}`));
  return lines.join('\n');
}

// Glisser-déposer sur l'application.
function openDocuments(docs) {
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const results = processAll(docs.map((d) => d.toString()));
  app.displayDialog(
    results.length
      ? summary(results)
      : 'Aucune image trouvée (formats acceptés : JPG, PNG, HEIC, TIFF, WebP).',
    {
      withTitle: 'Optimiser pour le web — LaMinga',
      buttons: ['OK'],
      defaultButton: 'OK',
    },
  );
}

// Ligne de commande : une ligne par image (source → destination, dimensions, poids).
function run(argv) {
  if (!argv || argv.length === 0) {
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;
    app.displayDialog(
      'Glissez des photos ou un dossier sur cette icône pour les préparer pour le site.',
      {
        withTitle: 'Optimiser pour le web — LaMinga',
        buttons: ['OK'],
        defaultButton: 'OK',
      },
    );
    return '';
  }
  const results = processAll(argv);
  const rows = results.map((r) =>
    r.error
      ? `ERREUR ${r.error} | ${r.src}`
      : `${r.dest} | ${r.width}x${r.height} | ${r.kb} Ko${r.blurry ? ' | TROP PETITE' : ''}`,
  );
  return rows.concat(['', summary(results)]).join('\n');
}
