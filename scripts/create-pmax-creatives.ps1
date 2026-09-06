Add-Type -AssemblyName System.Drawing

$workspace = Split-Path -Parent $PSScriptRoot
$logoPath = Join-Path $workspace 'public\images\brand\spectra-pack-logo.png'
$wideMachinePath = Join-Path $workspace 'public\images\hero\automatic-atta-packaging-setup.jpeg'
$squareMachinePath = Join-Path $workspace 'public\images\hero\cutouts\automatic-web-sealer-line-v2.png'
$outputDirectory = Join-Path $workspace 'public\images\ads'

if (-not (Test-Path -LiteralPath $logoPath)) { throw "Missing logo: $logoPath" }
if (-not (Test-Path -LiteralPath $wideMachinePath)) { throw "Missing product image: $wideMachinePath" }
if (-not (Test-Path -LiteralPath $squareMachinePath)) { throw "Missing product image: $squareMachinePath" }
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

function Set-Quality([System.Drawing.Graphics]$graphics) {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
}

function Draw-ContainedImage(
  [System.Drawing.Graphics]$graphics,
  [System.Drawing.Image]$image,
  [int]$x,
  [int]$y,
  [int]$width,
  [int]$height
) {
  $scale = [Math]::Min($width / $image.Width, $height / $image.Height)
  $drawWidth = [int][Math]::Round($image.Width * $scale)
  $drawHeight = [int][Math]::Round($image.Height * $scale)
  $drawX = $x + [int][Math]::Round(($width - $drawWidth) / 2)
  $drawY = $y + [int][Math]::Round(($height - $drawHeight) / 2)
  $destination = [System.Drawing.Rectangle]::new($drawX, $drawY, $drawWidth, $drawHeight)
  $graphics.DrawImage($image, $destination)
}

function New-PmaxCreative([int]$width, [int]$height, [string]$fileName, [string]$machineImagePath) {
  $outputPath = Join-Path $outputDirectory $fileName
  if (Test-Path -LiteralPath $outputPath) { throw "Refusing to overwrite existing creative: $outputPath" }

  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-Quality $graphics

  $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle 0, 0, $width, $height),
    ([System.Drawing.Color]::FromArgb(250, 253, 251)),
    ([System.Drawing.Color]::FromArgb(224, 238, 229)),
    90
  )
  $graphics.FillRectangle($background, 0, 0, $width, $height)
  $background.Dispose()

  $brandGreen = [System.Drawing.Color]::FromArgb(0, 64, 49)
  $accentBrush = New-Object System.Drawing.SolidBrush $brandGreen
  $graphics.FillRectangle($accentBrush, 0, 0, $width, [Math]::Max(8, [int]($height * 0.012)))
  $accentBrush.Dispose()

  $logo = [System.Drawing.Image]::FromFile($logoPath)
  $machine = [System.Drawing.Image]::FromFile($machineImagePath)
  try {
    $margin = [int][Math]::Round($width * 0.045)
    $logoWidth = [int][Math]::Min($width * 0.28, 360)
    $logoHeight = [int][Math]::Round($logoWidth * $logo.Height / $logo.Width)
    $logoDestination = [System.Drawing.Rectangle]::new($margin, $margin, $logoWidth, $logoHeight)
    $graphics.DrawImage($logo, $logoDestination)

    $linePen = [System.Drawing.Pen]::new($brandGreen, [single][Math]::Max(2, [int]($height * 0.004)))
    $lineY = $margin + $logoHeight + [int]($height * 0.026)
    $graphics.DrawLine($linePen, $margin, $lineY, $width - $margin, $lineY)
    $linePen.Dispose()

    $machineTop = $lineY + [int]($height * 0.02)
    $machineHeight = $height - $machineTop - $margin
    Draw-ContainedImage $graphics $machine $margin $machineTop ($width - 2 * $margin) $machineHeight
  }
  finally {
    $logo.Dispose()
    $machine.Dispose()
    $graphics.Dispose()
  }

  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
  Write-Output $outputPath
}

New-PmaxCreative 1200 628 'spectra-pack-pmax-packaging-line-1-91-v3.png' $wideMachinePath
New-PmaxCreative 1200 1200 'spectra-pack-pmax-web-sealer-square-v3.png' $squareMachinePath
