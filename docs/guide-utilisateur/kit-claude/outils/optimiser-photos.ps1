# Prépare des photos pour le site LaMinga, sans rien installer (Windows : PowerShell + moteur image
# de Windows). Même résultat que optimiser-photos.js (Mac) : rotation EXIF appliquée aux pixels,
# conversion vers sRGB, métadonnées retirées, grand côté limité, transparence sur fond blanc.
#
# Ligne de commande :
#   powershell -NoProfile -ExecutionPolicy Bypass -File optimiser-photos.ps1 <fichier ou dossier>…
# Raccourci sur le bureau (glisser des photos ou des dossiers sur l'icône) :
#   powershell -NoProfile -ExecutionPolicy Bypass -File optimiser-photos.ps1 -Installer
#
# Chaque fichier est écrit dans un sous-dossier « web » à côté de l'original, en .jpg, avec un nom
# sans accents ni espaces (le nom fait partie de l'adresse de l'image sur le site).
#
# Ce fichier doit rester en UTF-8 avec BOM : sans BOM, Windows PowerShell 5.1 le lit en ANSI et
# abîme les accents des messages.

[CmdletBinding()]
param(
  [switch]$Installer,
  [switch]$Fenetre,
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Chemins
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationCore, WindowsBase, PresentationFramework

$MAX_EDGE = 2560
$PHOTO_QUALITY = 82
# Un dessin au trait (plan) supporte mal la compression : les traits fins bavent.
$DRAWING_QUALITY = 90
# En dessous, la photo sera floue en plein écran.
$MIN_SHARP_EDGE = 1100
$OUTPUT_DIR = 'web'
$IMAGE_EXTENSIONS = @('.jpg', '.jpeg', '.png', '.heic', '.heif', '.tif', '.tiff', '.webp')
$TITLE = 'Optimiser pour le web — LaMinga'
$SHORTCUT_NAME = 'Optimiser pour le web.lnk'
$EXIF_ORIENTATION_QUERIES = @('System.Photo.Orientation', '/app1/ifd/{ushort=274}', '/ifd/{ushort=274}')

function Show-Message([string]$text) {
  [void][System.Windows.MessageBox]::Show($text, $TITLE, 'OK', 'Information')
}

function Get-WebName([string]$path) {
  $base = [IO.Path]::GetFileNameWithoutExtension($path).Normalize([Text.NormalizationForm]::FormD)
  $clean = ($base -replace '\p{Mn}', '').ToLowerInvariant() -replace '[^a-z0-9]+', '-'
  $clean = $clean.Trim('-')
  if (-not $clean) { $clean = 'image' }
  "$clean.jpg"
}

function Add-Images([string]$path, [System.Collections.Generic.List[string]]$found) {
  $item = Get-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
  if (-not $item) { return }
  if ($item.PSIsContainer) {
    if ($item.Name -eq $OUTPUT_DIR) { return }
    Get-ChildItem -LiteralPath $item.FullName -Force |
      Where-Object { -not $_.Name.StartsWith('.') -and -not ($_.Attributes -band [IO.FileAttributes]::Hidden) } |
      Sort-Object Name |
      ForEach-Object { Add-Images $_.FullName $found }
  } elseif ($IMAGE_EXTENSIONS -contains $item.Extension.ToLowerInvariant()) {
    $found.Add($item.FullName)
  }
}

function Get-Orientation($frame) {
  $metadata = $frame.Metadata -as [System.Windows.Media.Imaging.BitmapMetadata]
  if (-not $metadata) { return 1 }
  foreach ($query in $EXIF_ORIENTATION_QUERIES) {
    try {
      $value = $metadata.GetQuery($query)
      if ($null -ne $value) { return [int]$value }
    } catch {
      continue
    }
  }
  1
}

# Rotation (sens horaire) puis miroir, dans cet ordre, pour chaque valeur d'orientation EXIF.
function Get-OrientationTransform([int]$orientation) {
  $steps = switch ($orientation) {
    2 { @(0, 'h') }
    3 { @(180, '') }
    4 { @(0, 'v') }
    5 { @(90, 'h') }
    6 { @(90, '') }
    7 { @(90, 'v') }
    8 { @(270, '') }
    default { @(0, '') }
  }
  $group = New-Object System.Windows.Media.TransformGroup
  if ($steps[0]) { $group.Children.Add((New-Object System.Windows.Media.RotateTransform($steps[0]))) }
  if ($steps[1] -eq 'h') { $group.Children.Add((New-Object System.Windows.Media.ScaleTransform(-1, 1))) }
  if ($steps[1] -eq 'v') { $group.Children.Add((New-Object System.Windows.Media.ScaleTransform(1, -1))) }
  $group
}

function Read-Frame([string]$src) {
  $stream = [IO.File]::OpenRead($src)
  try {
    # Sans IgnoreColorProfile, WPF convertit les pixels vers sRGB d'après le profil ICC embarqué
    # (Display P3 des iPhone, Adobe RGB…) ; une image sans profil est supposée déjà sRGB.
    $decoder = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
      $stream,
      [System.Windows.Media.Imaging.BitmapCreateOptions]::None,
      [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
    # Première image seulement (TIFF multipage). L'orientation se lit avant de fermer le fichier.
    $frame = $decoder.Frames[0]
    @{ Frame = $frame; Orientation = Get-Orientation $frame }
  } finally {
    $stream.Dispose()
  }
}

# Fond blanc pour une capture ou un dessin transparent ; le résultat est opaque, en Bgr24.
function Merge-OnWhite($source) {
  $width = $source.PixelWidth
  $height = $source.PixelHeight
  $rect = New-Object System.Windows.Rect(0, 0, $width, $height)
  $visual = New-Object System.Windows.Media.DrawingVisual
  $context = $visual.RenderOpen()
  $context.DrawRectangle([System.Windows.Media.Brushes]::White, $null, $rect)
  $context.DrawImage($source, $rect)
  $context.Close()
  $target = New-Object System.Windows.Media.Imaging.RenderTargetBitmap(
    $width, $height, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $target.Render($visual)
  New-Object System.Windows.Media.Imaging.FormatConvertedBitmap(
    $target, [System.Windows.Media.PixelFormats]::Bgr24, $null, 0)
}

function Optimize-Image([string]$src) {
  $outDir = Join-Path ([IO.Path]::GetDirectoryName($src)) $OUTPUT_DIR
  [void][IO.Directory]::CreateDirectory($outDir)
  $dest = Join-Path $outDir (Get-WebName $src)
  $name = [IO.Path]::GetFileName($src)

  try {
    $decoded = Read-Frame $src
  } catch {
    if ($src -match '\.hei[cf]$') {
      return @{ Src = $src; Error = 'illisible (photo iPhone : extensions HEIF et HEVC de Windows manquantes)' }
    }
    return @{ Src = $src; Error = 'illisible' }
  }

  $frame = $decoded.Frame
  $scale = [Math]::Min(1.0, $MAX_EDGE / [Math]::Max($frame.PixelWidth, $frame.PixelHeight))

  try {
    $transform = Get-OrientationTransform $decoded.Orientation
    if ($scale -lt 1) { $transform.Children.Add((New-Object System.Windows.Media.ScaleTransform($scale, $scale))) }
    $oriented = New-Object System.Windows.Media.Imaging.TransformedBitmap($frame, $transform)
    $opaque = Merge-OnWhite $oriented
  } catch {
    return @{ Src = $src; Error = 'conversion impossible' }
  }

  $encoder = New-Object System.Windows.Media.Imaging.JpegBitmapEncoder
  $encoder.QualityLevel = if ($name -match 'plan') { $DRAWING_QUALITY } else { $PHOTO_QUALITY }
  # Image recréée sans métadonnées : EXIF, GPS et profil ne sont pas recopiés.
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($opaque))
  try {
    $out = [IO.File]::Create($dest)
    try { $encoder.Save($out) } finally { $out.Dispose() }
  } catch {
    return @{ Src = $src; Error = 'écriture impossible' }
  }

  $outW = $opaque.PixelWidth
  $outH = $opaque.PixelHeight
  @{
    Src = $src
    Dest = $dest
    Width = $outW
    Height = $outH
    Kb = [Math]::Round((Get-Item -LiteralPath $dest).Length / 1KB)
    Blurry = [Math]::Max($outW, $outH) -lt $MIN_SHARP_EDGE
  }
}

function Invoke-All([string[]]$paths) {
  $images = New-Object 'System.Collections.Generic.List[string]'
  foreach ($p in $paths) { Add-Images $p $images }
  $results = @()
  for ($i = 0; $i -lt $images.Count; $i++) {
    if ($Fenetre) { Write-Host ('{0}/{1}  {2}' -f ($i + 1), $images.Count, [IO.Path]::GetFileName($images[$i])) }
    $results += , (Optimize-Image $images[$i])
  }
  , $results
}

function Get-Summary($results) {
  $done = @($results | Where-Object { -not $_.Error })
  $lines = @("$($done.Count) image(s) prête(s) dans les dossiers « $OUTPUT_DIR ».")
  foreach ($r in $done | Where-Object { $_.Blurry }) {
    $lines += "⚠ Trop petite ($($r.Width)×$($r.Height)), floue en plein écran : $([IO.Path]::GetFileName($r.Src))"
  }
  foreach ($r in $results | Where-Object { $_.Error }) {
    $lines += "✗ $($r.Error) : $([IO.Path]::GetFileName($r.Src))"
  }
  $lines -join "`n"
}

# Copie l'outil hors du dossier du kit (qui peut être déplacé) et pose le raccourci sur le bureau,
# qu'il soit local ou synchronisé par OneDrive.
function Install-Shortcut {
  $installDir = Join-Path $env:LOCALAPPDATA 'LaMinga'
  [void][IO.Directory]::CreateDirectory($installDir)
  $script = Join-Path $installDir 'optimiser-photos.ps1'
  Copy-Item -LiteralPath $PSCommandPath -Destination $script -Force
  Unblock-File -LiteralPath $script

  $desktop = [Environment]::GetFolderPath('Desktop')
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut((Join-Path $desktop $SHORTCUT_NAME))
  $shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
  $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -STA -File `"$script`" -Fenetre"
  $shortcut.WorkingDirectory = $installDir
  $shortcut.Description = 'Glissez des photos ou un dossier pour les préparer pour le site LaMinga'
  $shortcut.Save()
  "Raccourci « Optimiser pour le web » créé sur le bureau : $desktop"
}

if ($Installer) {
  Install-Shortcut
  return
}

if (-not $Fenetre) { [Console]::OutputEncoding = [Text.Encoding]::UTF8 }

if (-not $Chemins -or $Chemins.Count -eq 0) {
  $text = 'Glissez des photos ou un dossier sur cette icône pour les préparer pour le site.'
  if ($Fenetre) { Show-Message $text } else { $text }
  return
}

try {
  $results = Invoke-All $Chemins
} catch {
  $text = "L'outil photo s'est arrêté : $($_.Exception.Message)"
  if ($Fenetre) { Show-Message $text } else { [Console]::Error.WriteLine($text) }
  exit 1
}

# Raccourci du bureau : un message de fin. Ligne de commande : une ligne par image (source →
# destination, dimensions, poids).
if ($Fenetre) {
  if ($results.Count -eq 0) {
    Show-Message 'Aucune image trouvée (formats acceptés : JPG, PNG, HEIC, TIFF, WebP).'
  } else {
    Show-Message (Get-Summary $results)
  }
  return
}

foreach ($r in $results) {
  if ($r.Error) {
    "ERREUR $($r.Error) | $($r.Src)"
  } else {
    $flag = if ($r.Blurry) { ' | TROP PETITE' } else { '' }
    "$($r.Dest) | $($r.Width)x$($r.Height) | $($r.Kb) Ko$flag"
  }
}
''
Get-Summary $results
