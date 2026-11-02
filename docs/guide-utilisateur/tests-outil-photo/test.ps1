# Vérifie l'outil photo Windows (kit-claude/outils/optimiser-photos.ps1) sur des images de test.
# Lancé par la CI sur un runner Windows ; en local : powershell -ExecutionPolicy Bypass -File test.ps1

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationCore, WindowsBase

$tool = Join-Path $PSScriptRoot '..\kit-claude\outils\optimiser-photos.ps1'
$work = Join-Path ([IO.Path]::GetTempPath()) "outil-photo-$([guid]::NewGuid())"
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'images') -Destination $work -Recurse

$output = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $tool $work
$output | Write-Host

$failures = New-Object 'System.Collections.Generic.List[string]'
function Assert([bool]$condition, [string]$message) {
  if ($condition) { Write-Host "ok   $message" } else { Write-Host "FAIL $message"; $failures.Add($message) }
}

function Read-Output([string]$relative) {
  $path = Join-Path $work $relative
  $stream = [IO.File]::OpenRead($path)
  try {
    $frame = [System.Windows.Media.Imaging.BitmapDecoder]::Create(
      $stream,
      [System.Windows.Media.Imaging.BitmapCreateOptions]::IgnoreColorProfile,
      [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad).Frames[0]
  } finally {
    $stream.Dispose()
  }
  $bgr = New-Object System.Windows.Media.Imaging.FormatConvertedBitmap(
    $frame, [System.Windows.Media.PixelFormats]::Bgr24, $null, 0)
  @{ Bitmap = $bgr; Bytes = [IO.File]::ReadAllBytes($path) }
}

function Get-Pixel($bitmap, [int]$x, [int]$y) {
  $pixel = New-Object byte[] 3
  $bitmap.CopyPixels((New-Object System.Windows.Int32Rect($x, $y, 1, 1)), $pixel, 3, 0)
  @{ R = $pixel[2]; G = $pixel[1]; B = $pixel[0] }
}

function Test-Contains([byte[]]$bytes, [string]$marker) {
  [Text.Encoding]::ASCII.GetString($bytes).Contains($marker)
}

$rotated = Read-Output 'web\orientation-6.jpg'
Assert ($rotated.Bitmap.PixelWidth -eq 200 -and $rotated.Bitmap.PixelHeight -eq 300) 'rotation EXIF : 300x200 devient 200x300'
$top = Get-Pixel $rotated.Bitmap 100 30
$bottom = Get-Pixel $rotated.Bitmap 100 270
Assert ($top.R -gt 200 -and $top.B -lt 60) 'rotation EXIF : la moitié rouge (gauche) passe en haut'
Assert ($bottom.B -gt 200 -and $bottom.R -lt 60) 'rotation EXIF : la moitié bleue (droite) passe en bas'
Assert (-not (Test-Contains $rotated.Bytes 'Exif')) 'métadonnées EXIF retirées'

# rgb(200,100,100) en Display P3 vaut environ rgb(215,93,97) en sRGB (référence ImageMagick).
$p3 = Read-Output 'web\couleurs-p3.jpg'
$color = Get-Pixel $p3.Bitmap 32 32
Assert ($color.R -ge 209 -and $color.G -le 97) "conversion Display P3 → sRGB (obtenu $($color.R),$($color.G),$($color.B))"
Assert (-not (Test-Contains $p3.Bytes 'ICC_PROFILE')) 'profil ICC retiré'

$transparent = Read-Output 'web\transparent.jpg'
$corner = Get-Pixel $transparent.Bitmap 5 5
$center = Get-Pixel $transparent.Bitmap 50 50
Assert ($corner.R -gt 245 -and $corner.G -gt 245 -and $corner.B -gt 245) 'transparence posée sur fond blanc'
Assert ($center.R -lt 30) 'le dessin opaque est conservé'

$large = Read-Output 'web\grand.jpg'
Assert ($large.Bitmap.PixelWidth -eq 2560 -and $large.Bitmap.PixelHeight -eq 640) "grand côté limité à 2560 px (obtenu $($large.Bitmap.PixelWidth)x$($large.Bitmap.PixelHeight))"

Assert (Test-Path -LiteralPath (Join-Path $work 'sous-dossier\web\ete-plan-n-1.jpg')) 'sous-dossiers parcourus, nom sans accents ni espaces'
Assert (($output -join "`n") -match 'ERREUR illisible \| .*pas-une-image\.jpg') 'fichier illisible signalé sans arrêter le traitement'
Assert (-not (Test-Path -LiteralPath (Join-Path $work 'web\web'))) 'le dossier « web » existant est ignoré'
Assert (($output -join "`n") -match 'TROP PETITE') 'image trop petite signalée'
Assert (($output -join "`n") -match '5 image\(s\) prête\(s\)') 'résumé : 5 images prêtes'

Remove-Item -LiteralPath $work -Recurse -Force
if ($failures.Count -gt 0) {
  Write-Host "$($failures.Count) échec(s)"
  exit 1
}
Write-Host 'Tous les tests passent.'
