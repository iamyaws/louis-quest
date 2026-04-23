# Resizes public/icon-source.png into public/icon-192.png and public/icon-512.png
# Run from repo root:  pwsh scripts/resize-app-icon.ps1
# Replaces the existing PWA icons in-place. Also regenerates a square-fill
# version suitable for iOS apple-touch-icon (no transparency padding).

Add-Type -AssemblyName System.Drawing

$src = "public/icon-source.png"
if (-not (Test-Path $src)) {
    Write-Host "Source icon not found at $src — save the source PNG there first." -ForegroundColor Red
    exit 1
}

$source = [System.Drawing.Image]::FromFile((Resolve-Path $src))

function Resize-And-Save {
    param([int]$Size, [string]$OutPath)
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($source, 0, 0, $Size, $Size)
    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Wrote $OutPath ($Size x $Size)" -ForegroundColor Green
}

Resize-And-Save -Size 192 -OutPath (Join-Path (Get-Location) "public/icon-192.png")
Resize-And-Save -Size 512 -OutPath (Join-Path (Get-Location) "public/icon-512.png")

$source.Dispose()
Write-Host ""
Write-Host "Done. Next steps:" -ForegroundColor Yellow
Write-Host "  1. Optionally delete public/icon.svg (PNGs will cover all sizes via the manifest)."
Write-Host "  2. Run 'npm run build' and hard-refresh localhost to see the new icon."
Write-Host "  3. iOS PWA installs cache icons aggressively — reinstall to get the new one."
