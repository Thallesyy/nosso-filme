/* =====================================================================
   sala.js: a sala de cinema.
   Entra-se pelo fundo (z = -16.3), por baixo da cabine do projetor.
   O chão desce em degraus até a tela, que fica em z = -33.5.
   ===================================================================== */
F.SALA = (function () {
  var S = { x: 5.5, z0: -16.3, z1: -33.9, alto: 8.4, fileiras: 8, passo: 1.15, degrau: 0.12, corredor: 0.85, largPoltrona: 0.62, porLado: 5 };
  S.zFileira = function (r) { return -18.6 - r * S.passo; };
  S.yFileira = function (r) { return -(r + 1) * S.degrau; };
  S.yFrente = -(S.fileiras + 1) * S.degrau;                  // o chão na frente da primeira fileira
  S.telaW = 5.0; S.telaH = 7.5; S.telaZ = -33.5;
  S.telaY = S.yFrente + 0.95 + S.telaH / 2;                   // o centro da tela
  S.janela = { x: 0, y: 4.6, z: -18.0 };                      // a janelinha do projetor
  S.fileiraDela = 3;                                           // onde a câmera senta
  S.assento = { x: S.corredor + S.largPoltrona / 2, y: S.yFileira(S.fileiraDela) + 1.12, z: S.zFileira(S.fileiraDela) - 0.02 };
  // a altura do chão no corredor (pra câmera descer os degraus sem tranco)
  S.chao = function (z) {
    var z0 = -18.25, zf = S.zFileira(S.fileiras - 1) - 0.8;
    if (z > z0) return 0;
    if (z < zf) return S.yFrente;
    return F.lerp(0, S.yFrente, (z0 - z) / (z0 - zf));
  };
  return S;
})();

