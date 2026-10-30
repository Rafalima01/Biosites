# Margarida realista (pétalas brancas e miolo amarelo), vista de frente com leve inclinação.
# Feita do zero no Blender (pétalas e miolo procedurais); renderiza um PNG sem fundo.
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/margarida.py -- \
#       --tamanho 700 --saida modelos/12-psicologia/public/media/margarida.png
#
# Opções: --saida, --tamanho (px), --petalas (quantidade), --inclinacao (graus), --semente,
#         --petala e --miolo (cores em hex), --amostras (Cycles).
import argparse
import math
import random
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

args = argparse.ArgumentParser()
args.add_argument('--saida', default='margarida.png')
args.add_argument('--tamanho', type=int, default=700)
args.add_argument('--petalas', type=int, default=19)
args.add_argument('--inclinacao', type=float, default=28)
args.add_argument('--semente', type=int, default=7)
args.add_argument('--petala', default='#f6f1e8')
args.add_argument('--miolo', default='#f2b51a')
args.add_argument('--amostras', type=int, default=128)
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


def petala(comprimento, largura):
    """Pétala alongada de ponta arredondada, com um vinco no meio e as bordas levemente erguidas."""
    bm = bmesh.new()
    nu, nv = 24, 8
    grade = []
    for i in range(nu + 1):
        t = i / nu
        # largura: estreita na base, cheia no meio, arredondada na ponta
        w = largura * (0.35 + 0.65 * math.sin(min(t, 0.82) / 0.82 * math.pi / 2)) * (math.sqrt(max(0, 1 - ((t - 0.82) / 0.18) ** 2)) if t > 0.82 else 1)
        linha = []
        for j in range(nv + 1):
            s = j / nv * 2 - 1
            x = t * comprimento
            y = s * w / 2
            z = 0.012 * abs(s) ** 1.5 + 0.006 * (1 - abs(s))  # vinco central
            z += 0.05 * t * t                                    # a pétala sobe um pouco na ponta
            linha.append(bm.verts.new((x, y, z)))
        grade.append(linha)
    for i in range(nu):
        for j in range(nv):
            bm.faces.new((grade[i][j], grade[i + 1][j], grade[i + 1][j + 1], grade[i][j + 1]))
    malha = bpy.data.meshes.new('petala')
    bm.to_mesh(malha)
    bm.free()
    uv = malha.uv_layers.new()
    for loop in malha.loops:
        uv.data[loop.index].uv = (malha.vertices[loop.vertex_index].co.x / comprimento, 0)
    for f in malha.polygons:
        f.use_smooth = True
    return malha


# Material das pétalas: branco quente, um pouco translúcido, levemente creme perto do miolo
mp = bpy.data.materials.new('petala')
mp.use_nodes = True
nt = mp.node_tree
bsdf = nt.nodes['Principled BSDF']
bsdf.inputs['Roughness'].default_value = 0.45
bsdf.inputs['Subsurface Weight'].default_value = 0.35
bsdf.inputs['Subsurface Scale'].default_value = 0.02
coord = nt.nodes.new('ShaderNodeUVMap')
sep = nt.nodes.new('ShaderNodeSeparateXYZ')
rampa = nt.nodes.new('ShaderNodeValToRGB')
rampa.color_ramp.elements[0].position = 0.0
rampa.color_ramp.elements[0].color = cor('#e9dfb8')
rampa.color_ramp.elements[1].position = 0.3
rampa.color_ramp.elements[1].color = cor(opt.petala)
nt.links.new(coord.outputs['UV'], sep.inputs[0])
nt.links.new(sep.outputs['X'], rampa.inputs['Fac'])
nt.links.new(rampa.outputs['Color'], bsdf.inputs['Base Color'])
# veios finos ao longo da pétala
veio = nt.nodes.new('ShaderNodeTexWave')
veio.wave_type = 'BANDS'
veio.bands_direction = 'Y'
veio.inputs['Scale'].default_value = 40
veio.inputs['Distortion'].default_value = 2
rel = nt.nodes.new('ShaderNodeBump')
rel.inputs['Strength'].default_value = 0.08
nt.links.new(veio.outputs['Fac'], rel.inputs['Height'])
nt.links.new(rel.outputs['Normal'], bsdf.inputs['Normal'])

flor = bpy.data.objects.new('flor', None)
sc.collection.objects.link(flor)
for camada, (raio, qtd, z) in enumerate(((0.2, opt.petalas, 0.0), (0.18, opt.petalas - 5, 0.025))):
    for k in range(qtd):
        ang = (k + 0.5 * camada + random.uniform(-0.18, 0.18)) / qtd * math.tau
        comp = random.uniform(0.86, 1.0) * (0.92 if camada else 1)
        obj = bpy.data.objects.new('petala', petala(comp, random.uniform(0.21, 0.25)))
        obj.data.materials.append(mp)
        obj.parent = flor
        sc.collection.objects.link(obj)
        obj.matrix_world = (Matrix.Rotation(ang, 4, 'Z') @ Matrix.Translation((raio, 0, z))
                            @ Matrix.Rotation(math.radians(random.uniform(-8, 6) + (6 if camada else 0)), 4, 'Y')
                            @ Matrix.Rotation(math.radians(random.uniform(-10, 10)), 4, 'X'))

