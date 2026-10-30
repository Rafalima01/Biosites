# Cérebro 3D realista (vista de frente, tom bege-rosado) para o card "Saúde Mental" do Modelo 12.
# Renderiza um PNG sem fundo a partir de um modelo real feito de ressonância magnética:
#   "3D model of the Brain", Nevit Dilmen, M.D. — NIH 3D, 3DPX-003765, licença CC BY-SA 4.0
#   https://3d.nih.gov/entries/3DPX-003765 (baixe o GLB "3DModel of Brain NevitDilmen_NIH3D.glb").
# A imagem gerada é obra derivada: mantenha o crédito e a mesma licença (CC BY-SA 4.0).
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/cerebro.py -- \
#       --modelo cerebro.glb --tamanho 900 --saida modelos/12-psicologia/public/media/cerebro-real.png
#
# Opções: --modelo (GLB), --saida, --tamanho (px), --cor (hex), --altura (graus da câmera acima da
#         frente), --corte (altura em mm a partir da qual o tronco cerebral é removido), --amostras.
import argparse
import math
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

args = argparse.ArgumentParser()
args.add_argument('--modelo', required=True)
args.add_argument('--saida', default='cerebro.png')
args.add_argument('--tamanho', type=int, default=900)
args.add_argument('--cor', default='#c9ab9d')
args.add_argument('--altura', type=float, default=12)
args.add_argument('--corte', type=float, default=-88)
args.add_argument('--amostras', type=int, default=128)
args.add_argument('--giro', type=float, default=0, help='giro em graus em torno do eixo vertical')
opt = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])


def cor(hexa):
    """Hex sRGB → RGBA linear (o Blender trabalha em linear)."""
    h = hexa.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=opt.modelo)
cerebro = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
bpy.context.view_layer.objects.active = cerebro

# No arquivo original: X = frente, Y = para baixo (o tronco desce até y = 0), Z = esquerda/direita.
# Aplica a transformação do import e gira para o padrão do Blender (frente para -Y, topo para +Z).
cerebro.data.transform(cerebro.matrix_world)
cerebro.matrix_world = Matrix.Identity(4)
bm = bmesh.new()
bm.from_mesh(cerebro.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > opt.corte], context='VERTS')  # tronco cerebral
bm.to_mesh(cerebro.data)
bm.free()
cerebro.data.transform(Matrix(((0, 0, 1, 0), (-1, 0, 0, 0), (0, -1, 0, 0), (0, 0, 0, 1))))
cerebro.data.update()

# Centraliza e normaliza o tamanho (altura ~2 unidades)
pts = [v.co for v in cerebro.data.vertices]
mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
escala = 2 / (mx.z - mn.z)
cerebro.data.transform(Matrix.Rotation(math.radians(opt.giro), 4, 'Z') @ Matrix.Scale(escala, 4) @ Matrix.Translation(-(mn + mx) / 2))
cerebro.data.update()
for f in cerebro.data.polygons:
    f.use_smooth = True
liso = cerebro.modifiers.new('liso', 'SMOOTH')  # tira o "granulado" da ressonância, mantendo os giros
liso.factor = 0.6
liso.iterations = 4

m = bpy.data.materials.new('pele')
m.use_nodes = True
p = m.node_tree.nodes['Principled BSDF']
p.inputs['Base Color'].default_value = cor(opt.cor)
p.inputs['Roughness'].default_value = 0.5
p.inputs['Subsurface Weight'].default_value = 0.25
p.inputs['Subsurface Radius'].default_value = (0.06, 0.03, 0.02)
p.inputs['Subsurface Scale'].default_value = 0.05
cerebro.data.materials.clear()
cerebro.data.materials.append(m)

sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = opt.amostras
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x = sc.render.resolution_y = opt.tamanho
sc.view_settings.view_transform = 'Standard'  # cores fiéis (o AgX deixa o tom de pele acinzentado)

mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = cor('#f3e9e1')
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55
sc.world = mundo


def luz(nome, pos, energia, tamanho):
    obj = bpy.data.objects.new(nome, bpy.data.lights.new(nome, 'AREA'))
    obj.data.energy = energia
    obj.data.size = tamanho
    obj.location = pos
    obj.rotation_euler = (Vector((0, 0, 0)) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler()
    sc.collection.objects.link(obj)


luz('principal', (-3.5, -5, 5), 650, 4)   # de cima, pela esquerda (como no print)
luz('preenche', (5, -4, 1), 260, 5)
luz('recorte', (0, 5, 4), 300, 3)

cam = bpy.data.objects.new('camera', bpy.data.cameras.new('camera'))
sc.collection.objects.link(cam)
cam.data.lens = 85
a = math.radians(opt.altura)
cam.location = Vector((0, -math.cos(a), math.sin(a))) * 11
cam.rotation_euler = (Vector((0, 0, 0)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.sensor_fit = 'HORIZONTAL'
sc.camera = cam

sc.render.filepath = opt.saida
bpy.ops.render.render(write_still=True)
