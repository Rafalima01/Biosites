# Ícones 3D brilhantes a partir de desenhos SVG (24×24): escudo com visto e selo do WhatsApp.
# Renderiza um PNG sem fundo, levemente inclinado (como os ícones 3D de banco de imagens).
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/icone3d.py -- \
#       --icone escudo --tamanho 500 --saida escudo.png
#
# Opções: --icone (escudo | whatsapp), --cor (hex da peça principal), --giro x,y,z (graus; cada ícone tem o seu),
#         --amostras.
import argparse
import math
import os
import sys
import tempfile

import bpy
from mathutils import Matrix, Vector

args = argparse.ArgumentParser()
args.add_argument('--icone', choices=['escudo', 'whatsapp'], default='escudo')
args.add_argument('--saida', default='icone.png')
args.add_argument('--tamanho', type=int, default=500)
args.add_argument('--cor', default=None)
args.add_argument('--giro', default=None)
args.add_argument('--amostras', type=int, default=96)
opt = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])

# Desenhos 24×24. "cheio" vira peça extrudada; "traco" vira tubo (contorno grosso).
DESENHOS = {
    'escudo': {
        'cor': '#2563cc',
        'giro': '6,-24,-4',
        'base': ('cheio', 'M12 1.8 L20.6 5 V11.2 C20.6 16.9 16.9 21 12 22.6 C7.1 21 3.4 16.9 3.4 11.2 V5 Z'),
        'marca': ('traco', 'M7.8 12.2 L10.9 15.2 L16.4 8.9'),
        'cor_marca': '#e8f1ff',
    },
    'whatsapp': {
        'cor': '#1fb655',
        'giro': '14,-22,8',
        'base': ('disco', None),
        'marca': ('traco', 'M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.5-4.2a8.5 8.5 0 1 1 15.5-4.6z'),
        'marca2': ('cheio', 'M9.1 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .6.6 1 1.4 1.8 2.4 2.4.2.1.4.1.6 0l.6-.5c.2-.1.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.6.3-1.6.5-2.9-.1a9.5 9.5 0 0 1-4.6-4.6c-.6-1.3-.4-2.3-.1-2.9z'),
        'cor_marca': '#ffffff',
    },
}
d = DESENHOS[opt.icone]


def cor(hexa):
    """Hex sRGB → RGBA linear (o Blender trabalha em linear)."""
    h = hexa.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def material(nome, base, rugosidade=0.18, verniz=1.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = cor(base)
    p.inputs['Roughness'].default_value = rugosidade
    p.inputs['Coat Weight'].default_value = verniz
    p.inputs['Coat Roughness'].default_value = 0.08
    return m


PX = 0.0254 / 90  # o importador grava 1 px do SVG como 1/90 de polegada


def importa(caminho_d, tipo, px, mat):
    """Importa um caminho SVG 24×24 como curva no plano XY (virada para +Z) e dá volume.
    `px` é a espessura em pixels do desenho: meia altura da peça cheia ou raio do traço."""
    arq = os.path.join(tempfile.mkdtemp(), 'p.svg')
    with open(arq, 'w') as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="{caminho_d}"/></svg>')
    antes = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=arq)
    obj = next(o for o in bpy.data.objects if o not in antes)
    obj.data.transform(obj.matrix_world)
    obj.matrix_world = Matrix.Identity(4)
    cu = obj.data
    cu.dimensions = '2D'
    cu.bevel_resolution = 6
    if tipo == 'cheio':
        cu.fill_mode = 'BOTH'
        cu.extrude = px * PX
        cu.bevel_depth = px * PX * 0.45
    else:
        cu.fill_mode = 'NONE'
        for s in cu.splines:
            s.use_cyclic_u = 'z' in caminho_d.lower()  # o importador fecha caminhos abertos (o visto)
        cu.bevel_depth = px * PX
    cu.materials.clear()  # o importador põe um material preto próprio
    cu.materials.append(mat)
    return obj


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
principal = material('principal', opt.cor or d['cor'])
marca = material('marca', d['cor_marca'], rugosidade=0.25, verniz=0.6)

# Tudo é montado no plano XY, virado para +Z; no fim o grupo gira para a câmera.
pecas, svg = [], []
tipo, caminho = d['base']
if tipo == 'disco':
    bpy.ops.mesh.primitive_cylinder_add(vertices=128, radius=1, depth=0.28)
    base = bpy.context.active_object
    bev = base.modifiers.new('quina', 'BEVEL')
    bev.width = 0.1
    bev.segments = 8
    base.data.materials.append(principal)
    for f in base.data.polygons:
        f.use_smooth = True
else:
    base = importa(caminho, tipo, 3.0, principal)
    svg.append(base)
pecas.append(base)
for chave in ('marca', 'marca2'):
    if chave in d:
        t, c = d[chave]
        svg.append(importa(c, t, 1.1 if t == 'traco' else 0.5, marca))
pecas += [p for p in svg if p not in pecas]

# Escala do desenho: escudo com 2 unidades de altura; glifo do WhatsApp com 1,3 dentro do disco de raio 1
ref = svg if tipo == 'disco' else [base]
bb = [Vector(c) for p in ref for c in p.bound_box]
lado = max(max(v.x for v in bb) - min(v.x for v in bb), max(v.y for v in bb) - min(v.y for v in bb))
centro = sum(bb, Vector()) / len(bb)
k = (1.3 if tipo == 'disco' else 2.0) / lado
frente = 0.15 if tipo == 'disco' else 4.7 * PX * k  # por cima da face da frente (3 px de extrusão + 1,35 px de borda)
for p in svg:
    p.scale = (k, k, k)
    p.location = (-centro.x * k, -centro.y * k, 0 if p is base else frente)

grupo = bpy.data.objects.new('icone', None)
sc.collection.objects.link(grupo)
for p in pecas:
    p.parent = grupo
gx, gy, gz = (math.radians(float(v)) for v in (opt.giro or d['giro']).split(','))
grupo.rotation_euler = (math.radians(90) + gx, gy, gz)  # +Z vira para a câmera (que olha de -Y)

sc.render.engine = 'CYCLES'
sc.cycles.samples = opt.amostras
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
sc.render.resolution_x = sc.render.resolution_y = opt.tamanho
mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = cor('#dfe8f5')
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.8
sc.world = mundo


def luz(nome, pos, energia, tamanho):
    obj = bpy.data.objects.new(nome, bpy.data.lights.new(nome, 'AREA'))
    obj.data.energy = energia
    obj.data.size = tamanho
    obj.location = pos
    obj.rotation_euler = (Vector((0, 0, 0)) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler()
    sc.collection.objects.link(obj)


luz('principal', (-3, -4, 4), 700, 3)
luz('brilho', (3, -3, 2), 300, 1)
luz('recorte', (0, 4, 3), 300, 3)
cam = bpy.data.objects.new('camera', bpy.data.cameras.new('camera'))
sc.collection.objects.link(cam)
cam.data.lens = 85
cam.location = (0, -12, 0)
cam.rotation_euler = (math.radians(90), 0, 0)
sc.camera = cam
sc.render.filepath = opt.saida
bpy.ops.render.render(write_still=True)
