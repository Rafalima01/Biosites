# Casa branca de telhado cinza sobre uma "ilha" de grama (fatia de terreno com arbustos floridos e árvores),
# feita do zero no Blender. Renderiza um PNG sem fundo, em vista 3/4 de cima (card de imóveis do Modelo 13).
#
# Uso (na raiz do repositório):
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P scripts/blender/casa_ilha.py -- \
#       --tamanho 900 --saida casa-ilha.png
#
# Opções: --saida, --tamanho (px), --semente (posição dos arbustos), --amostras.
import argparse
import math
import random
import sys

import bpy
from mathutils import Vector

args = argparse.ArgumentParser()
args.add_argument('--saida', default='casa-ilha.png')
args.add_argument('--tamanho', type=int, default=900)
args.add_argument('--semente', type=int, default=4)
args.add_argument('--amostras', type=int, default=96)
opt = args.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
random.seed(opt.semente)


def cor(hexa):
    """Hex sRGB → RGBA linear (o Blender trabalha em linear)."""
    h = hexa.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def material(nome, base, rugosidade=0.7, ruido=0.0):
    """Material simples; `ruido` mancha a cor (folhagem, grama, terra)."""
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes['Principled BSDF']
    p.inputs['Roughness'].default_value = rugosidade
    if ruido:
        tex = nt.nodes.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = 18
        mix = nt.nodes.new('ShaderNodeMix')
        mix.data_type = 'RGBA'
        mix.inputs['A'].default_value = cor(base)
        escura = [c * (1 - ruido) for c in cor(base)[:3]] + [1.0]
        mix.inputs['B'].default_value = escura
        nt.links.new(tex.outputs['Fac'], mix.inputs['Factor'])
        nt.links.new(mix.outputs['Result'], p.inputs['Base Color'])
    else:
        p.inputs['Base Color'].default_value = cor(base)
    return m


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
M = {
    'grama': material('grama', '#8fae3a', ruido=0.35),
    'terra': material('terra', '#7a5a3a', ruido=0.3),
    'parede': material('parede', '#f3f1ec', 0.6),
    'telhado': material('telhado', '#5c6068', 0.55),
    'vidro': material('vidro', '#2b3a4a', 0.15),
    'porta': material('porta', '#8a6a4a', 0.5),
    'arbusto': material('arbusto', '#a7b33c', ruido=0.4),
    'flor': material('flor', '#e7c43a', 0.6),
    'copa': material('copa', '#3f6a2a', ruido=0.45),
    'tronco': material('tronco', '#5a4330', 0.8),
}


def objeto(op, mat, suave=True, **kw):
    op(**kw)
    o = bpy.context.active_object
    o.data.materials.append(M[mat])
    if suave:
        for f in o.data.polygons:
            f.use_smooth = True
    return o


def caixa(mat, loc, dim):
    o = objeto(bpy.ops.mesh.primitive_cube_add, mat, suave=False, location=loc)
    o.scale = (dim[0] / 2, dim[1] / 2, dim[2] / 2)
    return o


def irregular(o, forca, escala):
    tex = bpy.data.textures.new('ruido', 'CLOUDS')
    tex.noise_scale = escala
    mod = o.modifiers.new('irregular', 'DISPLACE')
    mod.texture = tex
    mod.strength = forca



# Ilha: disco de terra com a tampa de grama, bordas irregulares
terra = objeto(bpy.ops.mesh.primitive_cylinder_add, 'terra', vertices=96, radius=2.4, depth=0.8, location=(0, 0, -0.42))
terra.scale = (1.15, 0.85, 1)
sub = terra.modifiers.new('sub', 'SUBSURF')
sub.levels = 2
irregular(terra, 0.12, 0.6)
grama = objeto(bpy.ops.mesh.primitive_cylinder_add, 'grama', vertices=96, radius=2.45, depth=0.1, location=(0, 0, 0.0))
grama.scale = (1.15, 0.85, 1)
sub = grama.modifiers.new('sub', 'SUBSURF')
sub.levels = 2
irregular(grama, 0.06, 0.4)

# Casa: corpo de dois andares + ala lateral, telhados de duas águas, janelas e porta
caixa('parede', (0.1, 0.25, 0.75), (1.7, 1.1, 1.5))
caixa('parede', (-1.0, 0.3, 0.45), (0.8, 0.9, 0.9))


