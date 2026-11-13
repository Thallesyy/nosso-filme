# -*- coding: utf-8 -*-
"""Prepara as fotos e os vídeos do filme.

Lê o textos.js, acha todos os nomes de foto e de vídeo que aparecem lá
(us8, dates16, us-video5...) e:
  - copia cada foto pra fotos/ com o lado maior em 1024 px;
  - copia cada vídeo pra videos/ (e a capa dele, o primeiro quadro, que vem do o-nosso-album);
  - escreve o fotos.js com o tamanho e a cor média de cada um (a cor ilumina a sala).

Uso (com o Python que tem o Pillow):
    python ferramentas/preparar-fotos.py
"""
import json
import os
import re
import shutil
import sys

from PIL import Image, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(AQUI)
RAIZ = os.path.dirname(SITE)
PUBLIC = os.path.join(RAIZ, 'eu-e-voce-react 2', 'eu-e-voce-react', 'public')
POSTERS = os.path.join(RAIZ, 'o-nosso-album', 'fotos', 'posters')

# fotos que não entram em site nenhum (regra do CLAUDE.md)
PROIBIDAS = {'dates17', 'dates29', 'dates30', 'dates1', 'dates3', 'dates13', 'random19', 'us23', 'random9'}

LADO = 1024
QUALIDADE = 85


def cor_media(im):
    r, g, b = im.convert('RGB').resize((1, 1), Image.BOX).getpixel((0, 0))
    return [round(r / 255, 3), round(g / 255, 3), round(b / 255, 3)]


def main():
    with open(os.path.join(SITE, 'textos.js'), encoding='utf-8') as f:
        texto = f.read()
    nomes = sorted(set(re.findall(r"'((?:us|dates|random)(?:-video)?\d+)'", texto)))
    fotos = [n for n in nomes if '-video' not in n]
    videos = [n for n in nomes if '-video' in n]

    ruins = [n for n in fotos if n in PROIBIDAS]
    if ruins:
        print('ERRO: estas fotos não podem ser usadas:', ', '.join(ruins))
        sys.exit(1)

    os.makedirs(os.path.join(SITE, 'fotos'), exist_ok=True)
    os.makedirs(os.path.join(SITE, 'videos'), exist_ok=True)
    midia = {'fotos': {}, 'videos': {}}

    for n in fotos:
        origem = os.path.join(PUBLIC, n + '.jpg')
        if not os.path.exists(origem):
            print('AVISO: não achei', n + '.jpg', '(o filme pula essa cena)')
            continue
        im = ImageOps.exif_transpose(Image.open(origem)).convert('RGB')
        im.thumbnail((LADO, LADO), Image.LANCZOS)
        im.save(os.path.join(SITE, 'fotos', n + '.jpg'), quality=QUALIDADE, optimize=True, progressive=True)
        midia['fotos'][n] = {'w': im.width, 'h': im.height, 'cor': cor_media(im)}

    info = {}
    try:
        with open(os.path.join(POSTERS, 'info.json'), encoding='utf-8') as f:
            info = json.load(f)
    except OSError:
        print('AVISO: não achei o info.json das capas dos vídeos')
    for n in videos:
        origem = os.path.join(PUBLIC, n + '.mp4')
        capa = os.path.join(POSTERS, n + '.jpg')
        if not os.path.exists(origem) or not os.path.exists(capa) or n not in info:
            print('AVISO: falta o vídeo ou a capa de', n, '(o filme pula essa cena)')
            continue
        destino = os.path.join(SITE, 'videos', n + '.mp4')
        if not os.path.exists(destino) or os.path.getsize(destino) != os.path.getsize(origem):
            shutil.copyfile(origem, destino)
        im = Image.open(capa).convert('RGB')
        im.save(os.path.join(SITE, 'videos', n + '.jpg'), quality=QUALIDADE, optimize=True)
        midia['videos'][n] = {'w': info[n]['w'], 'h': info[n]['h'], 'dur': info[n]['dur'], 'cor': cor_media(im)}

    # tira da pasta o que não é mais usado
    for pasta, usados, exts in (('fotos', set(midia['fotos']), ('.jpg',)), ('videos', set(midia['videos']), ('.jpg', '.mp4'))):
        for arq in os.listdir(os.path.join(SITE, pasta)):
            base, ext = os.path.splitext(arq)
            if ext in exts and base not in usados:
                os.remove(os.path.join(SITE, pasta, arq))
                print('tirei', pasta + '/' + arq)

    with open(os.path.join(SITE, 'fotos.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* gerado por ferramentas/preparar-fotos.py: não edite na mão */\n')
        f.write('window.MIDIA = ' + json.dumps(midia, separators=(',', ':')) + ';\n')

    def peso(pasta):
        return sum(os.path.getsize(os.path.join(SITE, pasta, a)) for a in os.listdir(os.path.join(SITE, pasta)))
    print('%d fotos (%.1f MB) e %d vídeos (%.1f MB)' % (
        len(midia['fotos']), peso('fotos') / 1e6, len(midia['videos']), peso('videos') / 1e6))


if __name__ == '__main__':
    main()
