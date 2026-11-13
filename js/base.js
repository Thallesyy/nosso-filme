/* =====================================================================
   base.js: as ferramentas pra montar o cinema.
   - Construtor: junta caixas e quadrados numa geometria só (1 chamada de desenho)
   - matLuz: material com "luz falsa" (até 4 pontos de luz por ambiente, sem sombra)
   - lampadas: pontinhos de luz que sempre olham pra câmera (sem gl.POINTS)
   - Brilhos: manchas de luz paradas (parede, chão)
   - telas de canvas pra letreiros e cartazes
   As cores saem "cruas" (sem sRGBEncoding): o que está escrito aqui é o que aparece.
   ===================================================================== */
var F = window.F = {};

F.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
F.lerp = function (a, b, t) { return a + (b - a) * t; };
F.rampa = function (t, a, b) { return F.clamp((t - a) / (b - a), 0, 1); };
F.suave = function (t) { t = F.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
F.suave2 = function (t) { t = F.clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
// sobe de a até b e fica (com curva suave)
F.entra = function (t, a, b) { return F.suave(F.rampa(t, a, b)); };
// sobe em [a,b], fica, e desce em [c,d]
F.janela = function (t, a, b, c, d) { return F.suave(F.rampa(t, a, b)) * (1 - F.suave(F.rampa(t, c, d))); };

F.sorteio = function (semente) {
  var s = semente >>> 0;
  return function () {
    s += 0x6D2B79F5; var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

F.cor = function (hex) { return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255]; };
F.vezes = function (c, k) { return [c[0] * k, c[1] * k, c[2] * k]; };

/* os uniformes que todo material divide */
F.U = {
  uNevoa: { value: new THREE.Color(0x0c0714) },
  uNevoaD: { value: 0.012 },
  uTempo: { value: 0 }
};

/* um "ambiente" = um conjunto de luzes (a rua, o saguão, a sala) */
F.ambiente = function () {
  var a = {
    uAmb: { value: new THREE.Color(0, 0, 0) },
    uAmbBaixo: { value: new THREE.Color(0, 0, 0) },
    uLp: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
    uLc: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
    uLk: { value: [0.1, 0.1, 0.1, 0.1] }
  };
  a.luz = function (i, x, y, z, r, g, b, k) {
    a.uLp.value[i].set(x, y, z); a.uLc.value[i].set(r, g, b);
    if (k !== undefined) a.uLk.value[i] = k;
  };
  a.corLuz = function (i, r, g, b) { a.uLc.value[i].set(r, g, b); };
  return a;
};

/* ---------------------------------------------------------------------
   Construtor de geometria
   --------------------------------------------------------------------- */
F.Construtor = function () { this.p = []; this.n = []; this.c = []; };
F.Construtor.prototype = {
  // quadrado a,b,c,d (anti-horário visto de fora). cor: [r,g,b] ou {baixo:[..], cima:[..]} (a,b = baixo; c,d = cima)
  quad: function (a, b, c, d, cor) {
    var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    var vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= l; ny /= l; nz /= l;
    var cb = cor.baixo || cor, cc = cor.cima || cor;
    var v = [a, b, c, a, c, d], k = [cb, cb, cc, cb, cc, cc];
    for (var i = 0; i < 6; i++) {
      this.p.push(v[i][0], v[i][1], v[i][2]); this.n.push(nx, ny, nz); this.c.push(k[i][0], k[i][1], k[i][2]);
    }
    return this;
  },
  // caixa alinhada aos eixos. sem: letras das faces que não entram ('E'=-x 'D'=+x 'B'=-y 'C'=+y 'T'=-z 'F'=+z)
  caixa: function (x0, y0, z0, x1, y1, z1, cor, sem) {
    sem = sem || '';
    var cb = cor.baixo || cor, cc = cor.cima || cor;
    if (sem.indexOf('D') < 0) this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], cor);
    if (sem.indexOf('E') < 0) this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], cor);
    if (sem.indexOf('C') < 0) this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], cc);
    if (sem.indexOf('B') < 0) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], cb);
    if (sem.indexOf('F') < 0) this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], cor);
    if (sem.indexOf('T') < 0) this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], cor);
    return this;
  },
  // cilindro em pé (poste, pé de corda). lados com normal lisa.
  cilindro: function (x, y0, y1, z, r0, r1, lados, cor) {
    for (var i = 0; i < lados; i++) {
      var a0 = i / lados * Math.PI * 2, a1 = (i + 1) / lados * Math.PI * 2;
      var c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      var A = [x + c0 * r0, y0, z + s0 * r0], B = [x + c1 * r0, y0, z + s1 * r0];
      var C = [x + c1 * r1, y1, z + s1 * r1], D = [x + c0 * r1, y1, z + s0 * r1];
      var v = [A, C, B, A, D, C], nn = [[c0, s0], [c1, s1], [c1, s1], [c0, s0], [c0, s0], [c1, s1]];
      for (var k = 0; k < 6; k++) {
        this.p.push(v[k][0], v[k][1], v[k][2]); this.n.push(nn[k][0], 0, nn[k][1]); this.c.push(cor[0], cor[1], cor[2]);
      }
    }
    return this;
  },
  geometria: function () {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.p), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.n), 3));
    g.setAttribute('cor', new THREE.BufferAttribute(new Float32Array(this.c), 3));
    g.computeBoundingSphere();
    return g;
  },
  malha: function (material) { return new THREE.Mesh(this.geometria(), material); }
};