F.sala = function (ctx) {
  var S = F.SALA, X = S.x, Z0 = S.z0, Z1 = S.z1, ALTO = S.alto;
  var raiz = new THREE.Group();
  var amb = F.ambiente();

  var AMEIXA = F.cor(0x57203c), AMEIXA_ESC = F.cor(0x2f1124), VELUDO = F.cor(0xd6517f), CREME = F.cor(0xf2dccb);
  var LATAO = F.cor(0xd9a95c), TAPETE = F.cor(0x6e1a3c), PRETO = F.cor(0x0b070c), PASSADEIRA = F.cor(0xb8366a);

  var listras = F.padrao(64, function (x, t) {
    x.fillStyle = '#848484'; x.fillRect(0, 0, t, t);
    x.fillStyle = '#747474'; x.fillRect(0, 0, 6, t); x.fillRect(t / 2, 0, 6, t);
    x.fillStyle = '#909090'; x.fillRect(6, 0, 2, t); x.fillRect(t / 2 + 6, 0, 2, t);
  });
  var matParede = F.matLuz({ amb: amb, padrao: listras, padraoEscala: 0.9, padraoForca: 0.7 });
  var matLiso = F.matLuz({ amb: amb });
  var matChao = F.matLuz({ amb: amb, veludo: 0.2 });
  var matMetal = F.matLuz({ amb: amb, brilho: 0.5 });
  var matVeludo = F.matLuz({ amb: amb, veludo: 1.0 });
  var matPuro = F.matPuro();

  /* ---------- paredes, teto e cabine ---------- */
  var P = new F.Construtor(), L = new F.Construtor(), C = new F.Construtor(), M = new F.Construtor();
  var gradP = { baixo: AMEIXA_ESC, cima: AMEIXA };
  P.caixa(-X - 0.2, -1.2, Z1, -X, ALTO, Z0, gradP, 'ECBTF');
  P.caixa(X, -1.2, Z1, X + 0.2, ALTO, Z0, gradP, 'DCBTF');
  P.caixa(-X, -1.2, Z1 - 0.2, X, ALTO, Z1, gradP, 'EDCBT');                 // atrás da tela
  // a parede do fundo, com o vão da porta
  P.caixa(-X, 0, Z0, -1.1, 3.3, Z0 + 0.1, gradP, 'EDCBF');
  P.caixa(1.1, 0, Z0, X, 3.3, Z0 + 0.1, gradP, 'EDCBF');
  P.caixa(-1.1, 2.6, Z0, 1.1, 3.3, Z0 + 0.1, gradP, 'EDCBF');
  // a cabine do projetor: um bloco em cima da entrada
  P.caixa(-X, 3.3, -18.0, X, ALTO, Z0, { baixo: AMEIXA, cima: AMEIXA_ESC }, 'EDCF');
  raiz.add(P.malha(matParede));

  L.caixa(-X, ALTO, Z1, X, ALTO + 0.2, Z0, F.cor(0x1c0c1a), 'EDCTF');      // o teto
  L.caixa(-X, 3.22, -18.06, X, 3.3, -18.0, LATAO, 'EDF');                    // friso na borda da cabine
  // a moldura da janelinha do projetor
  L.caixa(-0.42, 4.3, -18.03, 0.42, 4.9, -18.0, PRETO, 'EDCBF');
  // rodapé e friso das paredes
  [-1, 1].forEach(function (s) {
    var a = s < 0 ? -X : X - 0.06, b = s < 0 ? -X + 0.06 : X;
    L.caixa(a, 2.2, Z1, b, 2.32, Z0, LATAO, s < 0 ? 'ETF' : 'DTF');
    L.caixa(a, 6.9, Z1, b, 7.0, Z0, LATAO, s < 0 ? 'ETF' : 'DTF');
  });
  raiz.add(L.malha(matMetal));

  /* ---------- o chão em degraus ---------- */
  C.caixa(-X, -1.2, -18.25, X, 0, Z0, TAPETE, 'EDBF');
  for (var r = 0; r < S.fileiras; r++) {
    var zr = S.zFileira(r);
    C.caixa(-X, -1.2, zr - 0.8, X, S.yFileira(r), zr + 0.35, TAPETE, 'EDBF');
  }
  C.caixa(-X, -1.2, Z1, X, S.yFrente, S.zFileira(S.fileiras - 1) - 0.8, TAPETE, 'EDBF');
  raiz.add(C.malha(matChao));
  // a passadeira do corredor do meio
  var Pa = new F.Construtor();
  Pa.caixa(-S.corredor + 0.1, 0, -18.25, S.corredor - 0.1, 0.012, Z0, PASSADEIRA, 'B');
  for (r = 0; r < S.fileiras; r++) {
    zr = S.zFileira(r);
    Pa.caixa(-S.corredor + 0.1, S.yFileira(r), zr - 0.8, S.corredor - 0.1, S.yFileira(r) + 0.012, zr + 0.35, PASSADEIRA, 'B');
  }
  Pa.caixa(-S.corredor + 0.1, S.yFrente, -30.5, S.corredor - 0.1, S.yFrente + 0.012, S.zFileira(S.fileiras - 1) - 0.8, PASSADEIRA, 'B');
  raiz.add(Pa.malha(matChao));

  /* ---------- as poltronas (uma geometria, 80 cópias) ---------- */
  var A = new F.Construtor(), BRACO = F.cor(0x1d0d16), VEL2 = F.vezes(VELUDO, 0.8);
  A.caixa(-0.27, 0.42, 0.22, 0.27, 1.0, 0.34, { baixo: VEL2, cima: VELUDO });     // encosto
  A.caixa(-0.23, 1.0, 0.23, 0.23, 1.05, 0.33, VELUDO, 'B');
  A.caixa(-0.25, 0.36, -0.24, 0.25, 0.48, 0.24, VELUDO);                           // assento
  A.caixa(-0.31, 0.18, -0.2, -0.27, 0.66, 0.32, BRACO);                            // braços
  A.caixa(0.27, 0.18, -0.2, 0.31, 0.66, 0.32, BRACO);
  A.caixa(-0.27, 0, 0.1, 0.27, 0.36, 0.3, BRACO, 'CB');                            // pé
  var nPolt = S.fileiras * S.porLado * 2;
  var poltronas = new THREE.InstancedMesh(A.geometria(), matVeludo, nPolt);
  var mx = new THREE.Matrix4(), k = 0;
  for (r = 0; r < S.fileiras; r++) for (var lado = -1; lado <= 1; lado += 2) for (var c = 0; c < S.porLado; c++) {
    mx.makeTranslation(lado * (S.corredor + S.largPoltrona * (c + 0.5)), S.yFileira(r), S.zFileira(r));
    poltronas.setMatrixAt(k++, mx);
  }
  poltronas.instanceMatrix.needsUpdate = true;
  poltronas.frustumCulled = false;
  raiz.add(poltronas);

  /* ---------- o palco, a boca de cena e a tela ---------- */
  var zPalco = -32.2, yPalco = S.yFrente + 0.82;
  M.caixa(-X, S.yFrente, Z1, X, yPalco, zPalco, F.cor(0x2a0f20), 'EDBT');
  M.caixa(-X, yPalco - 0.06, zPalco - 0.02, X, yPalco + 0.02, zPalco + 0.04, LATAO, 'EDB');
  // colunas dos lados e a viga de cima
  [-1, 1].forEach(function (s) {
    var a = s < 0 ? -X : 3.75, b = s < 0 ? -3.75 : X;
    M.caixa(a, yPalco, -33.35, b, ALTO, -32.6, { baixo: F.cor(0x7a2c50), cima: F.cor(0x45152f) }, 'CBT');
    var fa = s < 0 ? -3.95 : 3.75, fb = s < 0 ? -3.75 : 3.95;
    M.caixa(fa, yPalco, -32.6, fb, ALTO, -32.52, LATAO, 'CBT');
  });
  M.caixa(-3.75, 7.75, -33.35, 3.75, ALTO, -32.6, F.cor(0x45152f), 'EDCT');
  // a moldura preta em volta da tela
  var tx = S.telaW / 2, ty0 = S.telaY - S.telaH / 2, ty1 = S.telaY + S.telaH / 2, tz = S.telaZ;
  M.caixa(-3.75, yPalco, tz - 0.05, -tx, ALTO, tz, PRETO, 'EDCBT');
  M.caixa(tx, yPalco, tz - 0.05, 3.75, ALTO, tz, PRETO, 'EDCBT');
  M.caixa(-tx, ty1, tz - 0.05, tx, ALTO, tz, PRETO, 'EDCBT');
  M.caixa(-tx, yPalco, tz - 0.05, tx, ty0, tz, PRETO, 'EDCBT');
  raiz.add(M.malha(matMetal));

  var tela = new THREE.Mesh(new THREE.PlaneGeometry(S.telaW, S.telaH), new THREE.MeshBasicMaterial({ color: 0x08060a }));
  tela.position.set(0, S.telaY, tz + 0.01);
  raiz.add(tela);

  /* ---------- a cortina de veludo ---------- */
  var uCort = {
    uAbre: { value: 0 }, uTempo: F.U.uTempo, uLuzCasa: { value: 1 }, uRibalta: { value: 1 },
    uLuzTela: { value: new THREE.Vector3() }, uNevoa: F.U.uNevoa, uNevoaD: F.U.uNevoaD
  };
  function matCortina(lado, tipo) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uAbre: uCort.uAbre, uTempo: uCort.uTempo, uLuzCasa: uCort.uLuzCasa, uRibalta: uCort.uRibalta, uLuzTela: uCort.uLuzTela,
        uNevoa: uCort.uNevoa, uNevoaD: uCort.uNevoaD, uLado: { value: lado }, uTipo: { value: tipo }
      },
      vertexShader: [
        'uniform float uAbre; uniform float uTempo; uniform float uLado; uniform float uTipo;',
        'varying float vIncl; varying vec2 vUv; varying float vProf;',
        'void main(){',
        '  vec3 p = position; float u = uv.x; float m = 0.0;',
        '  if (uTipo < 0.5) {',
        // a cortina: presa na parede (u = 0), vai até o meio do palco (u = 1). ao abrir, ela se aperta em dobras
        '    float larg = mix(3.66, 0.72, uAbre);',
        '    float fase = u * 56.5 + sin(u * 9.0) * 0.6;',
        '    float amp = mix(0.07, 0.19, uAbre);',
        '    float mexe = sin(uTempo * 1.1 + u * 4.0) * 0.03 * (1.0 - uv.y) * sin(uAbre * 3.1416);',
        '    p.x = uLado * (3.6 - u * larg);',
        '    p.z = sin(fase) * amp + mexe;',
        '    m = cos(fase) * amp * 56.5 / larg;',
        '  } else {',
        // o bandô de cima: a barra faz ondas
        '    float f2 = u * 44.0;',
        '    p.y -= (1.0 - uv.y) * abs(sin(u * 3.1416 * 7.0)) * 0.30;',
        '    p.z = sin(f2) * 0.06;',
        '    m = cos(f2) * 0.06 * 44.0 / 7.5;',
        '  }',
        '  vIncl = m; vUv = uv;',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.0); vProf = -mv.z;',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float uLuzCasa; uniform float uRibalta; uniform vec3 uLuzTela; uniform vec3 uNevoa; uniform float uNevoaD; uniform float uTipo;',
        'varying float vIncl; varying vec2 vUv; varying float vProf;',
        'void main(){',
        '  float nz = 1.0 / sqrt(1.0 + vIncl * vIncl);',
        '  vec3 base = vec3(0.80, 0.17, 0.40);',
        '  float sombra = 0.16 + 0.84 * pow(nz, 1.6);',
        '  float crista = pow(1.0 - nz, 2.0) * 0.5;',
        '  vec3 luz = vec3(0.50, 0.40, 0.36) * uLuzCasa + vec3(0.035, 0.02, 0.03);',
        '  luz += vec3(1.0, 0.62, 0.45) * uRibalta * pow(1.0 - vUv.y, 2.5) * 1.1 * (1.0 - uTipo);',
        '  luz += uLuzTela * 0.25;',
        '  vec3 col = base * luz * (sombra + crista);',
        // a barra dourada
        '  float barra = (1.0 - smoothstep(0.012, 0.02, vUv.y)) * (1.0 - uTipo) + (1.0 - smoothstep(0.03, 0.07, vUv.y)) * uTipo;',
        '  col = mix(col, vec3(0.85, 0.62, 0.30) * luz * (0.6 + 0.4 * sombra), barra);',
        '  col = mix(col, uNevoa, 1.0 - exp(-uNevoaD * vProf));',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n'),
      side: THREE.DoubleSide
    });
  }
  var altCort = 7.75 - yPalco + 0.3;
  [-1, 1].forEach(function (s) {
    var g = new THREE.PlaneGeometry(3.66, altCort, 90, 1);
    var m = new THREE.Mesh(g, matCortina(s, 0));
    m.position.set(0, yPalco + altCort / 2 - 0.02, -33.05);
    m.frustumCulled = false;
    raiz.add(m);
  });
  var bando = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 0.7, 110, 1), matCortina(1, 1));
  bando.position.set(0, S.telaY + S.telaH / 2 + 0.36 + 0.35, -32.56);
  raiz.add(bando);

  /* ---------- luzes: arandelas, degraus, teto estrelado, janela do projetor ---------- */
  var arandelas = [], degraus = [], B = new F.Brilhos(), Ar = new F.Construtor(), QUENTE = [1.0, 0.8, 0.56];
  [-19.6, -22.6, -25.6, -28.6, -31.2].forEach(function (z) {
    [-1, 1].forEach(function (s) {
      var x = s * (X - 0.1);
      arandelas.push({ x: x - s * 0.05, y: 3.45, z: z, tam: 0.75, cor: QUENTE, pisca: 0 });
      B.quad(s * (X - 0.015), 4.55, z, 0, 0, 0.55, 0, 1.25, 0, [0.5, 0.3, 0.2], 2);
      B.quad(s * (X - 0.015), 2.45, z, 0, 0, 0.5, 0, 0.95, 0, [0.38, 0.2, 0.15], 2);
      L2caixa(x, z, s);
    });
  });
  function L2caixa(x, z, s) {         // o corpo da arandela
    var a = s < 0 ? -X : X - 0.12, b = s < 0 ? -X + 0.12 : X;
    Ar.caixa(a, 3.2, z - 0.09, b, 3.7, z + 0.09, LATAO);
  }
  raiz.add(Ar.malha(matMetal));
  for (r = 0; r < S.fileiras; r++) {
    zr = S.zFileira(r);
    [-1, 1].forEach(function (s) {
      degraus.push({ x: s * (S.corredor - 0.04), y: S.yFileira(r) + 0.05, z: zr + 0.33, tam: 0.16, cor: [1.0, 0.7, 0.5], pisca: 0 });
    });
  }
  var lampArandelas = F.lampadas(arandelas);
  var lampDegraus = F.lampadas(degraus);
  raiz.add(lampArandelas); raiz.add(lampDegraus);
  var brilhos = B.malha();
  raiz.add(brilhos);

  var est = [], re = F.sorteio(11);
  for (var i = 0; i < 110; i++) {
    var bb = 0.35 + re() * 0.65;
    est.push({ x: (re() * 2 - 1) * (X - 0.3), y: ALTO - 0.03, z: F.lerp(-18.4, Z1 + 0.6, re()), tam: 0.07 + re() * 0.12, cor: [bb, bb * 0.86, bb * 0.92], fase: re(), pisca: 0.85 });
  }
  var estrelas = F.lampadas(est, { modo: 1 });
  raiz.add(estrelas);

  var J = new F.Construtor();
  J.quad([0.3, 4.42, -18.035], [-0.3, 4.42, -18.035], [-0.3, 4.78, -18.035], [0.3, 4.78, -18.035], [1.0, 0.96, 0.9]);
  var janela = J.malha(matPuro);
  raiz.add(janela);
  var clarao = F.lampadas([{ x: 0, y: 4.6, z: -18.08, tam: 1.9, cor: [1.0, 0.95, 0.9], pisca: 0 }]);
  raiz.add(clarao);

  /* ---------- o feixe do projetor: 5 folhas de luz que se cruzam no eixo ---------- */
  var fonte = new THREE.Vector3(S.janela.x, S.janela.y, S.janela.z - 0.05), fim = new THREE.Vector3(0, S.telaY, tz + 0.05);
  var fp = [], fuv = [], NF = 5;
  for (i = 0; i < NF; i++) {
    var ang = i / NF * Math.PI, ca = Math.cos(ang), sa = Math.sin(ang);
    var raio = 1 / Math.sqrt(Math.pow(ca / (S.telaW / 2), 2) + Math.pow(sa / (S.telaH / 2), 2));
    var r0 = 0.16;
    var q = [
      [fonte.x - ca * r0, fonte.y - sa * r0, fonte.z, 0, 0], [fonte.x + ca * r0, fonte.y + sa * r0, fonte.z, 1, 0],
      [fim.x + ca * raio, fim.y + sa * raio, fim.z, 1, 1], [fim.x - ca * raio, fim.y - sa * raio, fim.z, 0, 1]
    ];
    [0, 1, 2, 0, 2, 3].forEach(function (o) { fp.push(q[o][0], q[o][1], q[o][2]); fuv.push(q[o][3], q[o][4]); });
  }
  var gFeixe = new THREE.BufferGeometry();
  gFeixe.setAttribute('position', new THREE.BufferAttribute(new Float32Array(fp), 3));
  gFeixe.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(fuv), 2));
  var uFeixe = { uTempo: F.U.uTempo, uForca: { value: 0 }, uCor: { value: new THREE.Vector3(1, 1, 1) } };
  var feixe = new THREE.Mesh(gFeixe, new THREE.ShaderMaterial({
    uniforms: uFeixe,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform float uTempo; uniform float uForca; uniform vec3 uCor; varying vec2 vUv;',
      'float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
      'float ruido(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }',
      'void main(){',
      '  float lado = abs(vUv.x - 0.5) * 2.0;',
      '  float borda = 1.0 - smoothstep(0.35, 1.0, lado);',
      // forte perto do projetor, sumindo antes de chegar na tela (pra não lavar o filme)
      '  float ao_longo = (1.0 - smoothstep(0.0, 0.85, vUv.y)) * 0.85 + 0.05;',
      '  float fumaca = 0.55 + 0.45 * ruido(vec2(vUv.x * 5.0 + uTempo * 0.03, vUv.y * 7.0 - uTempo * 0.07));',
      '  float raios = 0.8 + 0.2 * ruido(vec2(vUv.x * 40.0, uTempo * 3.0));',
      '  float a = borda * ao_longo * fumaca * raios * uForca * 0.30;',
      '  gl_FragColor = vec4(uCor * a, 1.0);',
      '}'
    ].join('\n'),
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide
  }));
  feixe.renderOrder = 7; feixe.frustumCulled = false;
  raiz.add(feixe);

  /* ---------- a poeira dentro do feixe ---------- */
  var NP = 130, gPo = new THREE.InstancedBufferGeometry(), sem = new Float32Array(NP * 4), rp = F.sorteio(3);
  gPo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]), 3));
  gPo.setIndex([0, 1, 2, 0, 2, 3]);
  for (i = 0; i < NP; i++) {
    var an = rp() * Math.PI * 2, rr = Math.sqrt(rp()) * 0.92;
    sem[i * 4] = rp(); sem[i * 4 + 1] = Math.cos(an) * rr; sem[i * 4 + 2] = Math.sin(an) * rr; sem[i * 4 + 3] = rp();
  }
  gPo.setAttribute('semente', new THREE.InstancedBufferAttribute(sem, 4));
  gPo.instanceCount = NP;
  var poeira = new THREE.Mesh(gPo, new THREE.ShaderMaterial({
    uniforms: { uTempo: F.U.uTempo, uForca: uFeixe.uForca, uCor: uFeixe.uCor,
      uFonte: { value: fonte }, uFim: { value: fim }, uMeia: { value: new THREE.Vector2(S.telaW / 2, S.telaH / 2) } },
    vertexShader: [
      'attribute vec4 semente;',
      'uniform float uTempo; uniform float uForca; uniform vec3 uFonte; uniform vec3 uFim; uniform vec2 uMeia;',
      'varying vec2 vUv; varying float vB;',
      'void main(){',
      '  vUv = position.xy;',
      '  float s = 0.06 + 0.72 * fract(semente.x + uTempo * 0.006 * (0.4 + semente.w));',
      '  vec2 ab = semente.yz + 0.05 * vec2(sin(uTempo * 0.31 + semente.w * 30.0), cos(uTempo * 0.23 + semente.w * 17.0));',
      '  vec3 alvo = uFim + vec3(ab.x * uMeia.x, ab.y * uMeia.y, 0.0);',
      '  vec3 c = mix(uFonte, alvo, s);',
      '  vB = uForca * (0.35 + 0.65 * sin(uTempo * (0.6 + semente.w) + semente.w * 50.0)) * (1.0 - s) * 1.4;',
      '  vec4 mv = modelViewMatrix * vec4(c, 1.0);',
      '  mv.xy += position.xy * (0.022 + 0.03 * semente.w);',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uCor; varying vec2 vUv; varying float vB;',
      'void main(){ float d = length(vUv) * 2.0; float a = 1.0 - smoothstep(0.0, 1.0, d); gl_FragColor = vec4(uCor * a * a * max(vB, 0.0), 1.0); }'
    ].join('\n'),
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  }));
  poeira.frustumCulled = false; poeira.renderOrder = 8;
  raiz.add(poeira);

  /* ---------- o estado: luz da casa, cor da tela, feixe e cortina ---------- */
  function atualizar(e) {
    var lz = e.luz, t = e.luzTela || [0, 0, 0], fx = e.feixe || 0;
    amb.uAmb.value.setRGB(0.035 + 0.2 * lz + t[0] * 0.05, 0.022 + 0.135 * lz + t[1] * 0.05, 0.04 + 0.15 * lz + t[2] * 0.05);
    amb.uAmbBaixo.value.setRGB(0.02 + 0.1 * lz, 0.012 + 0.06 * lz, 0.02 + 0.07 * lz);
    amb.luz(0, 0, 7.4, -24, 1.7 * lz, 1.3 * lz, 1.05 * lz, 0.018);
    amb.luz(1, 0, 2.9, -17.3, 1.0 * lz, 0.78 * lz, 0.6 * lz, 0.09);
    amb.luz(2, 0, S.telaY, tz + 2.2, t[0] * 2.6, t[1] * 2.6, t[2] * 2.6, 0.012);
    amb.luz(3, 0, 4.5, -19.2, 0.5 * fx, 0.48 * fx, 0.46 * fx, 0.12);
    lampArandelas.material.uniforms.uForca.value = 0.06 + 0.94 * lz;
    brilhos.material.uniforms.uForca.value = lz;
    lampDegraus.material.uniforms.uForca.value = 0.55;
    estrelas.material.uniforms.uForca.value = 0.25 + 0.75 * (1 - lz);
    uCort.uAbre.value = e.cortina || 0; uCort.uLuzCasa.value = lz; uCort.uRibalta.value = lz;
    uCort.uLuzTela.value.set(t[0], t[1], t[2]);
    uFeixe.uForca.value = fx;
    uFeixe.uCor.value.set(0.55 + t[0] * 0.9, 0.55 + t[1] * 0.9, 0.55 + t[2] * 0.9);
    janela.material.uniforms.uForca.value = 0.05 + 0.95 * fx;
    clarao.material.uniforms.uForca.value = fx;
  }
  atualizar({ luz: 1, feixe: 0, cortina: 0 });

  return { grupo: raiz, amb: amb, tela: tela, atualizar: atualizar };
};
