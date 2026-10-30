# Gera os ícones do app (PNG) em public/ com a biblioteca gráfica do Windows (System.Drawing).
# Uso (na pasta sistemas/agendamento):  powershell -NoProfile -File scripts/icones.ps1
# Identidade neutra do painel: azul-aço (#2f5d8a -> #1f4266) com o calendário em branco.
Add-Type -AssemblyName System.Drawing
$public = Join-Path $PSScriptRoot '..\public'
$de = [System.Drawing.Color]::FromArgb(0x2f, 0x5d, 0x8a)
$ate = [System.Drawing.Color]::FromArgb(0x1f, 0x42, 0x66)

function Arredondado($x, $y, $w, $h, $r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  if ($r -le 0) { $p.AddRectangle((New-Object System.Drawing.RectangleF $x, $y, $w, $h)); return $p }
  $d = 2 * $r
  $p.AddArc($x, $y, $d, $d, 180, 90); $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90); $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure(); return $p
}

# Desenha um ícone. Medidas do desenho na grade de 512 (como o SVG original), escaladas para $px.
#   $cantos: raio do fundo na grade de 512 (0 = quadrado cheio); $comFundo: false = só o calendário
#   $escala: tamanho do calendário (1 = normal; menor = mais margem, para os ícones "maskable")
function Icone($nome, $px, $cantos, $escala, $comFundo, $corDesenho) {
  $bmp = New-Object System.Drawing.Bitmap $px, $px, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'; $g.PixelOffsetMode = 'HighQuality'; $g.Clear([System.Drawing.Color]::Transparent)
  $k = $px / 512.0
  if ($comFundo) {
    $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.PointF 0, 0), (New-Object System.Drawing.PointF $px, $px), $de, $ate
    $g.FillPath($grad, (Arredondado 0 0 $px $px ($cantos * $k)))
  }
  # Calendário centralizado: transforma a grade de 512 (com a escala) para o tamanho final
  $t = (512 - 512 * $escala) / 2
  $g.TranslateTransform($t * $k, $t * $k); $g.ScaleTransform($k * $escala, $k * $escala)
  $caneta = New-Object System.Drawing.Pen $corDesenho, 28
  $caneta.StartCap = 'Round'; $caneta.EndCap = 'Round'; $caneta.LineJoin = 'Round'
  $g.DrawPath($caneta, (Arredondado 114 132 284 256 40))
  $g.DrawLine($caneta, 114, 206, 398, 206); $g.DrawLine($caneta, 192, 96, 192, 168); $g.DrawLine($caneta, 320, 96, 320, 168)
  $g.FillEllipse((New-Object System.Drawing.SolidBrush $corDesenho), 230, 272, 52, 52)
  $bmp.Save((Join-Path $public $nome), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  "ok $nome ${px}px"
}

$branco = [System.Drawing.Color]::White
Icone 'icone-192.png' 192 112 1 $true $branco
Icone 'icone-512.png' 512 112 1 $true $branco
Icone 'icone-maskable-512.png' 512 0 0.78 $true $branco   # o sistema recorta; o desenho fica na zona segura
Icone 'apple-touch-icon.png' 180 0 0.86 $true $branco     # iPhone: quadrado cheio, o iOS arredonda
Icone 'badge-96.png' 96 0 1.1 $false $ate                 # selo das notificações: só o calendário
