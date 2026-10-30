# Papel realista (levemente amassado, bordas rasgadas com fibras) visto de cima. PNG sem fundo,
# para servir de fundo de textos (o texto vai por cima, no HTML).
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/papel.py -- \
#       --proporcao 4.4 --largura 1400 --saida papel-faixa.png
#
# Opções: --proporcao (largura/altura), --largura (px), --rasgo (bordas rasgadas: "cima,baixo,esq,dir"
#         ou "nenhum" para um bilhete de bordas retas), --amasso (força das dobras), --semente, --cor, --amostras.
import argparse
import math
import random
import sys

import bpy
from mathutils import Vector

args = argparse.ArgumentParser()
args.add_argument('--saida', default='papel.png')
args.add_argument('--proporcao', type=float, default=4.4)
args.add_argument('--largura', type=int, default=1400)
args.add_argument('--rasgo', default='cima,baixo,esq,dir')
args.add_argument('--amasso', type=float, default=1.0)
args.add_argument('--semente', type=int, default=3)
args.add_argument('--cor', default='#f6f4f0')
args.add_argument('--amostras', type=int, default=96)
opt = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
random.seed(opt.semente)


def cor(hexa):
    """Hex sRGB → RGBA linear (o Blender trabalha em linear)."""
    h = hexa.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
L, A = opt.proporcao, 1.0  # o papel mede L x 1 (altura 1)

# Malha bem subdividida para as dobras aparecerem de verdade
bpy.ops.mesh.primitive_grid_add(x_subdivisions=int(120 * L), y_subdivisions=120, size=1)
papel = bpy.context.active_object
papel.scale = (L, A, 1)
bpy.ops.object.transform_apply(scale=True)
for f in papel.data.polygons:
    f.use_smooth = True

# Amassado: dobras grandes (voronoi) + ondulação suave (nuvens)
dobras = bpy.data.textures.new('dobras', 'VORONOI')
dobras.distance_metric = 'DISTANCE'
dobras.noise_scale = 0.75
dobras.weight_1, dobras.weight_2 = -1.0, 1.0  # F2 - F1: vincos de papel amassado
dobras.noise_intensity = 1.0
mod = papel.modifiers.new('dobras', 'DISPLACE')
mod.texture = dobras
mod.texture_coords = 'GLOBAL'
mod.strength = 0.06 * opt.amasso
ondas = bpy.data.textures.new('ondas', 'CLOUDS')
ondas.noise_scale = 0.6
mod2 = papel.modifiers.new('ondas', 'DISPLACE')
mod2.texture = ondas
mod2.texture_coords = 'GLOBAL'
mod2.strength = 0.03 * opt.amasso
papel.location.x = random.uniform(-3, 3)  # muda o desenho das dobras de um papel para outro
papel.data.transform(__import__('mathutils').Matrix.Translation((-papel.location.x, 0, 0)))

# ---------- Material: papel claro, borda rasgada com fibras brancas e alfa irregular ----------
m = bpy.data.materials.new('papel')
m.use_nodes = True
m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
nt = m.node_tree
N = nt.nodes
bsdf = N['Principled BSDF']
bsdf.inputs['Roughness'].default_value = 0.85
saida = N['Material Output']

coord = N.new('ShaderNodeTexCoord')
sep = N.new('ShaderNodeSeparateXYZ')
nt.links.new(coord.outputs['Generated'], sep.inputs[0])


