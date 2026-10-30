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
# Visual copiado do calendário "premium dynamic" do 3dicons (CC0): a pose (--giro -7,-8,-12) foi achada
# pelo Blender testando centenas de ângulos até o contorno da folha e o formato do número coincidirem com
# os dele; as proporções do número saíram da vista de frente; a cor da folha foi medida nos pixels.
#
# Opções: --numero (texto do calendário), --saida (PNG), --tamanho (px, padrão 640),
#         --base, --folha, --dourado (cores em hex), --fonte (arquivo .ttf), --amostras (Cycles),
#         --giro x,y,z (graus), --altura (da folha), --lente (mm).
# Ajustes finos do número por variável de ambiente: TAM1 e TAM2 (tamanho com 1 e 2 dígitos),
# NUMX e NUMZ (posição na folha), NUMY (esticar na altura).
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
args.add_argument('--base', default='#172036')
args.add_argument('--folha', default='#141b31')
args.add_argument('--dourado', default='#d4a043')
args.add_argument('--fonte', default=r'C:\Windows\Fonts\ariblk.ttf')
args.add_argument('--amostras', type=int, default=96)
args.add_argument('--altura', type=float, default=2.1, help='altura da folha (largura 2.0)')
args.add_argument('--lente', type=float, default=120, help='lente da câmera em mm (menor = mais perspectiva)')
args.add_argument('--giro', default='-7,-8,-12', help='rotação x,y,z em graus (pose)')
args.add_argument('--so-cena', action='store_true', help='monta a cena sem renderizar (para outros scripts)')
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

base = material('base', opt.base, rugosidade=0.55, verniz=0.0)
folha = material('folha', opt.folha, rugosidade=0.55, verniz=0.0)
ouro = material('ouro', opt.dourado, metal=1.0, rugosidade=0.26)

grupo = bpy.data.objects.new('calendario', None)
cena.collection.objects.link(grupo)

L, A, E, R = 2.0, opt.altura, 0.16, 0.4
frente = placa('frente', L, A, E, R, base)
frente.parent = grupo
# Folhas empilhadas atrás, saindo um pouco por baixo
# Folha de trás grossa, deslocada para baixo e para a direita no mesmo plano (como no premium),
# e uma lâmina fina entre as duas
for nome, (dx, dy, dz), esp in (('folha', (0.08, 0.13, -0.11), E * 1.1), ('lamina', (0.04, 0.07, -0.055), E * 0.5)):
    f = placa(nome, L, A, esp, R, folha)
    f.location = (dx, dy, dz)
    f.parent = grupo

# Número em dourado, em relevo na frente
bpy.ops.object.text_add()
txt = bpy.context.object
txt.data.body = opt.numero
txt.data.font = bpy.data.fonts.load(opt.fonte)
txt.data.align_x = 'CENTER'
txt.data.align_y = 'CENTER'
# um dígito fica maior para ocupar a folha como os de dois
txt.data.size = {1: float(os.environ.get('TAM1', 1.62)), 2: float(os.environ.get('TAM2', 1.5))}.get(len(opt.numero), 0.9)
txt.data.shear = 0.18
txt.data.extrude = 0.022
txt.data.bevel_depth = 0.014
txt.data.bevel_resolution = 4
txt.rotation_euler = (math.radians(90), 0, 0)
# colado na face (sem vão): a frente do número fica logo à frente da folha
txt.location = (float(os.environ.get('NUMX', -0.07)), -E / 2 - 0.03, float(os.environ.get('NUMZ', 0.0)))
txt.scale = (1, float(os.environ.get('NUMY', 1.55)), 1)  # algarismos mais altos, como no premium
txt.data.materials.append(ouro)
txt.parent = grupo

# Argolas douradas passando pela borda de cima
for x in (-0.5, 0.64):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.28, minor_radius=0.075, major_segments=48, minor_segments=16)
    t = bpy.context.object
    t.rotation_euler = (0, math.radians(90), 0)
    t.location = (x, 0.04, A / 2 + 0.02)
    t.data.materials.append(ouro)
    for f in t.data.polygons:
        f.use_smooth = True
    t.parent = grupo

# Pose "dinâmica": girado e um pouco inclinado
grupo.rotation_euler = tuple(math.radians(float(g)) for g in opt.giro.split(','))

# Câmera
# distância proporcional à lente, para o calendário ocupar o mesmo espaço no quadro
bpy.ops.object.camera_add(location=(0, -10.2 * opt.lente / 120, 0.5))
cam = bpy.context.object
cam.data.lens = opt.lente
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


luz('principal', 300, (-4, -5, 5), 4)
luz('recorte', 600, (5, 2, 3), 3, '#fff2e0')
luz('topo', 160, (0, -2, 6), 6)
luz('preenche', 110, (3, -6, -1), 5)
luz('frente', 40, (-1.5, -7, 1.2), 3)

mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = (0.45, 0.47, 0.55, 1)
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.12
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
if not opt.so_cena:
    bpy.ops.render.render(write_still=True)
    print('OK', cena.render.filepath)
