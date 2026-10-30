# Tachinha (alfinete de mural) vermelha realista: cabeça brilhante, colar e agulha de metal.
# Renderiza um PNG sem fundo, levemente inclinada, vista de frente e de cima.
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/tachinha.py -- \
#       --tamanho 400 --saida tachinha-real.png
#
# Opções: --saida, --tamanho (px), --cor (hex da cabeça), --amostras.
import argparse
import math
import sys

import bpy
from mathutils import Vector

args = argparse.ArgumentParser()
args.add_argument('--saida', default='tachinha.png')
args.add_argument('--tamanho', type=int, default=400)
args.add_argument('--cor', default='#c8161d')
args.add_argument('--amostras', type=int, default=96)
opt = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])


def cor(hexa):
    """Hex sRGB → RGBA linear (o Blender trabalha em linear)."""
    h = hexa.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def material(nome, base, metal=0.0, rugosidade=0.2, verniz=0.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = cor(base)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rugosidade
    p.inputs['Coat Weight'].default_value = verniz
    return m


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
plastico = material('plastico', opt.cor, rugosidade=0.25, verniz=0.6)
metal = material('metal', '#c9ccd1', metal=1.0, rugosidade=0.25)

pino = bpy.data.objects.new('pino', None)
sc.collection.objects.link(pino)


def suave(obj):
    for f in obj.data.polygons:
        f.use_smooth = True
    obj.parent = pino


bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1, location=(0, 0, 2.2))
cabeca = bpy.context.active_object
cabeca.scale = (1, 1, 0.92)
cabeca.data.materials.append(plastico)
suave(cabeca)
bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=0.42, radius2=0.62, depth=0.9, location=(0, 0, 1.15))
colar = bpy.context.active_object
colar.data.materials.append(plastico)
suave(colar)
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.75, depth=0.18, location=(0, 0, 0.7))
disco = bpy.context.active_object
bev = disco.modifiers.new('quina', 'BEVEL')
bev.width = 0.06
bev.segments = 4
disco.data.materials.append(plastico)
suave(disco)
bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.09, radius2=0.0, depth=1.6, location=(0, 0, -0.15), rotation=(math.pi, 0, 0))
agulha = bpy.context.active_object
agulha.rotation_euler = (0, 0, 0)
agulha.data.transform(__import__('mathutils').Matrix.Rotation(math.pi, 4, 'X'))
agulha.data.materials.append(metal)
suave(agulha)

pino.rotation_euler = (math.radians(-18), math.radians(24), 0)  # cravada de leve, inclinada para a direita

sc.render.engine = 'CYCLES'
sc.cycles.samples = opt.amostras
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
sc.render.resolution_x = sc.render.resolution_y = opt.tamanho
mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = cor('#e8eef7')
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.7
sc.world = mundo


def luz(nome, pos, energia, tamanho):
    obj = bpy.data.objects.new(nome, bpy.data.lights.new(nome, 'AREA'))
    obj.data.energy = energia
    obj.data.size = tamanho
    obj.location = pos
    obj.rotation_euler = (Vector((0, 0, 1.2)) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler()
    sc.collection.objects.link(obj)


luz('principal', (-4, -4, 7), 900, 3)
luz('brilho', (3, -5, 4), 300, 1.5)
cam = bpy.data.objects.new('camera', bpy.data.cameras.new('camera'))
sc.collection.objects.link(cam)
cam.data.lens = 85
cam.location = Vector((0, -math.cos(math.radians(25)), math.sin(math.radians(25)))) * 16 + Vector((0, 0, 1.2))
cam.rotation_euler = (Vector((0, 0, 1.2)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam
sc.render.filepath = opt.saida
bpy.ops.render.render(write_still=True)
