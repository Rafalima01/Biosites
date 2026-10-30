# Selo 3D com tesoura (placa laranja + tesoura em relevo), no mesmo estilo do calendário 3D:
# mesma pose, luz e câmera de scripts/blender/calendario.py. Renderiza um PNG sem fundo.
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/selo.py -- \
#       --tamanho 200 --saida modelos/10-barbearia/public/media/selo-tesoura.png
#
# Opções: --saida, --tamanho (px), --placa, --tesoura, --dourado (cores em hex), --giro x,y,z (graus),
#         --amostras (Cycles).
import argparse
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

args = argparse.ArgumentParser()
args.add_argument('--saida', default='selo.png')
args.add_argument('--tamanho', type=int, default=400)
args.add_argument('--placa', default='#ff8d24')
args.add_argument('--tesoura', default='#172036')
args.add_argument('--dourado', default='#d4a043')
args.add_argument('--giro', default='-7,-8,-12')
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
        p.inputs['Coat Roughness'].default_value = 0.15
    return m


def suave(obj, quina):
    mod = obj.modifiers.new('quinas', 'BEVEL')
    mod.width = quina
    mod.segments = 5
    mod.limit_method = 'ANGLE'
    for f in obj.data.polygons:
        f.use_smooth = True
    obj.modifiers.new('normais', 'WEIGHTED_NORMAL')


def novo(nome):
    malha = bpy.data.meshes.new(nome)
    obj = bpy.data.objects.new(nome, malha)
    bpy.context.collection.objects.link(obj)
    return obj, malha


def placa(nome, lado, espessura, raio, mat):
    """Placa quadrada de cantos bem arredondados, deitada no plano XZ (frente voltada para -Y)."""
    obj, malha = novo(nome)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * lado, v.co.y * espessura, v.co.z * lado))
    arestas = [e for e in bm.edges if abs(e.verts[0].co.y - e.verts[1].co.y) > 1e-6]
    bmesh.ops.bevel(bm, geom=arestas, offset=raio, segments=14, affect='EDGES', profile=0.5)
    bm.to_mesh(malha)
    bm.free()
    obj.data.materials.append(mat)
    suave(obj, espessura * 0.3)
    return obj


def perfil(nome, pontos, espessura, mat):
    """Peça plana extrudada a partir de um contorno 2D (x, z), na frente da placa."""
    obj, malha = novo(nome)
    bm = bmesh.new()
    vs = [bm.verts.new((x, 0, z)) for x, z in pontos]
    face = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[face])
    for v in ext['geom']:
        if isinstance(v, bmesh.types.BMVert):
            v.co.y -= espessura
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(malha)
    bm.free()
    obj.data.materials.append(mat)
    suave(obj, espessura * 0.35)
    return obj


bpy.ops.wm.read_factory_settings(use_empty=True)
cena = bpy.context.scene

laranja = material('placa', opt.placa, rugosidade=0.25, verniz=1.0)
escuro = material('tesoura', opt.tesoura, rugosidade=0.5)
ouro = material('ouro', opt.dourado, metal=1.0, rugosidade=0.26)

grupo = bpy.data.objects.new('selo', None)
cena.collection.objects.link(grupo)

E = 0.34
placa('placa', 2.0, E, 0.52, laranja).parent = grupo

# Tesoura montada apontando para +X e depois girada na diagonal (pontas para cima à direita)
tesoura = bpy.data.objects.new('tesoura', None)
cena.collection.objects.link(tesoura)
tesoura.parent = grupo
frente = -E / 2  # face da frente da placa
ALTO = 0.09      # quanto a tesoura sobressai da placa

for i, s in enumerate((1, -1)):
    # lâmina: sai da argola do lado oposto, cruza no pivô e afina até a ponta
    # lâminas abertas (pontas afastadas) e largas, para ler bem pequeno
    lam = perfil(f'lamina{i}', [(-0.32, -0.16 * s), (-0.32, -0.02 * s), (0.08, 0.06 * s), (0.80, 0.23 * s),
                                (0.86, 0.19 * s), (0.10, -0.06 * s)], ALTO, escuro)
    lam.location = (0, frente - 0.002 - 0.012 * i, 0)
    lam.parent = tesoura
    # argola
    bpy.ops.mesh.primitive_torus_add(major_radius=0.19, minor_radius=0.07, major_segments=48, minor_segments=14)
    arg = bpy.context.object
    arg.rotation_euler = (math.radians(90), 0, 0)
    arg.location = (-0.52, frente - ALTO / 2, -0.25 * s)
    arg.data.materials.append(escuro)
    for f in arg.data.polygons:
        f.use_smooth = True
    arg.parent = tesoura

# Parafuso dourado no cruzamento
bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.05, vertices=32)
pino = bpy.context.object
pino.rotation_euler = (math.radians(90), 0, 0)
pino.location = (0.0, frente - ALTO - 0.03, 0.0)
pino.data.materials.append(ouro)
suave(pino, 0.015)
pino.parent = tesoura

tesoura.rotation_euler = (0, math.radians(-38), 0)  # gira no plano da placa (pontas para cima)
tesoura.location = (0.17, 0, 0.1)
tesoura.scale = (1.05, 1, 1.05)

grupo.rotation_euler = tuple(math.radians(float(g)) for g in opt.giro.split(','))

# Câmera, alvo e luzes iguais às do calendário
bpy.ops.object.camera_add(location=(0, -10.2, 0.5))
cam = bpy.context.object
cam.data.lens = 120
alvo = bpy.data.objects.new('alvo', None)
cena.collection.objects.link(alvo)
alvo.location = (0.0, 0, 0.0)
c = cam.constraints.new('TRACK_TO')
c.target = alvo
c.track_axis = 'TRACK_NEGATIVE_Z'
c.up_axis = 'UP_Y'
cena.camera = cam


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
luz('frente', 90, (-1.5, -7, 1.2), 3)

mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = (0.45, 0.47, 0.55, 1)
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.12
cena.world = mundo

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
