# Recorta um PNG com fundo transparente até o conteúdo (pelo canal alfa, com 4 px de folga) e
# redimensiona para a largura pedida, mantendo a proporção. Usado depois dos renders do Blender.
#
# Uso (PowerShell):
#   & scripts/imagens/recorta.ps1 render.png modelos/12-psicologia/public/media/cerebro.png 440
# Depois converta para WebP com scripts/blender/webp.py.
param([string]$entrada, [string]$saida, [int]$largura)
Add-Type -AssemblyName System.Drawing
$img = [Drawing.Bitmap]::FromFile((Resolve-Path $entrada))
$r = New-Object Drawing.Rectangle(0, 0, $img.Width, $img.Height)
$d = $img.LockBits($r, 'ReadOnly', 'Format32bppArgb')
$bytes = New-Object byte[] ($d.Stride * $img.Height)
[Runtime.InteropServices.Marshal]::Copy($d.Scan0, $bytes, 0, $bytes.Length)
$img.UnlockBits($d)
$x0 = $img.Width; $y0 = $img.Height; $x1 = 0; $y1 = 0
for ($y = 0; $y -lt $img.Height; $y++) {
  $base = $y * $d.Stride
  for ($x = 0; $x -lt $img.Width; $x++) {
    if ($bytes[$base + $x * 4 + 3] -gt 8) {
      if ($x -lt $x0) { $x0 = $x }; if ($x -gt $x1) { $x1 = $x }
      if ($y -lt $y0) { $y0 = $y }; if ($y -gt $y1) { $y1 = $y }
    }
  }
}
$p = 4
$x0 = [Math]::Max(0, $x0 - $p); $y0 = [Math]::Max(0, $y0 - $p)
$x1 = [Math]::Min($img.Width - 1, $x1 + $p); $y1 = [Math]::Min($img.Height - 1, $y1 + $p)
$w = $x1 - $x0 + 1; $h = $y1 - $y0 + 1
$altura = [int][Math]::Round($h * $largura / $w)
$out = New-Object Drawing.Bitmap($largura, $altura, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [Drawing.Graphics]::FromImage($out)
$g.InterpolationMode = 'HighQualityBicubic'
$g.PixelOffsetMode = 'HighQuality'
$g.CompositingMode = 'SourceCopy'
$g.DrawImage($img, (New-Object Drawing.Rectangle(0, 0, $largura, $altura)), $x0, $y0, $w, $h, 'Pixel')
$g.Dispose()
$out.Save($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($saida), [Drawing.Imaging.ImageFormat]::Png)
"$saida ${largura}x$altura"