def telhado(cx, cy, z, larg, prof, alto, beiral=0.12):
    """Prisma triangular (duas águas) com a cumeeira ao longo de y."""
    import bmesh
    bm = bmesh.new()
    a, b = larg / 2 + beiral, prof / 2 + beiral
    v = [bm.verts.new(p) for p in ((-a, -b, 0), (a, -b, 0), (0, -b, alto), (-a, b, 0), (a, b, 0), (0, b, alto))]
    for face in ((0, 1, 2), (3, 5, 4), (0, 3, 4, 1), (1, 4, 5, 2), (0, 2, 5, 3)):
        bm.faces.new([v[i] for i in face])
    malha = bpy.data.meshes.new('telhado')
    bm.to_mesh(malha)
    o = bpy.data.objects.new('telhado', malha)
    sc.collection.objects.link(o)
    o.location = (cx, cy, z)
    o.data.materials.append(M['telhado'])
    sol = o.modifiers.new('espessura', 'SOLIDIFY')
    sol.thickness = 0.06
    return o


telhado(0.1, 0.25, 1.5, 1.7, 1.1, 0.75)
telhado(-1.0, 0.3, 0.9, 0.8, 0.9, 0.45)
for x in (-0.35, 0.55):
    for z in (0.45, 1.1):
        caixa('vidro', (x, -0.31, z), (0.36, 0.04, 0.42))
caixa('vidro', (-1.0, -0.16, 0.45), (0.34, 0.04, 0.36))
caixa('porta', (0.1, -0.31, 0.32), (0.3, 0.04, 0.62))

# Árvores (tronco + copa de esferas irregulares) nas laterais
for x, y, h in ((-2.0, 0.6, 1.6), (2.1, 0.5, 1.5), (1.6, 1.1, 1.2)):
    objeto(bpy.ops.mesh.primitive_cylinder_add, 'tronco', radius=0.07, depth=h * 0.6, location=(x, y, h * 0.3))
    for _ in range(4):
        c = objeto(bpy.ops.mesh.primitive_ico_sphere_add, 'copa', subdivisions=3,
                   radius=random.uniform(0.32, 0.45),
                   location=(x + random.uniform(-0.25, 0.25), y + random.uniform(-0.2, 0.2), h * 0.7 + random.uniform(-0.1, 0.25)))
        irregular(c, 0.12, 0.25)

# Arbustos floridos espalhados pela frente e pelos lados (sem entrar na casa)
for _ in range(170):
    ang = random.uniform(0, math.tau)
    r = math.sqrt(random.uniform(0.15, 1.0)) * 2.25
    x, y = math.cos(ang) * r * 1.12, math.sin(ang) * r * 0.82
    if -1.5 < x < 1.05 and -0.35 < y < 0.9:
        continue
    b = objeto(bpy.ops.mesh.primitive_ico_sphere_add, 'flor' if random.random() < 0.35 else 'arbusto',
               subdivisions=2, radius=random.uniform(0.1, 0.2), location=(x, y, 0.1))
    b.scale.z = 0.7
    irregular(b, 0.05, 0.15)

# Luz de sol suave, câmera 3/4 de cima
sc.render.engine = 'CYCLES'
sc.cycles.samples = opt.amostras
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
sc.render.resolution_x = opt.tamanho
sc.render.resolution_y = int(opt.tamanho * 0.75)
mundo = bpy.data.worlds.new('mundo')
mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = cor('#e8eef6')
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.7
sc.world = mundo
sol = bpy.data.objects.new('sol', bpy.data.lights.new('sol', 'SUN'))
sol.data.energy = 3.2
sol.data.angle = math.radians(8)
sol.rotation_euler = (math.radians(50), math.radians(-25), math.radians(-30))
sc.collection.objects.link(sol)
cam = bpy.data.objects.new('camera', bpy.data.cameras.new('camera'))
sc.collection.objects.link(cam)
cam.data.lens = 60
alvo = Vector((0, 0.1, 0.45))
cam.location = alvo + Vector((-0.35, -1, 0.5)).normalized() * 12
cam.rotation_euler = (alvo - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam
sc.render.filepath = opt.saida
bpy.ops.render.render(write_still=True)
