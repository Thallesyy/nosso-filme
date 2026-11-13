/* =====================================================================
   fachada.js: a rua à noite e a frente do cinema.
   A parede fica em z = 0, virada pra +z (a câmera vem da rua, de z positivo).
   Tudo que acende fica no grupo "g", que é copiado de cabeça pra baixo
   embaixo do chão: é o reflexo no asfalto molhado.
   ===================================================================== */
F.fachada = function (ctx) {
  var raiz = new THREE.Group();
  var g = new THREE.Group();
  var amb = F.ambiente();
  amb.uAmb.value.setRGB(0.105, 0.085, 0.165);
  amb.uAmbBaixo.value.setRGB(0.05, 0.035, 0.06);
  amb.luz(0, 0, 3.0, 1.3, 2.3, 1.75, 1.2, 0.16);      // embaixo do letreiro (quente)
  amb.luz(1, 0, 11.0, 2.4, 2.6, 0.75, 1.4, 0.045);     // o neon (rosa)
  amb.luz(2, -6.5, 5.4, 9.6, 1.25, 1.0, 0.8, 0.06);    // poste da esquerda
  amb.luz(3, 6.5, 5.4, 9.6, 1.25, 1.0, 0.8, 0.06);     // poste da direita

  var ROSA = F.cor(0xea9db7), ROSA_CLARO = F.cor(0xf6bccd), ROSA_ESC = F.cor(0xb65e80);
  var CREME = F.cor(0xf7e6d6), VINHO = F.cor(0x5e1a36), LATAO = F.cor(0xd9a95c), ESCURO = F.cor(0x17101c);

  var reboco = F.padrao(128, function (x, t) {
    var r = F.sorteio(7);
    for (var i = 0; i < 2600; i++) {
      var v = 110 + Math.floor(r() * 40);
      x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
      x.fillRect(r() * t, r() * t, 1 + r() * 2, 1 + r() * 2);
    }
    x.fillStyle = 'rgba(96,96,96,0.5)'; x.fillRect(0, 0, t, 2);     // frisos na horizontal
  });
  function mat(op) {
    var m = F.matLuz(op);
    m.defines.ESPELHAVEL = 1;
    return m;
  }
  var matParede = mat({ amb: amb, padrao: reboco, padraoEscala: 0.5, padraoForca: 0.55 });
  var matMetal = mat({ amb: amb, brilho: 0.55 });
  var matLiso = mat({ amb: amb });

  /* ---------- a parede ---------- */
  var P = new F.Construtor();
  var gradParede = { baixo: F.vezes(ROSA, 0.92), cima: ROSA };
  P.caixa(-8, 0, -0.5, -1.5, 9.5, 0, gradParede, 'T');
  P.caixa(1.5, 0, -0.5, 8, 9.5, 0, gradParede, 'T');
  P.caixa(-1.5, 2.8, -0.5, 1.5, 9.5, 0, gradParede, 'TED');
  // rodapé
  P.caixa(-8.05, 0, 0, -1.5, 0.55, 0.06, ROSA_ESC, 'T');
  P.caixa(1.5, 0, 0, 8.05, 0.55, 0.06, ROSA_ESC, 'T');
  // a torre do letreiro, com os degraus dos lados
  P.caixa(-3.4, 9.5, -0.5, 3.4, 12.6, 0.12, { baixo: ROSA, cima: ROSA_CLARO }, 'TB');
  P.caixa(-5.2, 9.5, -0.5, -3.4, 10.5, 0.06, ROSA, 'TB');
  P.caixa(3.4, 9.5, -0.5, 5.2, 10.5, 0.06, ROSA, 'TB');
  // pilastras
  [-8.1, -5.3, 4.9, 7.5].forEach(function (x0) {
    var larg = (x0 === -8.1 || x0 === 7.5) ? 0.6 : 0.4;
    P.caixa(x0, 0, 0, x0 + larg, 9.5, 0.22, { baixo: ROSA, cima: ROSA_CLARO }, 'TB');
  });
  var D = new F.Construtor();       // detalhes em creme (sem o padrão do reboco)
  D.caixa(-8.25, 9.38, -0.5, 8.25, 9.66, 0.34, CREME, 'T');           // cornija
  D.caixa(-3.6, 12.6, -0.5, 3.6, 12.82, 0.26, CREME, 'T');           // tampa da torre
  D.caixa(-8, 6.05, 0, 8, 6.2, 0.07, CREME, 'T');                     // friso do andar de cima
  [[-0.95, 13.5], [-0.14, 14.25], [0.67, 13.5]].forEach(function (f) { // aletas art déco no topo
    D.caixa(f[0], 12.82, -0.3, f[0] + 0.28, f[1], 0.0, CREME);
  });
  // janelas do andar de cima
  [-6.4, 6.4].forEach(function (cx) {
    D.caixa(cx - 0.75, 6.5, 0, cx + 0.75, 8.9, 0.1, CREME, 'T');
    D.caixa(cx - 0.6, 6.65, 0.1, cx + 0.6, 8.75, 0.12, F.cor(0x2a1a33), 'TEDCB');
    D.caixa(cx - 0.04, 6.65, 0.12, cx + 0.04, 8.75, 0.15, CREME, 'T');
    D.caixa(cx - 0.6, 7.66, 0.12, cx + 0.6, 7.74, 0.15, CREME, 'T');
  });
  g.add(P.malha(matParede));
  g.add(D.malha(matLiso));

  /* ---------- o letreiro (a marquise) ---------- */
  var M = new F.Construtor();
  M.caixa(-4.8, 3.5, 0, 4.8, 5.3, 2.4, VINHO, 'T');
  M.caixa(-4.9, 5.3, 0, 4.9, 5.42, 2.5, LATAO, 'T');                  // friso de latão em cima
  M.caixa(-4.9, 3.42, 0, 4.9, 3.5, 2.5, LATAO, 'T');                  // e embaixo
  g.add(M.malha(matMetal));

  // a frente iluminada, com o nome do filme
  var cLet = F.canvas(1536, 256), xl = cLet.getContext('2d');
  (function () {
    var w = 1536, h = 256;
    var gr = xl.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#fff6e6'); gr.addColorStop(0.5, '#fff0d8'); gr.addColorStop(1, '#f9e2c4');
    xl.fillStyle = gr; xl.fillRect(0, 0, w, h);
    xl.fillStyle = 'rgba(120,70,60,0.35)';                             // os trilhos das letras
    [62, 190].forEach(function (y) { xl.fillRect(0, y, w, 3); });
    xl.textAlign = 'center'; xl.textBaseline = 'middle';
    xl.fillStyle = '#c2255c'; xl.font = '40px ' + F.FONTE_LETRA;
    F.espacado(xl, TEXTOS.hoje.toUpperCase(), w / 2, 34, 7);
    xl.fillStyle = '#1d1016'; xl.font = '118px ' + F.FONTE_LETRA;
    var t = TEXTOS.titulo.toUpperCase(), esp = 9;
    xl.save();
    var larg = 0, i;
    for (i = 0; i < t.length; i++) larg += xl.measureText(t[i]).width + esp;
    var e = Math.min(1, (w - 90) / larg);
    xl.translate(w / 2, 130); xl.scale(e, 1);
    F.espacado(xl, t, 0, 0, esp);
    xl.restore();
    xl.fillStyle = '#c2255c'; xl.font = '40px ' + F.FONTE_LETRA;
    F.espacado(xl, TEXTOS.com.toUpperCase(), w / 2, 226, 7);
    var v = xl.createRadialGradient(w / 2, h / 2, h * 0.6, w / 2, h / 2, w * 0.56);    // borda mais escura
    v.addColorStop(0, 'rgba(90,40,30,0)'); v.addColorStop(1, 'rgba(90,40,30,0.28)');
    xl.fillStyle = v; xl.fillRect(0, 0, w, h);
  })();
  var letreiro = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 1.533), new THREE.MeshBasicMaterial({ map: F.texturaCanvas(cLet, { solta: true }) }));
  letreiro.position.set(0, 4.4, 2.41);
  g.add(letreiro);
  // os lados do letreiro (painel aceso, sem texto)
  var matPainel = new THREE.MeshBasicMaterial({ color: 0xffeccf });
  [-1, 1].forEach(function (s) {
    var p = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.4), matPainel);
    p.position.set(s * 4.81, 4.4, 1.2); p.rotation.y = s * Math.PI / 2;
    g.add(p);
  });

  // as lâmpadas: a borda da frente corre, as de baixo ficam acesas
  var QUENTE = [1.0, 0.86, 0.6], luzes = [], i, k = 0;
  for (i = 0; i <= 32; i++) {
    var x = -4.7 + i * (9.4 / 32);
    luzes.push({ x: x, y: 5.2, z: 2.46, tam: 0.42, cor: QUENTE, fase: i / 8, pisca: 1 });
    luzes.push({ x: x, y: 3.6, z: 2.46, tam: 0.42, cor: QUENTE, fase: i / 8 + 0.5, pisca: 1 });
  }
  for (i = 1; i < 6; i++) {
    luzes.push({ x: -4.7, y: 3.6 + i * (1.6 / 6), z: 2.46, tam: 0.42, cor: QUENTE, fase: i / 8 + 0.25, pisca: 1 });
    luzes.push({ x: 4.7, y: 3.6 + i * (1.6 / 6), z: 2.46, tam: 0.42, cor: QUENTE, fase: i / 8 + 0.75, pisca: 1 });
  }
  for (i = 0; i < 13; i++) for (k = 0; k < 4; k++) {
    luzes.push({ x: -4.2 + i * 0.7, y: 3.4, z: 0.35 + k * 0.56, tam: 0.36, cor: QUENTE, fase: 0, pisca: 0 });
  }
  // postes da rua
  luzes.push({ x: -6.5, y: 5.45, z: 9.6, tam: 2.6, cor: [1.0, 0.82, 0.62], pisca: 0 });
  luzes.push({ x: 6.5, y: 5.45, z: 9.6, tam: 2.6, cor: [1.0, 0.82, 0.62], pisca: 0 });
  var lamp = F.lampadas(luzes, { vel: 0.55 });
  g.add(lamp);

  /* ---------- o neon com o nome dela ---------- */
  var cNeon = F.canvas(1024, 512), xn = cNeon.getContext('2d');
  (function () {
    xn.fillStyle = '#000'; xn.fillRect(0, 0, 1024, 512);
    xn.textAlign = 'center'; xn.textBaseline = 'middle'; xn.lineJoin = 'round';
    function neon(txt, fonte, x, y, cor, grosso) {
      xn.font = fonte;
      xn.shadowColor = cor; xn.strokeStyle = cor; xn.fillStyle = cor;
      xn.shadowBlur = 46; xn.lineWidth = grosso; xn.strokeText(txt, x, y);
      xn.shadowBlur = 22; xn.strokeText(txt, x, y);
      xn.shadowBlur = 8; xn.fillText(txt, x, y);
      xn.shadowBlur = 0; xn.fillStyle = 'rgba(255,240,246,0.92)'; xn.fillText(txt, x, y);
    }
    neon(TEXTOS.cinema, '268px ' + F.FONTE_NEON, 512, 300, '#ff3d8f', 7);
    xn.font = '84px ' + F.FONTE_LETRA;
    xn.shadowColor = '#ffd08a'; xn.shadowBlur = 24; xn.fillStyle = '#ffe9c4';
    F.espacado(xn, 'CINE', 512, 96, 46);
    xn.shadowBlur = 0;
    xn.fillStyle = '#ffc56e';
    [[250, 96], [774, 96]].forEach(function (p) {          // as estrelinhas dos lados do "cine"
      xn.beginPath();
      for (var j = 0; j < 10; j++) {
        var r = j % 2 ? 9 : 22, a = j / 10 * Math.PI * 2 - Math.PI / 2;
        xn[j ? 'lineTo' : 'moveTo'](p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r);
      }
      xn.closePath(); xn.fill();
    });
  })();
  var matNeon = new THREE.MeshBasicMaterial({ map: F.texturaCanvas(cNeon, { solta: true }), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
  var neon = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.2), matNeon);
  neon.position.set(0, 11.0, 0.3); neon.renderOrder = 6;
  g.add(neon);

  /* ---------- as portas ---------- */
  var matPuro = F.matPuro();
  function folha(lado) {              // lado: -1 esquerda, +1 direita. a dobradiça fica em x = lado * 1.5
    var piv = new THREE.Group();
    piv.position.set(lado * 1.5, 0, -0.08);
    piv.name = lado < 0 ? 'portaE' : 'portaD';
    var a = lado < 0 ? 0 : -1.46, b = lado < 0 ? 1.46 : 0;     // a folha vai da dobradiça até o meio
    var mad = new F.Construtor();
    mad.caixa(a, 0, -0.04, b, 0.42, 0.04, VINHO);                                   // travessa de baixo
    mad.caixa(a, 2.5, -0.04, b, 2.74, 0.04, VINHO);                                 // de cima
    mad.caixa(a, 0.42, -0.04, a + 0.2, 2.5, 0.04, VINHO);
    mad.caixa(b - 0.2, 0.42, -0.04, b, 2.5, 0.04, VINHO);
    mad.caixa(a + 0.04, 0.06, 0.04, b - 0.04, 0.3, 0.055, LATAO, 'T');              // chapa de latão
    var mx = lado < 0 ? b - 0.3 : a + 0.22;                                          // puxador
    mad.caixa(mx, 0.95, 0.04, mx + 0.08, 1.75, 0.12, LATAO, 'T');
    piv.add(mad.malha(matMetal));
    var vid = new F.Construtor();                                                    // o vidro aceso por dentro
    vid.quad([a + 0.2, 0.42, 0.0], [b - 0.2, 0.42, 0.0], [b - 0.2, 2.5, 0.0], [a + 0.2, 2.5, 0.0],
      { baixo: [0.95, 0.62, 0.42], cima: [1.0, 0.8, 0.58] });
    var mv = vid.malha(matPuro); mv.material = matPuro;
    piv.add(mv);
    var fr = new F.Construtor();                                                     // raios art déco no vidro
    for (var j = 1; j < 4; j++) fr.caixa(a + 0.2 + j * (1.06 / 4) - 0.012, 0.42, 0.0, a + 0.2 + j * (1.06 / 4) + 0.012, 2.5, 0.02, VINHO, 'T');
    fr.caixa(a + 0.2, 1.75, 0.0, b - 0.2, 1.79, 0.02, VINHO, 'T');
    piv.add(fr.malha(matLiso));
    return piv;
  }
  g.add(folha(-1)); g.add(folha(1));
  var Q = new F.Construtor();           // o batente
  Q.caixa(-1.62, 0, -0.02, -1.5, 2.92, 0.1, LATAO, 'T');
  Q.caixa(1.5, 0, -0.02, 1.62, 2.92, 0.1, LATAO, 'T');
  Q.caixa(-1.62, 2.8, -0.02, 1.62, 2.92, 0.1, LATAO, 'T');
  // vitrines dos cartazes
  [-3.2, 3.2].forEach(function (cx) {
    Q.caixa(cx - 0.78, 0.7, 0, cx + 0.78, 2.92, 0.09, LATAO, 'T');
    Q.caixa(cx - 0.7, 0.78, 0.09, cx + 0.7, 2.84, 0.1, ESCURO, 'TEDCB');
  });
  // postes da rua
  [-6.5, 6.5].forEach(function (px) {
    Q.cilindro(px, 0, 5.2, 9.6, 0.09, 0.06, 8, ESCURO);
    Q.caixa(px - 0.22, 5.2, 9.38, px + 0.22, 5.34, 9.82, ESCURO);
  });
  // os pés da corda do tapete
  var postes = [1.2, 3.8, 6.4, 9.0];
  [-1.55, 1.55].forEach(function (px) {
    postes.forEach(function (pz) {
      Q.cilindro(px, 0, 0.05, pz, 0.17, 0.15, 10, LATAO);
      Q.cilindro(px, 0.05, 0.98, pz, 0.032, 0.032, 8, LATAO);
      Q.cilindro(px, 0.98, 1.06, pz, 0.07, 0.03, 8, LATAO);
    });
  });
  g.add(Q.malha(matMetal));

  // as cordas de veludo
  var R = new F.Construtor(), CORDA = F.cor(0xc2356b);
  [-1.55, 1.55].forEach(function (px) {
    for (var s = 0; s < postes.length - 1; s++) {
      var z0 = postes[s], z1 = postes[s + 1], N = 8, ant = null;
      for (var j = 0; j <= N; j++) {
        var u = j / N, z = F.lerp(z0, z1, u), y = 0.95 - 0.22 * (1 - Math.pow(2 * u - 1, 2));
        if (ant) {
          R.quad([px, ant[1] - 0.028, ant[0]], [px, y - 0.028, z], [px, y + 0.028, z], [px, ant[1] + 0.028, ant[0]], CORDA);
          R.quad([px - 0.028, ant[1], ant[0]], [px - 0.028, y, z], [px + 0.028, y, z], [px + 0.028, ant[1], ant[0]], CORDA);
        }
        ant = [z, y];
      }
    }
  });
  var mCorda = mat({ amb: amb, dupla: true, veludo: 0.6 });
  g.add(R.malha(mCorda));

  // o tapete rosa da calçada
  var tapete = F.padrao(64, function (x, t) {
    x.fillStyle = '#868686'; x.fillRect(0, 0, t, t);
    x.strokeStyle = '#6e6e6e'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, t / 2); x.lineTo(t / 2, 0); x.lineTo(t, t / 2); x.lineTo(t / 2, t); x.closePath(); x.stroke();
  });
  var T = new F.Construtor();
  T.caixa(-1.3, 0, 0, 1.3, 0.025, 10.2, F.cor(0xc83a6e), 'B');
  T.caixa(-1.36, 0, 0, -1.3, 0.03, 10.2, LATAO, 'B');
  T.caixa(1.3, 0, 0, 1.36, 0.03, 10.2, LATAO, 'B');
  g.add(T.malha(mat({ amb: amb, padrao: tapete, padraoEscala: 2.2, padraoForca: 0.5, veludo: 0.35 })));

  /* ---------- cartazes nas vitrines (as texturas chegam depois) ---------- */
  var vitrines = [];
  [-3.2, 3.2].forEach(function (cx) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.06), new THREE.MeshBasicMaterial({ color: 0x2a1a26 }));
    m.position.set(cx, 1.81, 0.105);
    g.add(m); vitrines.push(m);
  });

  /* ---------- manchas de luz ---------- */
  var B = new F.Brilhos();
  B.quad(0, 11.0, 0.14, 5.2, 0, 0, 0, 2.6, 0, [0.5, 0.1, 0.24], 0);          // halo do neon na torre
  B.quad(0, 4.4, 2.5, 6.4, 0, 0, 0, 1.9, 0, [0.42, 0.3, 0.18], 0);           // halo do letreiro
  [-3.2, 3.2].forEach(function (cx) { B.quad(cx, 1.9, 0.12, 1.5, 0, 0, 0, 1.9, 0, [0.22, 0.16, 0.1], 0); });
  B.quad(0, 1.5, 0.02, 2.4, 0, 0, 0, 1.9, 0, [0.3, 0.2, 0.12], 0);           // luz das portas
  var brilhos = B.malha();
  g.add(brilhos);

  raiz.add(g);

  /* ---------- o reflexo: o mesmo grupo, de cabeça pra baixo e esticado ---------- */
  var espelho = g.clone();
  espelho.scale.y = -1.3;
  espelho.traverse(function (o) { if (o.isMesh && o.material.transparent) o.renderOrder = -2; });
  raiz.add(espelho);

  /* ---------- o chão molhado ---------- */
  var chao = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), new THREE.ShaderMaterial({
    uniforms: { uNevoa: F.U.uNevoa, uNevoaD: F.U.uNevoaD, uSeco: { value: 0 } },
    vertexShader: [
      'varying vec3 vW; varying float vProf;',
      'void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vec4 mv = viewMatrix * wp; vProf = -mv.z; gl_Position = projectionMatrix * mv; }'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uNevoa; uniform float uNevoaD; uniform float uSeco;',
      'varying vec3 vW; varying float vProf;',
      'float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
      'float ruido(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }',
      'void main(){',
      '  float n = ruido(vW.xz * 0.33) * 0.62 + ruido(vW.xz * 1.21 + 7.0) * 0.38;',
      '  float poca = smoothstep(0.38, 0.62, n);',
      '  float grao = ruido(vW.xz * 13.0);',
      '  vec3 col = vec3(0.050, 0.040, 0.062) * (0.75 + 0.5 * grao);',
      // a calçada (perto da parede) é mais clara que a rua
      '  float calcada = 1.0 - smoothstep(10.3, 10.6, vW.z);',
      '  col *= mix(0.7, 1.25, calcada);',
      '  vec2 jz = fract(vW.xz / vec2(1.6, 1.6));',
      '  float junta = step(0.97, jz.x) + step(0.97, jz.y);',
      '  col *= 1.0 - 0.35 * junta * calcada;',
      // a luz do letreiro e do neon batendo no chão
      '  float dm = length(vW.xz - vec2(0.0, 2.2));',
      '  col += vec3(0.50, 0.33, 0.20) * (0.55 / (1.0 + 0.10 * dm * dm));',
      '  col += vec3(0.30, 0.06, 0.15) * (0.30 / (1.0 + 0.012 * dm * dm));',
      '  vec3 ver = normalize(cameraPosition - vW);',
      '  float fres = pow(1.0 - clamp(ver.y, 0.0, 1.0), 2.2);',
      '  float a = mix(0.90, 0.46, poca);',
      '  a = mix(a, a * 0.62, fres);',
      '  a = mix(a, 1.0, uSeco);',
      '  col = mix(col, uNevoa, 1.0 - exp(-uNevoaD * vProf));',
      '  gl_FragColor = vec4(col, a);',
      '}'
    ].join('\n'),
    transparent: true, depthWrite: false
  }));
  chao.rotation.x = -Math.PI / 2;
  chao.position.set(0, 0, 30);
  chao.renderOrder = -1;
  raiz.add(chao);

  /* ---------- os vizinhos, o céu, as estrelas e a lua ---------- */
  var V = new F.Construtor(), PRED = F.cor(0x221a33), r = F.sorteio(31), J = new F.Construtor();
  [[-24, -8.3, 7.4], [8.3, 25, 8.6], [-44, -24, 11], [25, 46, 6.2]].forEach(function (b, bi) {
    V.caixa(b[0], 0, -8, b[1], b[2], -0.25, { baixo: F.vezes(PRED, 0.8), cima: PRED }, 'TB');
    for (var wx = b[0] + 1.2; wx < b[1] - 1.4; wx += 2.3) for (var wy = 1.6; wy < b[2] - 1.5; wy += 2.5) {
      var acesa = r() < 0.3, q = acesa ? [0.95, 0.72, 0.42] : [0.06, 0.05, 0.1];
      if (acesa && r() < 0.35) q = [0.75, 0.5, 0.75];
      J.quad([wx, wy, -0.24], [wx + 1.1, wy, -0.24], [wx + 1.1, wy + 1.4, -0.24], [wx, wy + 1.4, -0.24], F.vezes(q, acesa ? 0.75 : 1));
    }
  });
  raiz.add(V.malha(matLiso));
  raiz.add(J.malha(matPuro));

  var ceu = new THREE.Mesh(new THREE.PlaneGeometry(400, 190), new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'varying vec2 vUv;',
      'void main(){',
      '  float y = vUv.y;',
      '  vec3 baixo = vec3(0.30, 0.13, 0.30), meio = vec3(0.085, 0.05, 0.16), cima = vec3(0.022, 0.016, 0.05);',
      '  vec3 c = mix(baixo, meio, smoothstep(0.03, 0.28, y)); c = mix(c, cima, smoothstep(0.25, 0.85, y));',
      '  gl_FragColor = vec4(c, 1.0);',
      '}'
    ].join('\n'),
    depthWrite: false
  }));
  ceu.position.set(0, 85, -70); ceu.renderOrder = -10;
  raiz.add(ceu);

  var est = [], re = F.sorteio(5);
  for (i = 0; i < 150; i++) {
    var b = 0.35 + re() * 0.65, quente = re() < 0.3;
    est.push({ x: (re() * 2 - 1) * 120, y: 16 + re() * re() * 120, z: -69, tam: 0.35 + re() * 0.75, cor: quente ? [b, b * 0.82, b * 0.7] : [b * 0.85, b * 0.88, b], fase: re(), pisca: 0.8 });
  }
  est.push({ x: -19, y: 40, z: -68.5, tam: 15, cor: [0.32, 0.26, 0.3], pisca: 0 });     // o halo da lua
  var estrelas = F.lampadas(est, { modo: 1 });
  estrelas.renderOrder = -9;
  raiz.add(estrelas);
  var lua = new THREE.Mesh(new THREE.CircleGeometry(2.3, 40), new THREE.MeshBasicMaterial({ color: 0xfff1e2 }));
  lua.position.set(-19, 40, -68.4); lua.renderOrder = -8;
  raiz.add(lua);

  var portas = [];
  raiz.traverse(function (o) { if (o.name === 'portaE' || o.name === 'portaD') portas.push(o); });

  return {
    grupo: raiz, amb: amb, vitrines: vitrines, espelho: espelho,
    // abre as portas pra dentro (0 fechada, 1 aberta)
    portas: function (a) {
      for (var j = 0; j < portas.length; j++) portas[j].rotation.y = (portas[j].name === 'portaE' ? 1 : -1) * a * 1.75;
    },
    // o cartaz das vitrines: a textura vale pro cinema e pro reflexo
    cartaz: function (i, tex) {
      vitrines[i].material.map = tex; vitrines[i].material.color.set(0xf2e6e0); vitrines[i].material.needsUpdate = true;
    },
    forca: function (v) { lamp.material.uniforms.uForca.value = v; }
  };
};
