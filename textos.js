/* =====================================================================
   OS TEXTOS DO FILME: são rascunhos, pode mudar à vontade.
   Depois de trocar o nome de uma FOTO ou de um VÍDEO aqui, rode:
       python ferramentas/preparar-fotos.py
   (ele copia pra pasta fotos/ e videos/ só o que aparece neste arquivo)
   ===================================================================== */

var TEXTOS = {
  cinema: 'Nicolly',                         // o letreiro de neon em cima do cinema ("cine" aparece sozinho)
  titulo: 'a novela que eu não perdi',       // o nome do filme (letreiro, cartela e créditos)
  hoje: 'hoje · sessão única',               // a linha de cima do letreiro
  com: 'com Nicolly e Thales',               // a linha de baixo do letreiro
  apresenta: 'Thales apresenta',             // aparece na rua, no começo
  estrelando: 'estrelando Nicolly',
  botao: 'entrar no cinema',
  aberturaSub: 'pra Nicolly, nos nossos seis meses',
  sala: 'sala 1',
  sessao: 'sessão das 20:05',
  umFilmeDe: 'um filme de Thales',
  capitulo: 'capítulo',
  osDias: 'os dias',                         // a cartela da parte dos vídeos
  osDiasSub: 'todos os outros',
  proximoTitulo: 'cenas dos próximos capítulos',
  continua: 'continua...',
  fraseStory: '“se voce fosse atriz eu nao perderia nenhuma novela”',
  fimLinha1: 'eu não perdi nenhum capítulo.',
  fimLinha2: 'eu te amo, Nicolly.',
  fim: 'fim',
  verDeNovo: 'ver de novo',
  irSaguao: 'ver os cartazes',
  voltarSala: 'voltar pra sala',
  pular: 'pular pro filme »',
  dicaSentado: 'arrasta pra olhar a sala',
  dicaSaguao: 'toca no cartaz pra ver grande',
  // os dois cartazes da vitrine, na rua
  fotoCartaz: 'dates23', emCartaz: 'em cartaz',
  fotoEmBreve: 'us57', emBreve: 'em breve', emBreveTitulo: 'os próximos capítulos', emBreveData: 'a vida inteira'
};

/* Os capítulos. Cada um vira um CARTAZ no saguão (a "foto") e um trecho do filme (as "cenas").
   - foto / video: o nome do arquivo, sem .jpg (us8, dates16, us-video5...)
   - legenda: a frase que aparece embaixo, como legenda de filme
   - a ligação de cada foto com cada dia foi CHUTE meu: troca pelas fotos certas */