/* ---------------------------------------------------------------------
   Material com luz falsa
   op: { amb: ambiente, veludo: 0..1, padrao: textura, padraoEscala, padraoForca, dupla: bool, brilho: 0..1 }
   --------------------------------------------------------------------- */
F.VS_LUZ = [
  'attribute vec3 cor;',
  'varying vec3 vW; varying vec3 vN; varying vec3 vCor; varying float vProf;',
  'void main(){',
  '  vec4 pl = vec4(position, 1.0); vec3 nl = normal;',
  '  #ifdef USE_INSTANCING',
  '    pl = instanceMatrix * pl; nl = mat3(instanceMatrix) * nl;',
  '  #endif',
  '  vec4 wp = modelMatrix * pl;',
  '  vW = wp.xyz; vN = mat3(modelMatrix) * nl; vCor = cor;',
  // no reflexo do chão (grupo de cabeça pra baixo) a luz é calculada como se estivesse em pé
  '  #ifdef ESPELHAVEL',
  '    float sy = modelMatrix[1][1]; vW.y /= sy; vN.y /= sy;',
  '  #endif',
  '  vec4 mv = viewMatrix * wp; vProf = -mv.z;',
  '  gl_Position = projectionMatrix * mv;',
  '}'
].join('\n');

F.FS_LUZ = [
  'uniform vec3 uAmb; uniform vec3 uAmbBaixo;',
  'uniform vec3 uLp[4]; uniform vec3 uLc[4]; uniform float uLk[4];',
  'uniform vec3 uNevoa; uniform float uNevoaD; uniform float uVeludo; uniform float uBrilho;',
  '#ifdef PADRAO',
  'uniform sampler2D uPadrao; uniform float uPadraoEsc; uniform float uPadraoF;',
  '#endif',
  'varying vec3 vW; varying vec3 vN; varying vec3 vCor; varying float vProf;',
  'void main(){',
  '  vec3 n = normalize(vN);',
  '  #ifdef DUPLA',
  '    if (!gl_FrontFacing) n = -n;',
  '  #endif',
  '  vec3 base = vCor;',
  '  #ifdef PADRAO',
  '    vec3 an = abs(n);',
  '    vec2 uv = an.y > 0.7 ? vW.xz : (an.x > an.z ? vW.zy : vW.xy);',
  '    base *= mix(vec3(1.0), texture2D(uPadrao, uv * uPadraoEsc).rgb * 2.0, uPadraoF);',
  '  #endif',
  '  vec3 luz = mix(uAmbBaixo, uAmb, n.y * 0.5 + 0.5);',
  '  vec3 ver = normalize(cameraPosition - vW);',
  '  vec3 esp = vec3(0.0);',
  '  for (int i = 0; i < 4; i++){',
  '    vec3 d = uLp[i] - vW; float d2 = dot(d, d); vec3 dn = d * inversesqrt(d2 + 0.0001);',
  '    float at = 1.0 / (1.0 + uLk[i] * d2);',
  '    luz += uLc[i] * (max(dot(n, dn) * 0.8 + 0.2, 0.0) * at);',
  '    #ifdef BRILHO',
  '      vec3 h = normalize(dn + ver);',
  '      esp += uLc[i] * (pow(max(dot(n, h), 0.0), 40.0) * at);',
  '    #endif',
  '  }',
  '  vec3 col = base * luz + esp * uBrilho;',
  '  #ifdef VELUDO',
  '    float rim = pow(1.0 - max(dot(n, ver), 0.0), 2.5);',
  '    col += base * rim * uVeludo * (luz * 0.9 + 0.02);',
  '  #endif',
  '  col = mix(col, uNevoa, 1.0 - exp(-uNevoaD * vProf));',
  '  gl_FragColor = vec4(col, 1.0);',
  '}'
].join('\n');

