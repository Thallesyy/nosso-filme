# o nosso filme ("a novela que eu não perdi")

Site 3D de presente pra Nicolly, pros **6 meses de namoro (20/11/2026)**. A ideia vem da primeira
mensagem do Thales pra ela, respondendo um story no Instagram em 25/03: *"se voce fosse atriz eu
nao perderia nenhuma novela"*. O site é o cinema onde passa essa novela.

Ela toca em "entrar no cinema" e a câmera faz tudo sozinha, numa tomada só:

1. **A rua, à noite** (0 a 14 s): o "Cine Nicolly" cor-de-rosa, com o neon, o letreiro de lâmpadas
   correndo ("a novela que eu não perdi"), o tapete rosa e o chão molhado refletindo tudo.
2. **O saguão** (14 a 39 s): um corredor com **8 cartazes de filme**, um pra cada capítulo da
   história. A câmera vai virando de um lado pro outro, olhando um por um.
3. **A sala** (39 a 55 s): poltronas de veludo rosa, cortina, teto estrelado. A câmera desce o
   corredor, senta, as luzes apagam e a cortina abre.
4. **O filme** (uns 2min40): contagem regressiva de película (3, 2, 1), a cartela do título e os
   capítulos, com as fotos, os vídeos e as legendas. Depois "cenas dos próximos capítulos".
5. **Os créditos** (uns 30 s) e o último quadro, com a frase do story de volta.

Depois do filme ela fica livre: arrasta o dedo pra olhar a sala (se olhar pra trás, vê o projetor),
toca em **"ver os cartazes"** pra voltar ao saguão e abrir cada cartaz, ou em **"ver de novo"**.

- **Músicas:** Love Drought (entrada) · Best Part (filme) · essa aqui é especial (créditos)
- **Material:** 34 fotos e 6 vídeos (29 MB no total, quase tudo dos vídeos e das músicas)
- **Repositório:** ainda não tem (só local) · **No ar:** ainda não

## Onde mexer

**Quase tudo está no `textos.js`** (são rascunhos meus, pode mudar à vontade):

| O quê | Onde no `textos.js` |
|---|---|
| Nome do filme, letreiro, botões, frases do final | `TEXTOS` |
| Os 8 capítulos: título, data, sinopse, a foto do cartaz, as cenas e as legendas | `CAPITULOS` |
| A parte rápida com os vídeos ("os dias") | `OS_DIAS` |
| "Cenas dos próximos capítulos" | `PROXIMOS` |
| Os créditos que sobem | `CREDITOS` |
| Qual música toca em cada parte | `MUSICAS` |

> **A ligação de cada foto com cada dia foi chute meu.** Escolhi pela cara da foto (o abraço, o
> anel, as caixas de pizza no fundo, a praça de alimentação, o lago). Confere e troca pelas certas.

**Depois de trocar o nome de uma foto ou de um vídeo, rode** (com o Python que tem o Pillow):

    python ferramentas/preparar-fotos.py

Ele lê o `textos.js`, copia pra `fotos/` e `videos/` só o que aparece lá (foto com o lado maior em
1024 px), apaga o que não é mais usado e refaz o `fotos.js`. As fotos proibidas do `CLAUDE.md`
dão erro. Se faltar um arquivo, o filme só pula aquela cena.

O filme **se ajusta sozinho pra caber na Best Part** (2min39): se você puser mais cenas, cada foto
fica um pouco menos de tempo na tela. Os vídeos não encolhem.

Outros lugares:

| O quê | Onde |
|---|---|
| Cores e formas da rua, do saguão e da sala | `js/fachada.js`, `js/saguao.js`, `js/sala.js` |
| O desenho dos cartazes | `F.desenharCartaz` no `js/saguao.js` |
| As cartelas, a contagem e os créditos na tela | `js/projecao.js` |
| O caminho e o ritmo da câmera (`CAM`, `OLHAR`, `T_FILME`) | o `<script>` do `index.html` |

## Como funciona por dentro

- **three.js r128** pelo cdnjs. Fontes do Google (Playfair Display, Bebas Neue, Yellowtail).
- Tudo é montado por código (caixas juntadas numa geometria só por ambiente). Não tem modelo 3D
  nem textura baixada: os letreiros, cartazes e cartelas são desenhados em canvas.