var CAPITULOS = [
  { titulo: 'o story', data: '25 de março de 2026', curta: '25/03',
    sinopse: 'ele respondeu um story dela. ela respondeu de volta. o resto é esse filme.',
    foto: 'dates22',
    cenas: [
      { foto: 'dates9',  legenda: 'tudo começou com um story seu.' },
      { foto: 'dates22', legenda: 'eu respondi: “se voce fosse atriz eu nao perderia nenhuma novela”' },
      { foto: 'dates12', legenda: 'e deu certo.' }
    ] },
  { titulo: 'o primeiro abraço', data: '28 de março de 2026', curta: '28/03',
    sinopse: 'três dias depois, eles se viram pela primeira vez. um dos melhores dias da vida dele.',
    foto: 'us8',
    cenas: [
      { foto: 'us21', legenda: 'três dias depois, a gente se viu pela primeira vez.' },
      { foto: 'us8',  legenda: 'o primeiro abraço.' },
      { foto: 'us34', legenda: 'um dos melhores dias da minha vida.' }
    ] },
  { titulo: 'o zoológico', data: '19 de abril de 2026', curta: '19/04',
    sinopse: 'o primeiro encontro. o famoso dia do zoológico.',
    foto: 'dates16',
    cenas: [
      { foto: 'dates16', legenda: 'o nosso primeiro encontro.' },
      { foto: 'dates8',  legenda: 'o famoso dia do zoológico.' },
      { foto: 'us7',     legenda: 'foi ali que tudo começou de verdade.' }
    ] },
  { titulo: 'o cinema', data: '6 de maio de 2026', curta: '06/05',
    sinopse: 'o filme do MJ. ela chorou. ele chorou também.',
    foto: 'us41',
    cenas: [
      { foto: 'us40', legenda: 'o dia do filme do MJ.' },
      { foto: 'us41', legenda: 'você chorou. eu chorei também.' },
      { foto: 'us39', legenda: 'um grande dia pra nossa história.' }
    ] },
  { titulo: 'o pedido', data: '20 de maio de 2026', curta: '20/05',
    sinopse: 'o dia em que o sonho da aliança virou realidade.',
    foto: 'us10',
    cenas: [
      { foto: 'us6',  legenda: '20 de maio.' },
      { foto: 'us10', legenda: 'o dia em que o sonho da aliança virou realidade.' },
      { foto: 'us9',  legenda: 'o melhor sim que eu já ouvi.' }
    ] },
  { titulo: 'a festa surpresa', data: '17 de junho de 2026', curta: '17/06',
    sinopse: 'o aniversário dele. a primeira festa surpresa que ele já teve.',
    foto: 'us33',
    cenas: [
      { foto: 'us33', legenda: 'o meu aniversário.' },
      { foto: 'us3',  legenda: 'a primeira festa surpresa que eu já tive. foi você que fez.' }
    ] },
  { titulo: 'a pizzaria', data: '18 de junho de 2026', curta: '18/06',
    sinopse: 'pizza, e os dois brincando que eram papis.',
    foto: 'us16',
    cenas: [
      { foto: 'us16', legenda: 'no dia seguinte, pizza.' },
      { foto: 'us15', legenda: 'e a gente brincando que era papis.' }
    ] },
  { titulo: 'seis meses', data: '20 de novembro de 2026', curta: '20/11',
    sinopse: 'meio ano de namoro. e ele não perdeu nenhum capítulo.',
    foto: 'us98',
    cenas: [
      { foto: 'us96',  legenda: 'seis meses.' },
      { foto: 'us101', legenda: 'eu disse que não ia perder nenhuma novela.' },
      { foto: 'us98',  legenda: 'não perdi nenhum capítulo.' }
    ] }
];

/* "os dias": a parte rápida, com os vídeos. Entra antes do último capítulo.
   - video: toca "dur" segundos a partir de "inicio" (sem som: a música fica por cima) */
var OS_DIAS = [
  { foto: 'us13', legenda: 'e depois vieram os dias normais.' },
  { foto: 'us20' },
  { video: 'us-video5', dur: 4.5 },
  { foto: 'us36', legenda: 'os meus favoritos.' },
  { foto: 'us37' },
  { video: 'us-video4', dur: 4.5 },
  { foto: 'us27' },
  { foto: 'us54', legenda: 'qualquer dia com você vira cena de filme.' },
  { video: 'us-video1', dur: 5.5 },
  { foto: 'us57' },
  { foto: 'us66' },
  { video: 'us-video2', dur: 4.5, legenda: 'até quando a gente não faz nada.' },
  { foto: 'us80' },
  { video: 'dates-video2', dur: 4 },
  { foto: 'us89', legenda: 'principalmente quando a gente não faz nada.' },
  { video: 'us-video3', dur: 3.6 },
  { foto: 'us94' }
];

/* cenas dos próximos capítulos (o que ainda vem) */
var PROXIMOS = [
  'a nossa casa.',
  'o nosso casamento.',
  'a nossa família.',
  'uma vida inteira.'
];

/* os créditos que sobem no final: [função, nome] */
var CREDITOS = [
  ['estrelando', 'Nicolly'],
  ['direção', 'Thales'],
  ['roteiro', 'nós dois, um dia de cada vez'],
  ['primeira fala', '“se voce fosse atriz eu nao perderia nenhuma novela”'],
  ['locações', 'Sapucaia do Sul · o zoológico · o cinema · a pizzaria'],
  ['participação especial', 'a aliança'],
  ['trilha sonora', 'Love Drought · Beyoncé\nBest Part · Daniel Caesar e H.E.R.\nessa aqui é especial · Thales'],
  ['agradecimento', 'a você, por cada capítulo']
];

/* as músicas (arquivos em musicas/) */
var MUSICAS = {
  entrada: 'love-drought',   // da rua até sentar
  filme: 'best-part',        // o filme (ele se ajusta sozinho pra caber nos 2min39 dela)
  creditos: 'especial'       // os créditos e depois
};
