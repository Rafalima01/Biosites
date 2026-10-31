# Converte PNGs (com transparência) em WebP ao lado do original, com as cores fiéis.
# save_render() aplica a gestão de cor da cena: com o AgX padrão as cores saem lavadas, por isso a cena
# fica em "Standard" aqui.
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup \
#       -P scripts/blender/webp.py -- imagem1.png imagem2.png
#
# Opção: QUALIDADE (variável de ambiente, padrão 86).
import os
import sys

import bpy

cena = bpy.context.scene
cena.view_settings.view_transform = 'Standard'
formato = cena.render.image_settings
formato.file_format = 'WEBP'
formato.color_mode = 'RGBA'
formato.quality = int(os.environ.get('QUALIDADE', 86))
for caminho in sys.argv[sys.argv.index('--') + 1:]:
    imagem = bpy.data.images.load(os.path.abspath(caminho))
    imagem.save_render(os.path.splitext(os.path.abspath(caminho))[0] + '.webp', scene=cena)
    print('OK', caminho)
