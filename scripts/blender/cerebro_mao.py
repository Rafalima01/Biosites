# Cérebro realista de lado, flutuando sobre a palma de uma mão, para o card do Instagram do Modelo 12.
# Renderiza um PNG sem fundo. Modelos usados:
#   - Cérebro: "3D model of the Brain", Nevit Dilmen, M.D. — NIH 3D, 3DPX-003765, licença CC BY-SA 4.0
#     https://3d.nih.gov/entries/3DPX-003765 (GLB "3DModel of Brain NevitDilmen_NIH3D.glb").
#     A imagem gerada é obra derivada: mantenha o crédito e a mesma licença (CC BY-SA 4.0).
#   - Mão: "generic-hand" (right.glb) do pacote @webxr-input-profiles/assets (licença MIT)
#     https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0.19/dist/profiles/generic-hand/right.glb
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/cerebro_mao.py -- \
#       --cerebro cerebro.glb --mao right.glb --tamanho 1200 --saida cerebro-mao.png
#
# Opções: --cor-cerebro e --cor-pele (hex), --corte (mm: o tronco abaixo disso é removido),
#         --flutua (distância entre a palma e o cérebro, que fica flutuando sobre a mão),
#         --giro (graus do cérebro em torno do eixo vertical), --amostras.
import argparse
import math
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

args = argparse.ArgumentParser()
args.add_argument('--cerebro', required=True)
args.add_argument('--mao', required=True)
args.add_argument('--saida', default='cerebro-mao.png')
args.add_argument('--tamanho', type=int, default=1200)
args.add_argument('--cor-cerebro', default='#e39886')
args.add_argument('--cor-pele', default='#f0bfa6')
args.add_argument('--corte', type=float, default=-88)
args.add_argument('--flutua', type=float, default=2.1)
args.add_argument('--giro', type=float, default=90)
args.add_argument('--amostras', type=int, default=128)
opt = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])


def cor(hexa):
    """Hex sRGB → RGBA linear (o Blender trabalha em linear)."""
    h = hexa.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def pele(nome, base, rugosidade, sss):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = cor(base)
    p.inputs['Roughness'].default_value = rugosidade
    p.inputs['Subsurface Weight'].default_value = sss
    p.inputs['Subsurface Radius'].default_value = (0.08, 0.035, 0.02)
    p.inputs['Subsurface Scale'].default_value = 0.06
    return m


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ---------- Mão: palma para cima, dedos para a direita, polegar para trás ----------
bpy.ops.import_scene.gltf(filepath=opt.mao)
for o in list(sc.objects):
    if o.type == 'MESH' and o.parent is None:  # esfera de referência que vem no arquivo
        bpy.data.objects.remove(o)
arm = next(o for o in sc.objects if o.type == 'ARMATURE')
mao = next(o for o in sc.objects if o.type == 'MESH')
# No arquivo: dedos para -Z, palma voltada para -X (o dorso para +X), polegar para +Y.
# Fica: dedos para a direita, palma para cima, polegar para o lado da câmera.
base = Matrix(((0, 0, -1, 0), (0, -1, 0, 0), (-1, 0, 0, 0), (0, 0, 0, 1)))
inclina = Matrix.Rotation(math.radians(-18), 4, 'Y') @ Matrix.Rotation(math.radians(38), 4, 'X')  # palma à mostra
arm.matrix_world = inclina @ base @ Matrix.Scale(30, 4)
bpy.context.view_layer.update()

# Pose (no espaço do arquivo): dedos juntos (giro em torno de X, a normal da palma) e levemente
# curvados para dentro (giro em torno de Y, que atravessa a palma), como quem segura algo.
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='POSE')


def girar(nome, graus, eixo):
    pb = arm.pose.bones.get(nome)
    if pb:
        cabeca = pb.matrix.translation.copy()
        pb.matrix = Matrix.Translation(cabeca) @ Matrix.Rotation(math.radians(graus), 4, eixo) @ Matrix.Translation(-cabeca) @ pb.matrix
        bpy.context.view_layer.update()


for dedo, graus in (('index', -6), ('ring', 5), ('pinky', 11)):
    girar(f'{dedo}-finger-phalanx-proximal', graus, Vector((1, 0, 0)))
curva = {'phalanx-proximal': 12, 'phalanx-intermediate': 15, 'phalanx-distal': 10}
for dedo in ('index-finger', 'middle-finger', 'ring-finger', 'pinky-finger'):
    for parte, graus in curva.items():
        girar(f'{dedo}-{parte}', graus, Vector((0, 1, 0)))  # pontas para -X: em direção à palma
