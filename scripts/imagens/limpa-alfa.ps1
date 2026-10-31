# Limpa restos de fundo de um recorte automático: pixels quase transparentes somem e a borda é
# reescalada (alfa abaixo de -corte vira 0; acima, vai de 0 a 255). Sobrescreve o arquivo.
#
# Uso (PowerShell):  & scripts/imagens/limpa-alfa.ps1 foto-sem-fundo.png 90
param([string]$arquivo, [int]$corte = 90)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$caminho = (Resolve-Path $arquivo).Path
$orig = [Drawing.Bitmap]::FromFile($caminho)
$img = New-Object Drawing.Bitmap($orig)
$orig.Dispose()
$r = New-Object Drawing.Rectangle(0, 0, $img.Width, $img.Height)
$d = $img.LockBits($r, 'ReadWrite', 'Format32bppArgb')
$bytes = New-Object byte[] ($d.Stride * $img.Height)
[Runtime.InteropServices.Marshal]::Copy($d.Scan0, $bytes, 0, $bytes.Length)
$escala = 255.0 / (255 - $corte)
for ($i = 3; $i -lt $bytes.Length; $i += 4) {
  $a = $bytes[$i]
  $bytes[$i] = if ($a -le $corte) { 0 } else { [byte][Math]::Min(255, ($a - $corte) * $escala) }
}
[Runtime.InteropServices.Marshal]::Copy($bytes, 0, $d.Scan0, $bytes.Length)
$img.UnlockBits($d)
$img.Save($caminho, [Drawing.Imaging.ImageFormat]::Png)
"ok $arquivo"