F.matLuz = function (op) {
  op = op || {};
  var a = op.amb;
  var u = {
    uAmb: a.uAmb, uAmbBaixo: a.uAmbBaixo, uLp: a.uLp, uLc: a.uLc, uLk: a.uLk,
    uNevoa: F.U.uNevoa, uNevoaD: F.U.uNevoaD,
    uVeludo: { value: op.veludo || 0 }, uBrilho: { value: op.brilho || 0 }
  };
  var def = {};
  if (op.veludo) def.VELUDO = 1;
  if (op.brilho) def.BRILHO = 1;
  if (op.dupla) def.DUPLA = 1;
  if (op.padrao) {
    def.PADRAO = 1;
    u.uPadrao = { value: op.padrao }; u.uPadraoEsc = { value: op.padraoEscala || 1 }; u.uPadraoF = { value: op.padraoForca === undefined ? 1 : op.padraoForca };
  }
  return new THREE.ShaderMaterial({
    uniforms: u, defines: def, vertexShader: F.VS_LUZ, fragmentShader: F.FS_LUZ,
    side: op.dupla ? THREE.DoubleSide : THREE.FrontSide
  });
};

/* material que acende sozinho (vidro iluminado, janela): mostra a cor do vértice, sem luz */
F.matPuro = function (op) {
  op = op || {};
  return new THREE.ShaderMaterial({
    uniforms: { uNevoa: F.U.uNevoa, uNevoaD: F.U.uNevoaD, uForca: { value: 1 } },
    vertexShader: F.VS_LUZ,
    fragmentShader: [
      'uniform vec3 uNevoa; uniform float uNevoaD; uniform float uForca;',
      'varying vec3 vCor; varying float vProf;',
      'void main(){',
      '  vec3 c = vCor * uForca;',
      '  c = mix(c, uNevoa, (1.0 - exp(-uNevoaD * vProf)) * 0.6);',
      '  gl_FragColor = vec4(c, 1.0);',
      '}'
    ].join('\n'),
    side: op.dupla ? THREE.DoubleSide : THREE.FrontSide
  });
};

/* ---------------------------------------------------------------------
   Lâmpadas: quadradinhos instanciados que olham pra câmera
   lista: [{x,y,z, tam, cor:[r,g,b], fase, pisca}]
   --------------------------------------------------------------------- */
