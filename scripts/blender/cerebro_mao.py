# Cérebro realista de lado, flutuando sobre a palma de uma mão, para o card do Instagram do Modelo 12.
# Renderiza um PNG sem fundo. Modelos usados:
#   - Cérebro: "3D model of the Brain", Nevit Dilmen, M.D. — NIH 3D, 3DPX-003765, licença CC BY-SA 4.0
#     https://3d.nih.gov/entries/3DPX-003765 (GLB "3DModel of Brain NevitDilmen_NIH3D.glb").
#     A imagem gerada é obra derivada: mantenha o crédito e a mesma licença (CC BY-SA 4.0).
#   - Mão: recortada da malha base do MakeHuman (makehuman/data/3dobjs/base.obj), licença CC0
#     https://github.com/makehumancommunity/makehuman (os dedos são juntados e curvados aqui no script)
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/cerebro_mao.py -- \
#       --cerebro cerebro.glb --mao base.obj --tamanho 1200 --saida cerebro-mao.png
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

# ---------- Mão (MakeHuman): recorte do antebraço direito, palma para cima, dedos para a direita ----------
bpy.ops.wm.obj_import(filepath=opt.mao, use_split_groups=True)
objs = {o.name: o for o in sc.objects}


def media(o):
    return sum((o.matrix_world @ v.co for v in o.data.vertices), Vector()) / len(o.data.vertices)


# As juntas vêm como pequenos objetos "joint-*" na malha base: guarda a posição e apaga
J = {n: media(o) for n, o in objs.items() if n.startswith('joint-r-')}
mao = objs['body']
for o in objs.values():
    if o != mao:
        bpy.data.objects.remove(o)
mao.data.transform(mao.matrix_world)
mao.matrix_world = Matrix.Identity(4)
cot, pulso0, ponta0 = J['joint-r-elbow'], J['joint-r-hand'], J['joint-r-finger-3-4']
eixo = ponta0 - cot
bm = bmesh.new()
bm.from_mesh(mao.data)
fora = []
for v in bm.verts:  # fica só o que está perto da linha cotovelo → ponta do dedo médio, da metade do antebraço em diante
    t = (v.co - cot).dot(eixo) / eixo.length_squared
    if t < 0.45 or (v.co - (cot + eixo * max(0.0, min(1.0, t)))).length > 0.85:
        fora.append(v)
bmesh.ops.delete(bm, geom=fora, context='VERTS')
bm.to_mesh(mao.data)
bm.free()

# Referencial da mão: dedos → +X, palma → +Z, polegar → -Y (lado da câmera); origem no punho
d = (ponta0 - pulso0).normalized()
lado = (J['joint-r-finger-2-1'] - J['joint-r-finger-5-1']).normalized()  # do mindinho para o indicador
n = -d.cross(lado).normalized()  # na malha base a palma fica do lado oposto a d × lado
lado = n.cross(d).normalized()
R = Matrix((d, lado, n)).to_4x4()
quadro = R @ Matrix.Translation(-pulso0)
mao.data.transform(quadro)
K1 = {k: quadro @ J[f'joint-r-finger-{k}-1'] for k in range(2, 6)}
K4 = {k: quadro @ J[f'joint-r-finger-{k}-4'] for k in range(2, 6)}


def suaviza(a, b, x):
    x = max(0.0, min(1.0, (x - a) / (b - a)))
    return x * x * (3 - 2 * x)


def dir_xy(k):
    v = K4[k] - K1[k]
    return math.atan2(v.y, v.x)


def posar(p, k, t):
    """Junta o dedo k ao médio (70% da abertura) e curva para cima, aos poucos, a partir da junta da base."""
    a = K1[k]
    giro = -(dir_xy(k) - dir_xy(3)) * 0.7 * suaviza(-0.15, 0.2, t)
    p = a + Matrix.Rotation(giro, 3, 'Z') @ (p - a)
    curva = math.radians(26) * suaviza(0.0, 1.0, t)
    return a + Matrix.Rotation(-curva, 3, 'Y') @ (p - a)  # -Y: as pontas sobem (em direção à palma)


for v in mao.data.vertices:
    melhor = None
    for k in range(2, 6):
        ab = K4[k] - K1[k]
        t = (v.co - K1[k]).dot(ab) / ab.length_squared
        if t < -0.15:
            continue
        dist = (v.co - (K1[k] + ab * max(0.0, min(1.0, t)))).length
        if dist < 0.13 and (melhor is None or dist < melhor[0]):
            melhor = (dist, k, t)
    if melhor:
        v.co = posar(v.co, melhor[1], melhor[2])
pontas_mao = [posar(K4[k], k, 1.0) for k in range(2, 6)]

# Tamanho, inclinação (punho embaixo à esquerda, palma à mostra para a câmera) e acabamento
escala_mao = 6.0 / (ponta0 - pulso0).length
inclina = Matrix.Rotation(math.radians(-18), 4, 'Y') @ Matrix.Rotation(math.radians(38), 4, 'X')
final = inclina @ Matrix.Scale(escala_mao, 4)
mao.data.transform(final)
for f in mao.data.polygons:
    f.use_smooth = True
sub = mao.modifiers.new('suave', 'SUBSURF')
sub.levels = sub.render_levels = 2
mao.data.materials.clear()
mao.data.materials.append(pele('pele', opt.cor_pele, 0.45, 0.3))

pulso = final @ Vector((0, 0, 0))
juntas = final @ (sum(K1.values(), Vector()) / 4)
pontas = final @ (sum(pontas_mao, Vector()) / 4)

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