girar('thumb-metacarpal', 12, Vector((0, 0, 1)))
bpy.ops.object.mode_set(mode='OBJECT')
sub = mao.modifiers.new('suave', 'SUBSURF')
sub.levels = sub.render_levels = 2
for f in mao.data.polygons:
    f.use_smooth = True
mao.data.materials.clear()
mao.data.materials.append(pele('pele', opt.cor_pele, 0.45, 0.3))

ossos = arm.pose.bones
nos = [arm.matrix_world @ ossos[f'{d}-finger-phalanx-proximal'].head for d in ('index', 'middle', 'ring', 'pinky')]
pulso = arm.matrix_world @ ossos['wrist'].head
juntas = sum(nos, Vector()) / 4
pontas = sum((arm.matrix_world @ ossos[f'{d}-finger-tip'].head for d in ('index', 'middle', 'ring', 'pinky')), Vector()) / 4
normal = ((inclina @ base).to_3x3() @ Vector((-1, 0, 0))).normalized()

# ---------- Cérebro de lado, flutuando sobre a palma ----------
bpy.ops.import_scene.gltf(filepath=opt.cerebro)
cerebro = next(o for o in sc.objects if o.type == 'MESH' and o != mao)
cerebro.data.transform(cerebro.matrix_world)
cerebro.matrix_world = Matrix.Identity(4)
bm = bmesh.new()
bm.from_mesh(cerebro.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > opt.corte], context='VERTS')
bm.to_mesh(cerebro.data)
bm.free()
# No arquivo: X = frente, Y = para baixo, Z = esquerda/direita → frente para -Y, topo para +Z
cerebro.data.transform(Matrix(((0, 0, 1, 0), (-1, 0, 0, 0), (0, -1, 0, 0), (0, 0, 0, 1))))
pts = [v.co for v in cerebro.data.vertices]
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
escala = 2.9 / (mx.z - mn.z)
centro = Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))  # base do cérebro na origem
cerebro.data.transform(Matrix.Rotation(math.radians(opt.giro), 4, 'Z') @ Matrix.Scale(escala, 4) @ Matrix.Translation(-centro))
cerebro.data.update()
for f in cerebro.data.polygons:
    f.use_smooth = True
liso = cerebro.modifiers.new('liso', 'SMOOTH')
liso.factor = 0.6
liso.iterations = 4
cerebro.data.materials.clear()
cerebro.data.materials.append(pele('cerebro', opt.cor_cerebro, 0.5, 0.25))
# Proporções do print: o cérebro fica sobre o meio da palma (pontas ~0,7 cérebro à direita do centro).
# Fica acima da linha punho → juntas, no ponto com esse x.
larg = max(v.co.x for v in cerebro.data.vertices) - min(v.co.x for v in cerebro.data.vertices)
x_centro = pontas.x - 0.72 * larg
t = max(0.0, min(1.2, (x_centro - pulso.x) / (juntas.x - pulso.x)))
cerebro.location = pulso.lerp(juntas, t) + Vector((0, 0, opt.flutua))  # sem encostar: flutuando sobre a palma
cerebro.rotation_euler = (math.radians(4), 0, 0)

# ---------- Luz, câmera e render ----------
sc.render.engine = 'CYCLES'
sc.cycles.samples = opt.amostras
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x = sc.render.resolution_y = opt.tamanho
sc.view_settings.view_transform = 'Standard'
mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = cor('#f3e9e1')
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.5
sc.world = mundo
alvo = cerebro.location + Vector((0.4, 0, 0.6))


def luz(nome, pos, energia, tamanho):
    obj = bpy.data.objects.new(nome, bpy.data.lights.new(nome, 'AREA'))
    obj.data.energy = energia
    obj.data.size = tamanho
    obj.location = alvo + Vector(pos)
    obj.rotation_euler = (alvo - obj.location).to_track_quat('-Z', 'Y').to_euler()
    sc.collection.objects.link(obj)


luz('principal', (-4, -5, 6), 1300, 5)
luz('preenche', (6, -5, 1), 450, 6)
luz('recorte', (2, 6, 4), 500, 4)

cam = bpy.data.objects.new('camera', bpy.data.cameras.new('camera'))
sc.collection.objects.link(cam)
cam.data.lens = 70
cam.location = alvo + Vector((0, -math.cos(math.radians(14)), math.sin(math.radians(14)))) * 18
cam.rotation_euler = (alvo - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam
sc.render.filepath = opt.saida
bpy.ops.render.render(write_still=True)
