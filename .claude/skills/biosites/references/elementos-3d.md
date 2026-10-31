# Elementos 3D e imagens

## Onde buscar (com licença)

| Recurso | Licença | Como baixar |
| --- | --- | --- |
| **Fluent Emoji 3D** (carinhas, corações, balões, flores estilizadas) | MIT | `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Nome%20do%20emoji>/3D/<nome_do_emoji>_3d.png` (256 px) |
| **Fotos Unsplash** | Unsplash (grátis) | hotlink `images.unsplash.com/photo-...?...&fm=webp`, com `srcset` |
| **Cérebro real (ressonância)** — Nevit Dilmen, NIH 3D 3DPX-003765 | **CC BY-SA 4.0**: crédito no site (`footer.credits`) e imagem derivada na mesma licença | o link direto do S3 dá AccessDenied; use a API: `https://3d.nih.gov/api/entries/3DPX-003765` lista os arquivos e `https://3d.nih.gov/api/submissions/<id>/runs/<run>/output-files/<fileId>` baixa (GLB de 24 MB: submissão 5558) |
| **Corpo/mão humanos realistas** — malha base do MakeHuman | **CC0** | `raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/3dobjs/base.obj`; juntas vêm como objetos `joint-*` |
| Calendário 3D (pacote 3dicons, premium) | do pacote | já extraído no Modelo 10 |

Não serviram: mão "generic-hand" do WebXR (MIT, mas simples demais: deforma nas juntas — o usuário
reclamou); Openverse (API com timeout); busca do Wikimedia Commons (quase nada recortado).
Sites para indicar ao usuário quando não houver nada livre: CGTrader, RenderHub, Sketchfab (filtro CC0/CC-BY,
precisa de login), Superhive (Blender Market).

## Scripts do Blender (`scripts/blender/`, Blender 5.2 em `C:\Program Files\Blender Foundation\Blender 5.2`)

| Script | Faz |
| --- | --- |
| `calendario.py`, `selo.py` | calendário 3D (31 dias) e selo de tesoura, estilo grafite/dourado (Modelo 10) |
| `cerebro.py` | cérebro real de frente/trás, tom de pele (`--cor`, `--giro`) |
| `margarida.py` | margarida do zero: pétalas + miolo com florzinhas em espiral áurea |
| `cerebro_mao.py` | cérebro de lado flutuando sobre a mão do MakeHuman (palma para cima) |
| `papel.py` | papel amassado com bordas rasgadas e fibras (`--proporcao`, `--rasgo nenhum` = bilhete) |
| `tachinha.py` | tachinha vermelha de mural |
| `../imagens/recorta.ps1` | recorta o PNG pelo alfa e redimensiona (System.Drawing) |
| `webp.py` | converte PNG → WebP pelo Blender, com cores fiéis |

Uso: `blender.exe -b -P scripts/blender/<script>.py -- <opções>` (instruções no topo de cada arquivo).
Pipeline: render 1000–1200 px → `recorta.ps1` (largura final ~2× a exibida) → `webp.py` → `public/media/`.
WebP fica 10–35 KB.

## Armadilhas do Blender (custaram tempo)

- **Gestão de cor:** o AgX padrão lava cores (tom de pele vira cinza, amarelo vira pêssego). Use
  `view_transform = 'Standard'` nos renders de cor fiel. **`image.save_render()` aplica a gestão de cor da
  cena** — na conversão para WebP, ponha a cena em Standard, senão o AgX é aplicado de novo.
- **Importação:** o glTF já aplica Y-up; o **OBJ deixa uma rotação de 90° no objeto** — aplique
  `data.transform(matrix_world)` e zere a matriz antes de mexer nos vértices.
- **Orientação de modelo desconhecido:** renderize vistas ortográficas (workbench, rápido) de vários eixos
  antes de decidir. Mão: confira de que lado está a **palma** (mão direita, palma para você, dedos para cima →
  polegar à direita). Errar isso deixou a palma para baixo e os dedos dobrando para trás.
- **Pose sem rig:** dá para dobrar dedos girando os vértices em torno das juntas, com peso suave
  (`smoothstep`) ao longo do dedo; juntar os dedos = girar em torno da normal da palma.
- **Modelo de ressonância:** granulado → modificador Smooth (fator 0.6, 4 iterações); corte o tronco
  cerebral apagando vértices abaixo de um plano.
- Contas de posição: use as proporções do print (ex.: pontas dos dedos a ~0,7 largura do cérebro à direita
  do centro) e calcule a posição no script, em vez de chutar.
- Testes rápidos em 500–600 px com 24–32 amostras; final com 128.