F.lampadas = function (lista, op) {
  op = op || {};
  var n = lista.length;
  var g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]), 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  var centro = new Float32Array(n * 3), dados = new Float32Array(n * 4), cor = new Float32Array(n * 3);
  for (var i = 0; i < n; i++) {
    var L = lista[i];
    centro[i * 3] = L.x; centro[i * 3 + 1] = L.y; centro[i * 3 + 2] = L.z;
    dados[i * 4] = L.tam; dados[i * 4 + 1] = L.fase || 0; dados[i * 4 + 2] = L.pisca || 0; dados[i * 4 + 3] = L.grupo || 0;
    cor[i * 3] = L.cor[0]; cor[i * 3 + 1] = L.cor[1]; cor[i * 3 + 2] = L.cor[2];
  }
  g.setAttribute('centro', new THREE.InstancedBufferAttribute(centro, 3));
  g.setAttribute('dados', new THREE.InstancedBufferAttribute(dados, 4));
  g.setAttribute('cor', new THREE.InstancedBufferAttribute(cor, 3));
  g.instanceCount = n;
  var m = new THREE.ShaderMaterial({
    uniforms: { uTempo: F.U.uTempo, uForca: { value: 1 }, uVel: { value: op.vel === undefined ? 0.5 : op.vel }, uModo: { value: op.modo || 0 } },
    vertexShader: [
      'attribute vec3 centro; attribute vec4 dados; attribute vec3 cor;',
      'uniform float uTempo; uniform float uForca; uniform float uVel; uniform float uModo;',
      'varying vec2 vUv; varying vec3 vCor;',
      'void main(){',
      '  vUv = position.xy;',
      '  float onda = fract(uTempo * uVel - dados.y);',
      // modo 0: corrida de luzes (acende e vai apagando). modo 1: cintila devagar (estrela)
      '  float corrida = 0.30 + 0.70 * (1.0 - smoothstep(0.0, 0.6, onda));',
      '  float cintila = 0.55 + 0.45 * sin(uTempo * (0.7 + dados.y * 1.9) + dados.y * 40.0);',
      '  float b = mix(1.0, mix(corrida, cintila, uModo), dados.z);',
      '  vCor = cor * b * uForca;',
      '  vec4 mv = modelViewMatrix * vec4(centro, 1.0);',
      '  mv.xy += position.xy * dados.x;',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec2 vUv; varying vec3 vCor;',
      'void main(){',
      '  float d = length(vUv) * 2.0;',
      '  float halo = 1.0 - smoothstep(0.0, 1.0, d); halo *= halo;',
      '  float nucleo = 1.0 - smoothstep(0.0, 0.24, d);',
      '  gl_FragColor = vec4(vCor * (halo * 0.5 + nucleo * 1.3), 1.0);',
      '}'
    ].join('\n'),
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  });
  var malha = new THREE.Mesh(g, m);
  malha.frustumCulled = false;
  malha.renderOrder = 5;
  return malha;
};

/* ---------------------------------------------------------------------
   Brilhos: manchas de luz paradas (uma malha só por grupo)
   forma 0 = redonda; 1 = "lavagem" (forte em cima, abrindo pra baixo); 2 = faixa (some pras pontas)
   --------------------------------------------------------------------- */
F.Brilhos = function () { this.p = []; this.uv = []; this.c = []; this.f = []; };
F.Brilhos.prototype = {
  // centro, vetor "direita" (meia largura) e vetor "cima" (meia altura)
  quad: function (cx, cy, cz, dx, dy, dz, ux, uy, uz, cor, forma) {
    var P = [
      [cx - dx - ux, cy - dy - uy, cz - dz - uz, 0, 0], [cx + dx - ux, cy + dy - uy, cz + dz - uz, 1, 0],
      [cx + dx + ux, cy + dy + uy, cz + dz + uz, 1, 1], [cx - dx + ux, cy - dy + uy, cz - dz + uz, 0, 1]
    ];
    var o = [0, 1, 2, 0, 2, 3];
    for (var i = 0; i < 6; i++) {
      var v = P[o[i]];
      this.p.push(v[0], v[1], v[2]); this.uv.push(v[3], v[4]); this.c.push(cor[0], cor[1], cor[2]); this.f.push(forma || 0);
    }
    return this;
  },
  malha: function () {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.p), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(this.uv), 2));
    g.setAttribute('cor', new THREE.BufferAttribute(new Float32Array(this.c), 3));
    g.setAttribute('forma', new THREE.BufferAttribute(new Float32Array(this.f), 1));
    var m = new THREE.ShaderMaterial({
      uniforms: { uForca: { value: 1 } },
      vertexShader: [
        'attribute vec3 cor; attribute float forma;',
        'varying vec2 vUv; varying vec3 vCor; varying float vForma;',
        'void main(){ vUv = uv; vCor = cor; vForma = forma; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
      ].join('\n'),
      fragmentShader: [
        'uniform float uForca; varying vec2 vUv; varying vec3 vCor; varying float vForma;',
        'void main(){',
        '  vec2 p = vUv - 0.5;',
        '  float redonda = 1.0 - smoothstep(0.0, 0.5, length(p)); redonda *= redonda;',
        '  float larg = mix(0.5, 0.16, vUv.y);',
        '  float lavagem = (1.0 - smoothstep(larg * 0.35, larg, abs(p.x))) * vUv.y * vUv.y * (1.0 - smoothstep(0.92, 1.0, vUv.y));',
        '  float faixa = (1.0 - smoothstep(0.0, 0.5, abs(p.y))) * (1.0 - smoothstep(0.3, 0.5, abs(p.x)));',
        '  float a = vForma < 0.5 ? redonda : (vForma < 1.5 ? lavagem : faixa * faixa);',
        '  gl_FragColor = vec4(vCor * a * uForca, 1.0);',
        '}'
      ].join('\n'),
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide
    });
    var malha = new THREE.Mesh(g, m);
    malha.renderOrder = 4;
    return malha;
  }
};

