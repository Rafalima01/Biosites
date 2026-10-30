# Calendário 3D para os bio sites (grafite com número e argolas em dourado), renderizado em PNG sem fundo.
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/calendario.py -- \
#       --numero 30 --saida modelos/10-barbearia/public/media/calendario/30.png
#
# Os 31 dias (Git Bash, ~2 min), como no modelo 10:
#   for n in $(seq 1 31); do "/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b \
#     -P scripts/blender/calendario.py -- --numero $n --tamanho 320 --amostras 96 \
#     --saida modelos/10-barbearia/public/media/calendario/$n.png; done
#
# A pose segue o calendário "premium dynamic" do 3dicons: quase de frente, girado no plano, lado direito
# mais perto da câmera, folhas de trás aparecendo embaixo.
#
# Opções: --numero (texto do calendário), --saida (PNG), --tamanho (px, padrão 640),
#         --base, --folha, --dourado (cores em hex), --fonte (arquivo .ttf), --amostras (Cycles).
import argparse
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

args = argparse.ArgumentParser()
args.add_argument('--numero', default='30')
args.add_argument('--saida', default='calendario.png')
args.add_argument('--tamanho', type=int, default=640)
args.add_argument('--base', default='#161b2c')
args.add_argument('--folha', default='#1e2438')
args.add_argument('--dourado', default='#e6b25a')
args.add_argument('--fonte', default=r'C:\Windows\Fonts\impact.ttf')
args.add_argument('--amostras', type=int, default=96)
opt = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])


def cor(hexa):
    """Hex sRGB → RGBA linear (o Blender trabalha em linear)."""
    h = hexa.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def material(nome, base, metal=0.0, rugosidade=0.4, verniz=0.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = cor(base)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rugosidade
    if 'Coat Weight' in p.inputs:
        p.inputs['Coat Weight'].default_value = verniz
        p.inputs['Coat Roughness'].default_value = 0.12
    return m


def placa(nome, largura, altura, espessura, raio, mat):
    """Placa com cantos bem arredondados e quinas suaves (como a folha do calendário)."""
    malha = bpy.data.meshes.new(nome)
    obj = bpy.data.objects.new(nome, malha)
    bpy.context.collection.objects.link(obj)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * largura, v.co.y * espessura, v.co.z * altura))
    # arredonda só as 4 arestas da espessura (eixo Y): cantos da placa
    arestas = [e for e in bm.edges if abs(e.verts[0].co.y - e.verts[1].co.y) > 1e-6]
    bmesh.ops.bevel(bm, geom=arestas, offset=raio, segments=14, affect='EDGES', profile=0.5)
    bm.to_mesh(malha)
    bm.free()
    mod = obj.modifiers.new('quinas', 'BEVEL')
    mod.width = espessura * 0.35
    mod.segments = 6
    mod.limit_method = 'ANGLE'
    obj.data.materials.append(mat)
    for f in obj.data.polygons:
        f.use_smooth = True
    obj.modifiers.new('suave', 'WEIGHTED_NORMAL').keep_sharp = False
    return obj


# Cena limpa
bpy.ops.wm.read_factory_settings(use_empty=True)
cena = bpy.context.scene

base = material('base', opt.base, rugosidade=0.5, verniz=0.25)
folha = material('folha', opt.folha, rugosidade=0.38, verniz=0.4)
ouro = material('ouro', opt.dourado, metal=1.0, rugosidade=0.26)

grupo = bpy.data.objects.new('calendario', None)
cena.collection.objects.link(grupo)

L, A, E, R = 2.0, 2.0, 0.16, 0.4
frente = placa('frente', L, A, E, R, base)
frente.parent = grupo
# Folhas empilhadas atrás, saindo um pouco por baixo
for i in range(2):
    f = placa(f'folha{i}', L, A, E * 0.8, R, folha)
    f.location = (0.07 * (i + 1), 0.11 * (i + 1), -0.12 * (i + 1))
    f.parent = grupo

# Número em dourado, em relevo na frente
bpy.ops.object.text_add()
txt = bpy.context.object
txt.data.body = opt.numero
txt.data.font = bpy.data.fonts.load(opt.fonte)
txt.data.align_x = 'CENTER'
txt.data.align_y = 'CENTER'
# um dígito fica maior para ocupar a folha como os de dois
txt.data.size = {1: 2.45, 2: 2.0}.get(len(opt.numero), 1.3)
txt.data.shear = 0.18
txt.data.extrude = 0.05
txt.data.bevel_depth = 0.022
txt.data.bevel_resolution = 4
txt.rotation_euler = (math.radians(90), 0, 0)
txt.location = (0, -E / 2 - 0.06, -0.1)
txt.data.materials.append(ouro)
txt.parent = grupo

# Argolas douradas passando pela borda de cima
for x in (-0.58, 0.58):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.24, minor_radius=0.065, major_segments=48, minor_segments=16)
    t = bpy.context.object
    t.rotation_euler = (0, math.radians(90), 0)
    t.location = (x, 0.04, A / 2 - 0.02)
    t.data.materials.append(ouro)
    for f in t.data.polygons:
        f.use_smooth = True
    t.parent = grupo

# Pose "dinâmica": girado e um pouco inclinado
grupo.rotation_euler = (math.radians(12), math.radians(-15), math.radians(22))

# Câmera
bpy.ops.object.camera_add(location=(0, -10.2, 0.5))
cam = bpy.context.object
cam.data.lens = 120
alvo = bpy.data.objects.new('alvo', None)
cena.collection.objects.link(alvo)
alvo.location = (0.04, 0, 0.14)
c = cam.constraints.new('TRACK_TO')
c.target = alvo
c.track_axis = 'TRACK_NEGATIVE_Z'
c.up_axis = 'UP_Y'
cena.camera = cam


# Luzes: principal quente do alto à esquerda, recorte à direita e preenchimento
def luz(nome, energia, local, tamanho, cor_hex='#ffffff'):
    d = bpy.data.lights.new(nome, 'AREA')
    d.energy = energia
    d.size = tamanho
    d.color = cor(cor_hex)[:3]
    o = bpy.data.objects.new(nome, d)
    o.location = local
    cena.collection.objects.link(o)
    k = o.constraints.new('TRACK_TO')
    k.target = alvo
    k.track_axis = 'TRACK_NEGATIVE_Z'
    k.up_axis = 'UP_Y'


luz('principal', 650, (-4, -5, 5), 4, '#fff1dc')
luz('recorte', 900, (5, 2, 3), 3, '#ffd9a6')
luz('topo', 300, (0, -2, 6), 6)
luz('preenche', 220, (3, -6, -1), 5)
luz('frente', 260, (-1.5, -7, 1.2), 3, '#fff4e0')

mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.5, 0.45, 1)
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.16
cena.world = mundo

# Render: Cycles, fundo transparente, cores sem curva (fiel às da marca)
cena.render.engine = 'CYCLES'
cena.cycles.samples = opt.amostras
cena.cycles.use_denoising = True
cena.render.film_transparent = True
cena.render.resolution_x = cena.render.resolution_y = opt.tamanho
cena.render.image_settings.file_format = 'PNG'
cena.render.image_settings.color_mode = 'RGBA'
cena.view_settings.view_transform = 'Standard'
cena.render.filepath = os.path.abspath(opt.saida)
bpy.ops.render.render(write_still=True)
print('OK', cena.render.filepath)