- A luz é "falsa": cada ambiente tem até 4 pontos de luz calculados no próprio material, sem sombra.
  A cor média de cada foto ilumina a sala enquanto ela passa.
- O reflexo no chão molhado é o próprio cinema desenhado de cabeça pra baixo, embaixo de um chão
  meio transparente.
- Na tela do cinema ficam só **2 texturas de cada vez** (a cena de agora e a anterior). As fotos
  são buscadas umas 3 cenas antes e soltas depois.
- Os vídeos tocam mudos dentro do 3D (a música fica por cima), em 2 elementos `<video>` que se
  revezam. Enquanto o vídeo não chega, aparece a capa dele (o primeiro quadro).
  - Se o iPhone entregar o vídeo **preto** pro 3D, o site percebe (confere 16 pontos da imagem) e
    passa a mostrar só as capas.
- **Se o 3D cair:** recarrega uma vez; se cair de novo logo em seguida, mostra a **versão simples**
  (o filme vira uma página com os capítulos, as fotos, os vídeos e as legendas).
- Se ficar pesado (abaixo de uns 37 quadros por segundo), baixa a resolução sozinho.

## Para testar

Servidor do preview: `.claude/launch.json` da raiz, nome `o-nosso-filme`, porta **8109**.

| Quero ver... | URL |
|---|---|
| O caminho real | `http://localhost:8109/` |
| Parado no segundo 20 do passeio | `?teste=1&t=20` |
| Parado no segundo 95 do filme | `?teste=1&tf=95` |
| Depois do filme, sentada | `?teste=1&modo=livre` |
| O saguão, no cartaz 5 | `?teste=1&modo=saguao&k=4` |
| A versão simples (sem 3D) | `?simples=1` |
| Sem os vídeos (só as capas) | `?semvideo=1` |

No modo `teste=1` nada anda sozinho. Pelo console: `__filme.t(30)` vai pro segundo 30,
`__filme.tf(95)` pro segundo 95 do filme, `__filme.livre()`, `__filme.saguao(k)`,
`__filme.olhar(lado, altura)`, `__filme.abrir(k)` abre o cartaz e `__filme.info()` mostra as
texturas e chamadas de desenho. **Nunca deixe a aba do preview num endereço `?teste=1`.**

## O que já foi conferido (no navegador do app, tamanho de iPhone 13: 390×664, resolução 2x)

- o caminho real inteiro, do botão até o último quadro (4min08): a música toca e troca nas horas
  certas (entrada, silêncio na contagem, filme, créditos), as legendas aparecem, os vídeos tocam
  dentro da tela do cinema e os botões do final aparecem;
- "pular pro filme", arrastar pra olhar a sala, "ver os cartazes", as setas, tocar no cartaz
  (abre grande, com a sinopse), "voltar pra sala" e "ver de novo";
- a versão simples e a queda do 3D (a 1ª recarrega, a 2ª cai na versão simples);
- tela larga de computador;
- nenhum arquivo faltando (23 pedidos, nenhum 404); `node --check` em todo o JavaScript;
- peso nesta máquina: **60 quadros por segundo** o tempo todo (média de 16,7 ms; o pior quadro,
  fora o do toque no botão, foi de 67 ms).

## O que **não** foi conferido

- **iPhone de verdade.** O que mais vale testar lá:
  - a música começar ao tocar em "entrar no cinema" e **trocar sozinha** quando o filme começa e
    nos créditos (a troca acontece fora de um toque; em teoria o iPhone deixa, porque é o mesmo
    player que já foi liberado no toque);
  - os **vídeos dentro da tela do cinema** (é o ponto mais arriscado; se vierem pretos, o site
    troca pelas capas sozinho);
  - o tamanho da tela com a barra do Safari aparecendo (o canvas usa `100dvh`);
  - as legendas não ficarem por baixo da barra do Safari;
  - se roda liso (a 2x de resolução são 780×1328 pontos);
  - com o **modo silencioso** ligado, a música toca mas o barulhinho do projetor e os bipes da
    contagem não (é assim no iPhone).
- Rede lenta (3G): os vídeos somam 20 MB. Se um vídeo não chegar a tempo, fica a capa dele.

## O que ainda falta

- o Thales editar os textos e conferir as fotos de cada capítulo;
- criar o repositório, enviar e ativar o GitHub Pages (perguntar antes);
- ele testar no iPhone antes do dia 20/11.