/* ---------------------------------------------------------------------
   Canvas, fontes e imagens
   --------------------------------------------------------------------- */
F.FONTE_TITULO = '"Playfair Display", Georgia, "Times New Roman", serif';
F.FONTE_LETRA = '"Bebas Neue", "Arial Narrow", Impact, sans-serif';
F.FONTE_NEON = 'Yellowtail, "Brush Script MT", cursive';

F.canvas = function (w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

// textura a partir de um canvas. solta: libera a memória do canvas depois de mandar pra placa de vídeo
F.texturaCanvas = function (c, op) {
  op = op || {};
  var t = new THREE.CanvasTexture(c);
  if (op.repete) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  if (op.semMip) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; }
  else t.anisotropy = F.aniso || 1;
  if (op.solta) t.onUpdate = function () { c.width = c.height = 1; t.onUpdate = null; };
  return t;
};

F.carregarImagem = function (url) {
  return new Promise(function (ok, erro) {
    var im = new Image();
    im.onload = function () {
      if (im.decode) im.decode().then(function () { ok(im); }, function () { ok(im); });
      else ok(im);
    };
    im.onerror = function () { erro(new Error('não carregou: ' + url)); };
    im.src = url;
  });
};

// desenha a imagem cobrindo o retângulo (corta o que sobra). foco: 0 = em cima, 1 = embaixo
F.cobrir = function (x, im, dx, dy, dw, dh, foco) {
  var iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
  var e = Math.max(dw / iw, dh / ih), sw = dw / e, sh = dh / e;
  x.drawImage(im, (iw - sw) / 2, (ih - sh) * (foco === undefined ? 0.35 : foco), sw, sh, dx, dy, dw, dh);
};

// quebra o texto em linhas que cabem na largura
F.linhas = function (x, texto, largura) {
  var saida = [];
  String(texto).split('\n').forEach(function (par) {
    var palavras = par.split(' '), linha = '';
    for (var i = 0; i < palavras.length; i++) {
      var teste = linha ? linha + ' ' + palavras[i] : palavras[i];
      if (linha && x.measureText(teste).width > largura) { saida.push(linha); linha = palavras[i]; }
      else linha = teste;
    }
    saida.push(linha);
  });
  return saida;
};

// escreve com espaço entre as letras (o canvas não tem letter-spacing em todo navegador)
F.espacado = function (x, texto, cx, y, espaco) {
  var total = 0, i;
  for (i = 0; i < texto.length; i++) total += x.measureText(texto[i]).width + (i < texto.length - 1 ? espaco : 0);
  var px = cx - total / 2, antes = x.textAlign;
  x.textAlign = 'left';
  for (i = 0; i < texto.length; i++) { x.fillText(texto[i], px, y); px += x.measureText(texto[i]).width + espaco; }
  x.textAlign = antes;
  return total;
};

// um padrão pequeno que se repete (tapete, parede)
F.padrao = function (tam, desenha) {
  var c = F.canvas(tam, tam), x = c.getContext('2d');
  x.fillStyle = '#808080'; x.fillRect(0, 0, tam, tam);
  desenha(x, tam);
  return F.texturaCanvas(c, { repete: true });
};