def math_node(op, a=None, b=None):
    n = N.new('ShaderNodeMath')
    n.operation = op
    for i, v in enumerate((a, b)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            n.inputs[i].default_value = v
        else:
            nt.links.new(v, n.inputs[i])
    return n.outputs[0]


rasgos = set(opt.rasgo.split(',')) if opt.rasgo != 'nenhum' else set()
grande = 9.0  # borda sem rasgo: distância "infinita"
u, v = sep.outputs['X'], sep.outputs['Y']
# distância (em unidades do papel) até cada borda
d_cima = math_node('MULTIPLY', math_node('SUBTRACT', 1.0, v), A) if 'cima' in rasgos else None
d_baixo = math_node('MULTIPLY', v, A) if 'baixo' in rasgos else None
d_esq = math_node('MULTIPLY', u, L) if 'esq' in rasgos else None
d_dir = math_node('MULTIPLY', math_node('SUBTRACT', 1.0, u), L) if 'dir' in rasgos else None
dist = None
for d in (d_cima, d_baixo, d_esq, d_dir):
    if d is None:
        continue
    dist = d if dist is None else math_node('MINIMUM', dist, d)
if dist is None:
    dist = math_node('ADD', grande, 0.0)

# rasgo: ruído irregular (grosso + fino) que "come" a borda
ruido = N.new('ShaderNodeTexNoise')
ruido.inputs['Scale'].default_value = 3.5
ruido.inputs['Detail'].default_value = 15
ruido.inputs['Roughness'].default_value = 0.72
nt.links.new(coord.outputs['Object'], ruido.inputs['Vector'])
fino = N.new('ShaderNodeTexNoise')
fino.inputs['Scale'].default_value = 140
fino.inputs['Detail'].default_value = 8
nt.links.new(coord.outputs['Object'], fino.inputs['Vector'])
come = math_node('ADD', math_node('MULTIPLY', ruido.outputs['Fac'], 0.2), math_node('MULTIPLY', fino.outputs['Fac'], 0.035))
e = math_node('SUBTRACT', dist, come)  # > 0 dentro do papel

# alfa: corte nítido na borda; faixa de fibras logo antes (mais clara e um pouco transparente)
alfa = math_node('MINIMUM', math_node('MULTIPLY', e, 400.0), 1.0)
alfa = math_node('MAXIMUM', alfa, 0.0)
faixa = math_node('MAXIMUM', math_node('SUBTRACT', 1.0, math_node('MULTIPLY', e, 45.0)), 0.0)
fibras = math_node('MULTIPLY', faixa, fino.outputs['Fac'])
alfa = math_node('MULTIPLY', alfa, math_node('SUBTRACT', 1.0, math_node('MULTIPLY', fibras, 0.35)))

base = N.new('ShaderNodeMix')
base.data_type = 'RGBA'
base.inputs['A'].default_value = cor(opt.cor)
base.inputs['B'].default_value = cor('#ffffff')
nt.links.new(math_node('MINIMUM', math_node('MULTIPLY', faixa, 1.3), 1.0), base.inputs['Factor'])
# manchinhas sutis de papel
mancha = N.new('ShaderNodeTexNoise')
mancha.inputs['Scale'].default_value = 3
escurece = N.new('ShaderNodeMix')
escurece.data_type = 'RGBA'
escurece.blend_type = 'MULTIPLY'
escurece.inputs['Factor'].default_value = 0.06
nt.links.new(base.outputs['Result'], escurece.inputs['A'])
nt.links.new(mancha.outputs['Color'], escurece.inputs['B'])
nt.links.new(escurece.outputs['Result'], bsdf.inputs['Base Color'])

transp = N.new('ShaderNodeBsdfTransparent')
mix = N.new('ShaderNodeMixShader')
nt.links.new(alfa, mix.inputs['Fac'])
nt.links.new(transp.outputs[0], mix.inputs[1])
nt.links.new(bsdf.outputs[0], mix.inputs[2])
nt.links.new(mix.outputs[0], saida.inputs['Surface'])
papel.data.materials.append(m)

# ---------- Luz rasante (realça as dobras) e câmera de cima ----------
sc.render.engine = 'CYCLES'
sc.cycles.samples = opt.amostras
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
sc.render.resolution_x = opt.largura
sc.render.resolution_y = int(opt.largura / (L + 0.2) * (A + 0.2))  # proporção do papel + margem
mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = cor('#ffffff')
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.62
sc.world = mundo
luz = bpy.data.objects.new('luz', bpy.data.lights.new('luz', 'AREA'))
luz.data.energy = 420
luz.data.size = 10
luz.location = (-2, 5, 1.5)
luz.rotation_euler = (Vector((0, 0, 0)) - luz.location).to_track_quat('-Z', 'Y').to_euler()
sc.collection.objects.link(luz)
cam = bpy.data.objects.new('camera', bpy.data.cameras.new('camera'))
cam.data.type = 'ORTHO'
cam.data.ortho_scale = max(L, A) + 0.2
cam.location = (0, 0, 5)
sc.collection.objects.link(cam)
sc.camera = cam
sc.render.filepath = opt.saida
bpy.ops.render.render(write_still=True)
