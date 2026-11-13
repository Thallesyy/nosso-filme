/* =====================================================================
   saguao.js: o corredor dos cartazes, entre a rua e a sala.
   Vai de z = -0.5 (a porta da rua) até z = -16 (a porta da sala), x de -2.2 a 2.2.
   Os cartazes alternam: capítulo 1 na parede da esquerda, 2 na da direita...
   ===================================================================== */
F.SAGUAO = { x: 2.2, z0: -0.5, z1: -16, alto: 4.2, cartazW: 1.4, cartazH: 2.1, cartazY: 1.92, lambri: 0.72 };

// onde fica o cartaz i (0 a 7)
F.posCartaz = function (i) {
  var esquerda = i % 2 === 0, z = -2.6 - i * 1.6;
  return { x: esquerda ? -F.SAGUAO.x + 0.07 : F.SAGUAO.x - 0.07, y: F.SAGUAO.cartazY, z: z, lado: esquerda ? -1 : 1 };
};

/* ---------- o desenho de um cartaz (512 x 768) ---------- */
F.desenharCartaz = function (img, op) {
  var W = 512, H = 768, c = F.canvas(W, H), x = c.getContext('2d');
  x.fillStyle = '#2a1420'; x.fillRect(0, 0, W, H);
  if (img) F.cobrir(x, img, 0, 0, W, H, op.foco === undefined ? 0.3 : op.foco);
  var g = x.createLinearGradient(0, 0, 0, 170);
  g.addColorStop(0, 'rgba(20,6,14,0.78)'); g.addColorStop(1, 'rgba(20,6,14,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, 170);
  g = x.createLinearGradient(0, H * 0.46, 0, H);
  g.addColorStop(0, 'rgba(20,6,14,0)'); g.addColorStop(0.55, 'rgba(20,6,14,0.8)'); g.addColorStop(1, 'rgba(20,6,14,0.96)');
  x.fillStyle = g; x.fillRect(0, H * 0.46, W, H * 0.54);
  x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  // em cima
  x.fillStyle = 'rgba(255,236,224,0.92)'; x.font = '24px ' + F.FONTE_LETRA;
  F.espacado(x, (op.topo || '').toUpperCase(), W / 2, 50, 5);
  if (op.faixa) {                                   // a faixa "em cartaz" / "em breve"
    x.save(); x.translate(W / 2, 96);
    x.font = '34px ' + F.FONTE_LETRA;
    x.fillStyle = '#ff5c9a'; x.fillRect(-120, -30, 240, 42);
    x.fillStyle = '#fff'; F.espacado(x, op.faixa.toUpperCase(), 0, 2, 6);
    x.restore();
  }
  // o título (encolhe até caber em 2 linhas)
  var tam = 76, linhas;
  do {
    tam -= 4; x.font = 'italic 700 ' + tam + 'px ' + F.FONTE_TITULO;
    linhas = F.linhas(x, op.titulo, W - 70);
  } while (linhas.length > 2 && tam > 36);
  var yBase = 648 - (linhas.length - 1) * tam * 0.5;
  if (op.sobre) {
    x.fillStyle = '#ff8fb8'; x.font = '27px ' + F.FONTE_LETRA;
    F.espacado(x, op.sobre.toUpperCase(), W / 2, yBase - tam * 0.95 - 6, 7);
  }
  x.fillStyle = '#fff3e8'; x.font = 'italic 700 ' + tam + 'px ' + F.FONTE_TITULO;
  x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 14;
  linhas.forEach(function (l, k) { x.fillText(l, W / 2, yBase + k * tam * 1.02); });
  x.shadowBlur = 0;
  var y = yBase + (linhas.length - 1) * tam * 1.02;
  if (op.data) {
    x.fillStyle = 'rgba(255,236,224,0.85)'; x.font = '27px ' + F.FONTE_LETRA;
    F.espacado(x, op.data.toUpperCase(), W / 2, y + 42, 4);
  }
  x.fillStyle = 'rgba(255,236,224,0.5)'; x.font = '16px ' + F.FONTE_LETRA;
  F.espacado(x, (op.rodape || '').toUpperCase(), W / 2, H - 28, 2.5);
  x.strokeStyle = 'rgba(255,236,224,0.32)'; x.lineWidth = 2; x.strokeRect(13, 13, W - 26, H - 26);
  return c;
};

F.saguao = function (ctx) {
  var S = F.SAGUAO, X = S.x, Z0 = S.z0, Z1 = S.z1, ALTO = S.alto, LB = S.lambri;
  var raiz = new THREE.Group();
  var amb = F.ambiente();
  amb.uAmb.value.setRGB(0.30, 0.215, 0.215);
  amb.uAmbBaixo.value.setRGB(0.20, 0.13, 0.14);
  [-2.6, -6.6, -10.6, -14.4].forEach(function (z, i) { amb.luz(i, 0, 3.8, z, 1.25, 0.98, 0.74, 0.11); });

  var ROSA = F.cor(0xd98fa6), ROSA_CL = F.cor(0xeeb7c6), VINHO = F.cor(0x70213f), CREME = F.cor(0xf5e4d4);
  var LATAO = F.cor(0xd9a95c), TAPETE = F.cor(0xa82855), ESCURO = F.cor(0x1a0f18);

  var tapete = F.padrao(128, function (x, t) {       // losangos art déco
    x.fillStyle = '#808080'; x.fillRect(0, 0, t, t);
    x.strokeStyle = '#a8a8a8'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(t / 2, 4); x.lineTo(t - 4, t / 2); x.lineTo(t / 2, t - 4); x.lineTo(4, t / 2); x.closePath(); x.stroke();
    x.fillStyle = '#6a6a6a';
    x.beginPath(); x.moveTo(t / 2, 30); x.lineTo(t - 30, t / 2); x.lineTo(t / 2, t - 30); x.lineTo(30, t / 2); x.closePath(); x.fill();
    x.fillStyle = '#b4b4b4'; x.beginPath(); x.arc(0, 0, 7, 0, 7); x.arc(t, 0, 7, 0, 7); x.arc(0, t, 7, 0, 7); x.arc(t, t, 7, 0, 7); x.fill();
  });
  var listras = F.padrao(64, function (x, t) {       // papel de parede listrado
    x.fillStyle = '#868686'; x.fillRect(0, 0, t / 2, t);
    x.fillStyle = '#7a7a7a'; x.fillRect(t / 2, 0, t / 2, t);
    x.fillStyle = '#929292'; x.fillRect(t / 2 - 1, 0, 2, t); x.fillRect(0, 0, 1, t); x.fillRect(t - 1, 0, 1, t);
  });
  var matParede = F.matLuz({ amb: amb, padrao: listras, padraoEscala: 2.5, padraoForca: 0.8 });
  var matChao = F.matLuz({ amb: amb, padrao: tapete, padraoEscala: 1.1, padraoForca: 0.5, veludo: 0.25 });
  var matLiso = F.matLuz({ amb: amb });
  var matMetal = F.matLuz({ amb: amb, brilho: 0.5 });

  /* ---------- a caixa do corredor ---------- */
  var P = new F.Construtor(), L = new F.Construtor(), C = new F.Construtor(), M = new F.Construtor();
  var gradP = { baixo: F.vezes(ROSA, 0.86), cima: ROSA_CL };
  P.caixa(-X - 0.2, LB, Z1, -X, 3.7, Z0, gradP, 'ECBTF');                // parede esquerda
  P.caixa(X, LB, Z1, X + 0.2, 3.7, Z0, gradP, 'DCBTF');                  // parede direita
  // a parede da frente (por dentro), com o vão da porta da rua
  P.caixa(-X, 0, Z0, -1.5, 3.7, Z0 + 0.1, gradP, 'EDCBF');
  P.caixa(1.5, 0, Z0, X, 3.7, Z0 + 0.1, gradP, 'EDCBF');
  P.caixa(-1.5, 2.8, Z0, 1.5, 3.7, Z0 + 0.1, gradP, 'EDCBF');
  // a parede do fundo, com o vão da porta da sala
  P.caixa(-X, 0, Z1 - 0.3, -1.1, 3.7, Z1, gradP, 'EDCBT');
  P.caixa(1.1, 0, Z1 - 0.3, X, 3.7, Z1, gradP, 'EDCBT');
  P.caixa(-1.1, 2.6, Z1 - 0.3, 1.1, 3.7, Z1, gradP, 'EDCT');
  raiz.add(P.malha(matParede));

  // lambri (a parte de baixo da parede) e sanca
  L.caixa(-X, 0, Z1, -X + 0.05, LB, Z0, { baixo: F.vezes(VINHO, 0.8), cima: VINHO }, 'EBTF');
  L.caixa(X - 0.05, 0, Z1, X, LB, Z0, { baixo: F.vezes(VINHO, 0.8), cima: VINHO }, 'DBTF');
  L.caixa(-X, 3.7, Z1, -X + 0.14, 3.95, Z0, CREME, 'ETF');
  L.caixa(X - 0.14, 3.7, Z1, X, 3.95, Z0, CREME, 'DTF');
  L.caixa(-X, 3.7, Z1, X, 3.95, Z1 + 0.14, CREME, 'T');
  L.caixa(-X, 3.7, Z0 - 0.14, X, 3.95, Z0, CREME, 'F');
  L.caixa(-X - 0.2, 3.95, Z1, -X, ALTO, Z0, CREME, 'ECBTF');
  L.caixa(X, 3.95, Z1, X + 0.2, ALTO, Z0, CREME, 'DCBTF');
  L.caixa(-X, 3.95, Z1 - 0.2, X, ALTO, Z1, CREME, 'EDCBT');
  L.caixa(-X, 3.95, Z0, X, ALTO, Z0 + 0.2, CREME, 'EDCBF');
  // o teto, com vigas
  L.caixa(-X, ALTO, Z1, X, ALTO + 0.2, Z0, F.cor(0xe9cfc4), 'EDCTF');
  for (var vz = -1.8; vz > Z1; vz -= 3.2) L.caixa(-X, ALTO - 0.16, vz - 0.14, X, ALTO, vz + 0.14, CREME, 'EDC');
  // batentes das duas portas (o da sala é fundo: a parede tem 30 cm)
  L.caixa(-1.1, 0, Z1 - 0.3, -1.04, 2.6, Z1, CREME, 'EB');
  L.caixa(1.04, 0, Z1 - 0.3, 1.1, 2.6, Z1, CREME, 'DB');
  raiz.add(L.malha(matLiso));

  C.caixa(-X, -0.2, Z1 - 0.3, X, 0, Z0 + 0.5, TAPETE, 'EDBTF');            // o tapete (vai até a soleira da rua)
  raiz.add(C.malha(matChao));

  // frisos de latão
  M.caixa(-X + 0.05, LB - 0.02, Z1, -X + 0.09, LB + 0.06, Z0, LATAO, 'EBTF');
  M.caixa(X - 0.09, LB - 0.02, Z1, X - 0.05, LB + 0.06, Z0, LATAO, 'DBTF');
  M.caixa(-1.16, 0, Z1, -1.1, 2.66, Z1 + 0.05, LATAO, 'B');
  M.caixa(1.1, 0, Z1, 1.16, 2.66, Z1 + 0.05, LATAO, 'B');
  M.caixa(-1.16, 2.6, Z1, 1.16, 2.66, Z1 + 0.05, LATAO);

  /* ---------- os cartazes ---------- */
  var cartazes = [], B = new F.Brilhos(), lampadas = [], QUENTE = [1.0, 0.84, 0.6];
  var geoCartaz = new THREE.PlaneGeometry(S.cartazW, S.cartazH);
  for (var i = 0; i < 8; i++) {
    var p = F.posCartaz(i), s = p.lado;                       // s = -1: parede esquerda (olha pra +x)
    var m = new THREE.Mesh(geoCartaz, new THREE.MeshBasicMaterial({ color: 0x3a2030 }));
    m.position.set(p.x, p.y, p.z); m.rotation.y = -s * Math.PI / 2;
    m.userData.indice = i;
    raiz.add(m); cartazes.push(m);
    // a moldura de latão: 4 barras em volta
    var hw = S.cartazW / 2, hh = S.cartazH / 2, e = 0.07, xa = s < 0 ? -X : X - 0.1, xb = s < 0 ? -X + 0.1 : X;
    M.caixa(xa, p.y - hh - e, p.z - hw - e, xb, p.y - hh, p.z + hw + e, LATAO);
    M.caixa(xa, p.y + hh, p.z - hw - e, xb, p.y + hh + e, p.z + hw + e, LATAO);
    M.caixa(xa, p.y - hh, p.z - hw - e, xb, p.y + hh, p.z - hw, LATAO);
    M.caixa(xa, p.y - hh, p.z + hw, xb, p.y + hh, p.z + hw + e, LATAO);
    // a luminária em cima
    var lx = s < 0 ? -X + 0.3 : X - 0.3;
    M.caixa(Math.min(lx, s < 0 ? -X : X), p.y + hh + 0.3, p.z - 0.03, Math.max(lx, s < 0 ? -X : X), p.y + hh + 0.34, p.z + 0.03, LATAO);
    M.caixa(lx - 0.05, p.y + hh + 0.24, p.z - 0.42, lx + 0.05, p.y + hh + 0.34, p.z + 0.42, LATAO);
    lampadas.push({ x: lx - s * 0.02, y: p.y + hh + 0.22, z: p.z, tam: 0.7, cor: QUENTE, pisca: 0 });
    // a luz lavando o cartaz e a parede
    B.quad(p.x - s * 0.012, p.y + 0.1, p.z, 0, 0, s * 1.15, 0, hh + 0.42, 0, [0.34, 0.25, 0.15], 1);
  }
  raiz.add(M.malha(matMetal));

  /* ---------- as luzes do teto ---------- */
  [-1.8 - 1.6, -1.8 - 4.8, -1.8 - 8.0, -1.8 - 11.2].forEach(function (z) {
    lampadas.push({ x: 0, y: ALTO - 0.06, z: z, tam: 1.5, cor: [1.0, 0.86, 0.64], pisca: 0 });
    B.quad(0, ALTO - 0.012, z, 1.5, 0, 0, 0, 0, 1.5, [0.42, 0.32, 0.2], 0);
    B.quad(0, 0.012, z, 2.0, 0, 0, 0, 0, 2.0, [0.2, 0.09, 0.08], 0);
  });

  /* ---------- a placa "sala 1" ---------- */
  var cP = F.canvas(512, 128), xp = cP.getContext('2d');
  xp.fillStyle = '#3a0d22'; xp.fillRect(0, 0, 512, 128);
  xp.strokeStyle = '#e2b56b'; xp.lineWidth = 5; xp.strokeRect(7, 7, 498, 114);
  xp.textAlign = 'center'; xp.textBaseline = 'middle';
  xp.shadowColor = '#ff5c9a'; xp.shadowBlur = 18;
  xp.fillStyle = '#ffd9e6'; xp.font = '70px ' + F.FONTE_LETRA;
  F.espacado(xp, TEXTOS.sala.toUpperCase(), 256, 52, 10);
  xp.shadowBlur = 6; xp.fillStyle = '#ffc56e'; xp.font = '27px ' + F.FONTE_LETRA;
  F.espacado(xp, TEXTOS.sessao.toUpperCase(), 256, 100, 5);
  var placa = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), new THREE.MeshBasicMaterial({ map: F.texturaCanvas(cP, { solta: true }) }));
  placa.position.set(0, 3.12, Z1 + 0.02);
  raiz.add(placa);
  B.quad(0, 3.12, Z1 + 0.03, 1.7, 0, 0, 0, 0.75, 0, [0.3, 0.08, 0.16], 0);

  var lamp = F.lampadas(lampadas);
  raiz.add(lamp);
  var brilhos = B.malha();
  raiz.add(brilhos);

  /* ---------- as portas da sala (acolchoadas, com janelinha redonda) ---------- */
  var cD = F.canvas(256, 512), xd = cD.getContext('2d');
  (function () {
    xd.fillStyle = '#b3305f'; xd.fillRect(0, 0, 256, 512);
    xd.strokeStyle = 'rgba(60,8,28,0.55)'; xd.lineWidth = 3;
    for (var k = -8; k < 16; k++) {
      xd.beginPath(); xd.moveTo(k * 48, 0); xd.lineTo(k * 48 + 512 * 0.6, 512); xd.stroke();
      xd.beginPath(); xd.moveTo(k * 48, 0); xd.lineTo(k * 48 - 512 * 0.6, 512); xd.stroke();
    }
    xd.fillStyle = '#e2b56b';
    for (var a = 0; a < 7; a++) for (var b = 0; b < 12; b++) {
      xd.beginPath(); xd.arc((a + (b % 2) * 0.5) * 48, b * 40 + 20, 3.5, 0, 7); xd.fill();
    }
    xd.fillStyle = '#e2b56b'; xd.beginPath(); xd.arc(128, 150, 62, 0, 7); xd.fill();     // a janelinha
    var gr = xd.createRadialGradient(118, 138, 6, 128, 150, 52);
    gr.addColorStop(0, '#3b2440'); gr.addColorStop(1, '#0e0712');
    xd.fillStyle = gr; xd.beginPath(); xd.arc(128, 150, 50, 0, 7); xd.fill();
    xd.fillStyle = '#e2b56b'; xd.fillRect(96, 300, 64, 150);                               // a chapa de empurrar
    xd.strokeStyle = '#8c2147'; xd.lineWidth = 8; xd.strokeRect(4, 4, 248, 504);
  })();
  var texPorta = F.texturaCanvas(cD, { solta: true });
  var matPorta = new THREE.MeshBasicMaterial({ map: texPorta, color: 0xcfc4c4 });
  var portas = [];
  [-1, 1].forEach(function (lado) {
    var piv = new THREE.Group();
    piv.position.set(lado * 1.04, 0, Z1 - 0.06);
    var cx = -lado * 0.52;
    var corpo = new F.Construtor();
    corpo.caixa(cx - 0.52, 0, -0.03, cx + 0.52, 2.58, 0.03, F.cor(0x8c2147));
    piv.add(corpo.malha(matLiso));
    var f = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 2.58), matPorta);
    f.position.set(cx, 1.29, 0.032); piv.add(f);
    var t = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 2.58), matPorta);
    t.position.set(cx, 1.29, -0.032); t.rotation.y = Math.PI; piv.add(t);
    raiz.add(piv); portas.push({ piv: piv, lado: lado });
  });

  return {
    grupo: raiz, amb: amb, cartazes: cartazes,
    // abre as portas da sala pra dentro dela (0 fechada, 1 aberta)
    portas: function (a) { for (var j = 0; j < portas.length; j++) portas[j].piv.rotation.y = -portas[j].lado * a * 1.7; },
    cartaz: function (i, tex) {
      cartazes[i].material.map = tex; cartazes[i].material.color.set(0xe9dfdc); cartazes[i].material.needsUpdate = true;
    }
  };
};