# Miolo: domo achatado amarelo, mais escuro no centro (as florzinhas vêm logo abaixo)
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=0.3, location=(0, 0, 0.035))
miolo = bpy.context.active_object
miolo.scale = (1, 1, 0.5)
miolo.parent = flor
for f in miolo.data.polygons:
    f.use_smooth = True
mm = bpy.data.materials.new('miolo')
mm.use_nodes = True
nt = mm.node_tree
bsdf = nt.nodes['Principled BSDF']
bsdf.inputs['Roughness'].default_value = 0.7
obj_coord = nt.nodes.new('ShaderNodeTexCoord')
sep = nt.nodes.new('ShaderNodeSeparateXYZ')
comp = nt.nodes.new('ShaderNodeVectorMath')
comp.operation = 'LENGTH'
nt.links.new(obj_coord.outputs['Object'], sep.inputs[0])
xy = nt.nodes.new('ShaderNodeCombineXYZ')
nt.links.new(sep.outputs['X'], xy.inputs['X'])
nt.links.new(sep.outputs['Y'], xy.inputs['Y'])
nt.links.new(xy.outputs[0], comp.inputs[0])
# distância ao centro (o miolo tem raio 0,3): centro mais escuro, dourado no meio, anel alaranjado na borda
rampa = nt.nodes.new('ShaderNodeValToRGB')
cores = ((0.0, '#b86a08'), (0.09, '#eba710'), (0.22, opt.miolo), (0.3, '#cf870c'))
rampa.color_ramp.elements[0].position, rampa.color_ramp.elements[0].color = cores[0][0], cor(cores[0][1])
rampa.color_ramp.elements[1].position, rampa.color_ramp.elements[1].color = cores[1][0], cor(cores[1][1])
for pos, hexa in cores[2:]:
    rampa.color_ramp.elements.new(pos).color = cor(hexa)
nt.links.new(comp.outputs['Value'], rampa.inputs['Fac'])
nt.links.new(rampa.outputs['Color'], bsdf.inputs['Base Color'])
vor = nt.nodes.new('ShaderNodeTexVoronoi')
vor.inputs['Scale'].default_value = 60
nt.links.new(obj_coord.outputs['Object'], vor.inputs['Vector'])
rel = nt.nodes.new('ShaderNodeBump')
rel.inputs['Strength'].default_value = 1.0
nt.links.new(vor.outputs['Distance'], rel.inputs['Height'])
nt.links.new(rel.outputs['Normal'], bsdf.inputs['Normal'])
miolo.data.materials.append(mm)

# Florzinhas do miolo: bolinhas em espiral (ângulo áureo) sobre o domo, como numa margarida de verdade
bm = bmesh.new()
qtd = 420
for i in range(qtd):
    r = 0.285 * math.sqrt((i + 0.5) / qtd)
    th = i * math.radians(137.508)
    h = 0.15 * math.sqrt(max(0.0, 1 - (r / 0.3) ** 2))
    bola = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.0165)
    bmesh.ops.transform(bm, verts=bola['verts'], matrix=Matrix.Translation((r * math.cos(th), r * math.sin(th), h)) @ Matrix.Scale(0.75, 4, (0, 0, 1)))
malha = bpy.data.meshes.new('florzinhas')
bm.to_mesh(malha)
bm.free()
for f in malha.polygons:
    f.use_smooth = True
florzinhas = bpy.data.objects.new('florzinhas', malha)
florzinhas.location = (0, 0, 0.035)
florzinhas.parent = flor
malha.materials.append(mm)
sc.collection.objects.link(florzinhas)

flor.rotation_euler = (math.radians(-opt.inclinacao), 0, math.radians(random.uniform(0, 360)))

sc.render.engine = 'CYCLES'
sc.cycles.samples = opt.amostras
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x = sc.render.resolution_y = opt.tamanho
sc.view_settings.view_transform = 'Standard'  # o AgX lava o amarelo do miolo
mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = cor('#f3ece4')
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
sc.world = mundo


def luz(nome, pos, energia, tamanho):
    obj = bpy.data.objects.new(nome, bpy.data.lights.new(nome, 'AREA'))
    obj.data.energy = energia
    obj.data.size = tamanho
    obj.location = pos
    obj.rotation_euler = (Vector((0, 0, 0)) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler()
    sc.collection.objects.link(obj)


luz('principal', (-3, -3, 6), 480, 3)
luz('preenche', (4, -2, 3), 140, 4)

cam = bpy.data.objects.new('camera', bpy.data.cameras.new('camera'))
sc.collection.objects.link(cam)
cam.data.lens = 85
cam.location = (0, 0, 6.5)
sc.camera = cam
sc.render.filepath = opt.saida
bpy.ops.render.render(write_still=True)
