/* =====================================================================
   projecao.js: o filme que passa na tela.
   Monta a lista de "planos" a partir do textos.js (contagem, cartelas, fotos,
   vídeos, créditos) e, a cada quadro, diz pra tela o que mostrar.
   Só 2 texturas ficam na placa de vídeo de cada vez: o plano de agora e o anterior.
   ===================================================================== */
F.projecao = function (ctx) {
  var renderer = ctx.renderer, S = F.SALA, AS = S.telaW / S.telaH;
  var M = window.MIDIA || { fotos: {}, videos: {} };
  var CW = 512, CH = 768;                           // o tamanho das cartelas (2:3, igual à tela)
  var COR_CARTELA = [0.10, 0.05, 0.08];

  var preta = new THREE.DataTexture(new Uint8Array([5, 3, 6, 255]), 1, 1, THREE.RGBAFormat);
  preta.needsUpdate = true;

  var uni = {
    tA: { value: preta }, tB: { value: preta },
    uTrA: { value: new THREE.Vector4(1, 1, 0, 0) }, uTrB: { value: new THREE.Vector4(1, 1, 0, 0) },
    uMix: { value: 0 }, uLamp: { value: 0 }, uPb: { value: new THREE.Vector2(0, 0) }, uTempo: F.U.uTempo
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uni,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform sampler2D tA; uniform sampler2D tB; uniform vec4 uTrA; uniform vec4 uTrB;',
      'uniform float uMix; uniform float uLamp; uniform vec2 uPb; uniform float uTempo;',
      'varying vec2 vUv;',
      'float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
      'vec3 pega(sampler2D t, vec4 tr, vec2 uv, float pb){',
      '  vec2 p = (uv - 0.5) * tr.xy + 0.5 + tr.zw;',
      '  vec2 d = min(p, 1.0 - p);',
      '  float dentro = smoothstep(0.0, 0.004, min(d.x, d.y));',
      '  vec3 c = texture2D(t, clamp(p, 0.0, 1.0)).rgb * dentro;',
      '  float l = dot(c, vec3(0.299, 0.587, 0.114));',
      '  return mix(c, vec3(l) * vec3(1.06, 1.0, 0.9), pb);',
      '}',
      'void main(){',
      // a película treme um pouquinho na janela do projetor
      '  vec2 uv = vUv + vec2(sin(uTempo * 31.0) * 0.0005, sin(uTempo * 23.0) * 0.0008);',
      '  vec3 c = mix(pega(tA, uTrA, uv, uPb.x), pega(tB, uTrB, uv, uPb.y), uMix);',
      '  float pisca = 0.97 + 0.03 * sin(uTempo * 47.0) * sin(uTempo * 13.0);',
      '  vec2 q = vUv - 0.5; float vinheta = 1.0 - dot(q, q) * 0.85;',
      '  float grao = h(vUv * vec2(640.0, 960.0) + fract(uTempo * 7.0) * 100.0) - 0.5;',
      '  c = c * pisca * vinheta + grao * 0.045;',
      // risco de película: de vez em quando, uma linha em pé
      '  float tq = floor(uTempo * 9.0);',
      '  float risco = step(0.74, h(vec2(tq, 9.0))) * (1.0 - smoothstep(0.0, 0.0016, abs(vUv.x - h(vec2(tq, 3.0)))));',
      '  c += risco * 0.09;',
      '  vec3 apagada = vec3(0.036, 0.03, 0.038);',
      '  gl_FragColor = vec4(mix(apagada, c * 0.97 + 0.015, uLamp), 1.0);',
      '}'
    ].join('\n')
  });
  ctx.tela.material = material;

  /* ---------- as cartelas (texto na tela) ---------- */
  function fundo(x) {
    var g = x.createRadialGradient(CW / 2, CH * 0.45, 30, CW / 2, CH / 2, CH * 0.75);
    g.addColorStop(0, '#34122a'); g.addColorStop(1, '#0c040a');
    x.fillStyle = g; x.fillRect(0, 0, CW, CH);
    x.strokeStyle = 'rgba(226,181,107,0.55)'; x.lineWidth = 2; x.strokeRect(22, 22, CW - 44, CH - 44);
    x.strokeStyle = 'rgba(226,181,107,0.25)'; x.lineWidth = 1; x.strokeRect(30, 30, CW - 60, CH - 60);
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  }
  function enfeite(x, y) {
    x.strokeStyle = 'rgba(226,181,107,0.7)'; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(CW / 2 - 70, y); x.lineTo(CW / 2 - 12, y); x.moveTo(CW / 2 + 12, y); x.lineTo(CW / 2 + 70, y); x.stroke();
    x.fillStyle = '#ff8fb8'; x.beginPath(); x.moveTo(CW / 2, y - 6); x.lineTo(CW / 2 + 6, y); x.lineTo(CW / 2, y + 6); x.lineTo(CW / 2 - 6, y); x.closePath(); x.fill();
  }
  // escreve um título grande, quebrando em linhas e encolhendo até caber. devolve o y de baixo
  function titulao(x, texto, yCentro, tamMax, maxLinhas, cor) {
    var tam = tamMax + 4, linhas;
    do { tam -= 4; x.font = 'italic 700 ' + tam + 'px ' + F.FONTE_TITULO; linhas = F.linhas(x, texto, CW - 96); } while (linhas.length > maxLinhas && tam > 30);
    var y0 = yCentro - (linhas.length - 1) * tam * 0.56;
    x.fillStyle = cor || '#fff3e8';
    linhas.forEach(function (l, k) { x.fillText(l, CW / 2, y0 + k * tam * 1.12); });
    return y0 + (linhas.length - 1) * tam * 1.12;
  }
  function cartelaTitulo() {
    var c = F.canvas(CW, CH), x = c.getContext('2d'); fundo(x);
    x.fillStyle = 'rgba(255,236,224,0.85)'; x.font = '28px ' + F.FONTE_LETRA;
    F.espacado(x, TEXTOS.apresenta.toUpperCase(), CW / 2, 230, 8);
    enfeite(x, 262);
    var y = titulao(x, TEXTOS.titulo, 392, 78, 3);
    enfeite(x, y + 52);
    x.fillStyle = '#ff8fb8'; x.font = '30px ' + F.FONTE_LETRA;
    F.espacado(x, TEXTOS.estrelando.toUpperCase(), CW / 2, y + 104, 8);
    return c;
  }
  function cartelaCapitulo(n, cap) {
    return function () {
      var c = F.canvas(CW, CH), x = c.getContext('2d'); fundo(x);
      x.fillStyle = '#ff8fb8'; x.font = '34px ' + F.FONTE_LETRA;
      F.espacado(x, (TEXTOS.capitulo + ' ' + n).toUpperCase(), CW / 2, 300, 10);
      enfeite(x, 330);
      var y = titulao(x, cap.titulo, 430, 82, 2);
      x.fillStyle = 'rgba(255,236,224,0.8)'; x.font = '28px ' + F.FONTE_LETRA;
      F.espacado(x, cap.data.toUpperCase(), CW / 2, y + 62, 5);
      return c;
    };
  }
  function cartelaTexto(texto, sub, pequeno) {
    return function () {
      var c = F.canvas(CW, CH), x = c.getContext('2d'); fundo(x);
      var y = titulao(x, texto, sub ? 380 : 400, pequeno ? 58 : 76, 3);
      if (sub) {
        enfeite(x, y + 44);
        x.fillStyle = '#ff8fb8'; x.font = '28px ' + F.FONTE_LETRA;
        F.espacado(x, sub.toUpperCase(), CW / 2, y + 92, 7);
      }
      return c;
    };
  }
  function cartelaCreditos() {
    var c = F.canvas(CW, 4096), x = c.getContext('2d');
    x.fillStyle = '#0a0409'; x.fillRect(0, 0, CW, 4096);
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    var y = CH + 120;                                    // começa com a tela vazia: o texto sobe de baixo
    y = titulao(x, TEXTOS.titulo, y, 60, 3) + 50;
    enfeite(x, y); y += 46;
    x.fillStyle = 'rgba(255,236,224,0.7)'; x.font = '24px ' + F.FONTE_LETRA;
    F.espacado(x, TEXTOS.umFilmeDe.toUpperCase(), CW / 2, y, 6); y += 130;
    CREDITOS.forEach(function (cr) {
      x.fillStyle = '#ff8fb8'; x.font = '25px ' + F.FONTE_LETRA;
      F.espacado(x, cr[0].toUpperCase(), CW / 2, y, 7); y += 46;
      x.fillStyle = '#fff3e8';
      var tam = cr[1].length > 34 ? 27 : 38;
      x.font = 'italic 400 ' + tam + 'px ' + F.FONTE_TITULO;
      F.linhas(x, cr[1], CW - 80).forEach(function (l) { x.fillText(l, CW / 2, y); y += tam * 1.25; });
      y += 74;
    });
    y += 60;
    // o último quadro: a frase do story, de volta
    var topo = y;
    x.fillStyle = 'rgba(255,236,224,0.92)'; x.font = 'italic 400 33px ' + F.FONTE_TITULO;
    var ls = F.linhas(x, TEXTOS.fraseStory, CW - 110), yy = topo + 250 - ls.length * 20;
    ls.forEach(function (l) { x.fillText(l, CW / 2, yy); yy += 44; });
    enfeite(x, yy + 22);
    x.fillStyle = '#fff3e8'; x.font = '400 29px ' + F.FONTE_TITULO;
    F.linhas(x, TEXTOS.fimLinha1, CW - 100).forEach(function (l, k) { x.fillText(l, CW / 2, yy + 92 + k * 38); });
    x.fillStyle = '#ff8fb8'; x.font = 'italic 700 38px ' + F.FONTE_TITULO;
    x.fillText(TEXTOS.fimLinha2, CW / 2, yy + 172);
    x.fillStyle = 'rgba(226,181,107,0.9)'; x.font = '38px ' + F.FONTE_LETRA;
    F.espacado(x, TEXTOS.fim.toUpperCase(), CW / 2, topo + CH - 110, 16);
    var total = Math.min(4096, topo + CH);
    var f = F.canvas(CW, total);
    f.getContext('2d').drawImage(c, 0, 0);
    c.width = c.height = 1;
    return f;
  }

  /* ---------- a lista de planos ---------- */
  var planos = [], nVideo = 0, sorte = F.sorteio(20);
  function movimento(p, rapido) {             // o zoom lento em cada foto (Ken Burns)
    var entra = sorte() < 0.6, z = rapido ? 0.05 : 0.11, base = 1.02;
    p.z0 = entra ? base : base + z; p.z1 = entra ? base + z : base;
    p.px0 = (sorte() * 2 - 1) * 0.5; p.px1 = (sorte() * 2 - 1) * 0.5;
    p.py0 = 0.35 + (sorte() * 2 - 1) * 0.25; p.py1 = 0.35 + (sorte() * 2 - 1) * 0.25;
  }
  function plano(p) {
    p.entra = p.entra === undefined ? 0.7 : p.entra;
    p.z0 = p.z0 || 1; p.z1 = p.z1 || 1; p.px0 = p.px0 || 0; p.px1 = p.px1 || 0; p.py0 = p.py0 || 0; p.py1 = p.py1 || 0;
    p.encaixe = p.encaixe === undefined ? 1 : p.encaixe;
    planos.push(p); return p;
  }
  function cena(c, rapido, secao) {
    var p;
    if (c.video && M.videos[c.video]) {
      var mv = M.videos[c.video];
      p = plano({ tipo: 'video', arquivo: c.video, w: mv.w, h: mv.h, cor: mv.cor, slot: (nVideo++) % 2, inicio: c.inicio || 0,
        dur: Math.min(c.dur || 4.5, mv.dur - (c.inicio || 0) - 0.3), entra: rapido ? 0.3 : 0.7, fixo: true, legenda: c.legenda, secao: secao });
      p.py0 = p.py1 = 0.3;
    } else if (c.foto && M.fotos[c.foto]) {
      var mf = M.fotos[c.foto];
      p = plano({ tipo: 'foto', arquivo: c.foto, w: mf.w, h: mf.h, cor: mf.cor, dur: c.dur || (rapido ? 1.7 : 3.4), entra: rapido ? 0.3 : 0.8, legenda: c.legenda, secao: secao });
      movimento(p, rapido);
      if (mf.w / mf.h > 0.9) p.encaixe = 0.45;         // foto deitada ou quadrada: não corta tanto
    }
    return p;
  }

  plano({ tipo: 'contagem', dur: 3.6, entra: 0.05, cor: [0.42, 0.42, 0.42], w: 256, h: 384, pb: 1, fixo: true });
  var iCorpo = planos.length;
  plano({ tipo: 'cartela', desenha: cartelaTitulo, dur: 4.6, entra: 0.6, cor: COR_CARTELA, w: CW, h: CH, titulo: true });
  CAPITULOS.forEach(function (cap, i) {
    if (i === CAPITULOS.length - 1 && OS_DIAS.length) {
      plano({ tipo: 'cartela', desenha: cartelaTexto(TEXTOS.osDias, TEXTOS.osDiasSub), dur: 2.4, cor: COR_CARTELA, w: CW, h: CH });
      OS_DIAS.forEach(function (c) { cena(c, true, 'dias'); });
    }
    plano({ tipo: 'cartela', desenha: cartelaCapitulo(i + 1, cap), dur: 2.8, cor: COR_CARTELA, w: CW, h: CH });
    cap.cenas.forEach(function (c) { cena(c, false, 'cap' + i); });
  });
  plano({ tipo: 'cartela', desenha: cartelaTexto(TEXTOS.proximoTitulo, null, true), dur: 2.6, cor: COR_CARTELA, w: CW, h: CH });
  PROXIMOS.forEach(function (t) { plano({ tipo: 'cartela', desenha: cartelaTexto(t), dur: 2.2, entra: 0.5, cor: COR_CARTELA, w: CW, h: CH }); });
  plano({ tipo: 'cartela', desenha: cartelaTexto(TEXTOS.continua), dur: 3.0, cor: COR_CARTELA, w: CW, h: CH });
  var iCreditos = planos.length;
  var pCred = plano({ tipo: 'creditos', desenha: cartelaCreditos, dur: 40, entra: 1.4, cor: [0.05, 0.03, 0.045], w: CW, h: 3600, fixo: true });

  // o corpo do filme se ajusta pra caber na música
  (function () {
    var alvo = (ctx.duracaoMusica || 159.5) - 2.0, fixo = 0, solto = 0, i;
    for (i = iCorpo; i < iCreditos; i++) { if (planos[i].tipo === 'video') fixo += planos[i].dur; else solto += planos[i].dur; }
    var e = Math.min(1, (alvo - fixo) / solto);
    if (e < 1) for (i = iCorpo; i < iCreditos; i++) if (planos[i].tipo !== 'video') planos[i].dur *= e;
    var t = 0;
    for (i = 0; i < planos.length; i++) { planos[i].t0 = t; planos[i].i = i; planos[i].prox = planos[i + 1] || null; t += planos[i].dur; }
  })();
  // as legendas: cada uma fica até a próxima legenda (ou uns 4 segundos)
  var legendas = [];
  planos.forEach(function (p) {
    if (!p.legenda) return;
    var fim = p.t0 + Math.max(p.dur, 3.8);
    for (var j = p.i + 1; j < planos.length; j++) {
      var q = planos[j];
      if (q.legenda || q.secao !== p.secao) { fim = Math.min(fim, q.t0); break; }
    }
    legendas.push({ t0: p.t0 + 0.35, t1: fim - 0.1, texto: p.legenda });
  });

  var dur = {
    contagem: planos[iCorpo].t0,
    corpo: planos[iCreditos].t0 - planos[iCorpo].t0,
    creditos: 0, total: 0
  };

  /* ---------- texturas: pede antes, solta depois ---------- */
  function texDeImagem(im) {
    var t = new THREE.Texture(im);
    t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
    try { renderer.initTexture(t); } catch (e) {}
    return t;
  }
  function pedir(p) {
    if (!p || p.pedido) return;
    p.pedido = true;
    var ger = p.ger = (p.ger || 0) + 1;
    if (p.tipo === 'foto' || p.tipo === 'video') {
      F.carregarImagem((p.tipo === 'foto' ? 'fotos/' : 'videos/') + p.arquivo + '.jpg').then(function (im) {
        if (p.ger !== ger || !p.pedido) return;
        p.tex = texDeImagem(im);
      }, function () {});
    } else if (p.tipo === 'contagem') {
      p.canvas = F.canvas(256, 384);
      p.tex = F.texturaCanvas(p.canvas, { semMip: true });
    } else {
      var c = p.desenha();
      p.w = c.width; p.h = c.height;
      p.tex = F.texturaCanvas(c, { semMip: true, solta: true });
      try { renderer.initTexture(p.tex); } catch (e) {}
      if (p.tipo === 'creditos') acertarCreditos();
    }
  }
  function soltar(p) {
    if (!p || !p.pedido) return;
    if (p.tex) p.tex.dispose();
    p.tex = null; p.pedido = false; p.canvas = null; p.tocando = false; p.videoOk = false;
  }
  function acertarCreditos() {
    pCred.rola = (pCred.h - CH) / 92;                  // 92 px por segundo
    pCred.dur = pCred.rola + 6;
    dur.creditos = pCred.rola; dur.total = pCred.t0 + pCred.rola;
  }
  // desenha os créditos uma vez só pra saber a altura (e a duração)
  (function () { var c = cartelaCreditos(); pCred.h = c.height; c.width = c.height = 1; acertarCreditos(); })();

  /* ---------- vídeos: 2 elementos que se revezam ---------- */
  var vids = [0, 1].map(function () {
    var v = document.createElement('video');
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.preload = 'auto'; v.loop = false;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    v.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1';
    document.body.appendChild(v);
    var t = new THREE.VideoTexture(v);
    t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;
    return { el: v, tex: t, arquivo: null };
  });
  var videoQuebrado = false, videoConferido = false, pretos = 0, proximaConferida = 0, parado = false;
  function carregarVideo(p) {
    var v = vids[p.slot];
    if (v.arquivo === p.arquivo) return;
    v.arquivo = p.arquivo; v.el.src = 'videos/' + p.arquivo + '.mp4';
    try { v.el.load(); } catch (e) {}
  }
  function tocarVideo(p) {
    if (p.tocando || videoQuebrado || ctx.semVideo) return;
    carregarVideo(p);
    p.tocando = true; p.videoOk = false;
    var el = vids[p.slot].el;
    try { if (p.inicio || el.currentTime > 0.05) el.currentTime = p.inicio; } catch (e) {}
    if (parado) return;
    var pr = el.play();
    if (pr && pr.catch) pr.catch(function () { p.semVideo = true; });
  }
  // confere se o vídeo está mesmo chegando na placa de vídeo (num iPhone antigo ele pode vir preto)
  var rt = null, cenaT = null, camT = null, quadT = null;
  function videoPreto(tex) {
    try {
      if (!rt) {
        rt = new THREE.WebGLRenderTarget(4, 4); cenaT = new THREE.Scene(); camT = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        quadT = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: tex })); cenaT.add(quadT);
      }
      quadT.material.map = tex;
      var antes = renderer.getRenderTarget();
      renderer.setRenderTarget(rt); renderer.render(cenaT, camT);
      var px = new Uint8Array(64); renderer.readRenderTargetPixels(rt, 0, 0, 4, 4, px);
      renderer.setRenderTarget(antes);
      var maior = 0;
      for (var i = 0; i < 64; i += 4) maior = Math.max(maior, px[i], px[i + 1], px[i + 2]);
      return maior < 10;
    } catch (e) { return false; }
  }

  function texDe(p) {
    if (!p) return preta;
    if (p.tipo === 'video' && p.videoOk && !videoQuebrado) return vids[p.slot].tex;
    return p.tex || preta;
  }
  var v2 = { x: 0, y: 0 };
  function transformar(p, tf, v4) {
    if (!p) { v4.set(1, 1, 0, 0); return; }
    if (p.tipo === 'creditos') {
      var sy = CH / p.h, u = F.clamp((tf - p.t0) / (p.rola || 30), 0, 1), a = 0.86;
      if (u > a) { var xx = (u - a) / (1 - a); u = a + (1 - a) * (xx + xx * xx - xx * xx * xx); }
      v4.set(1, sy, 0, F.lerp(0.5 - sy / 2, -(0.5 - sy / 2), u));
      return;
    }
    var am = p.w / p.h;
    var cx = am > AS ? AS / am : 1, cy = am > AS ? 1 : am / AS;              // cobrindo a tela
    var kx = am > AS ? 1 : AS / am, ky = am > AS ? am / AS : 1;              // cabendo inteira
    var sx = F.lerp(kx, cx, p.encaixe), sy2 = F.lerp(ky, cy, p.encaixe);
    var visivel = p.dur + (p.prox ? p.prox.entra : 0);
    var w = F.clamp((tf - p.t0) / visivel, 0, 1), z = F.lerp(p.z0, p.z1, w);
    sx /= z; sy2 /= z;
    v4.set(sx, sy2, F.lerp(p.px0, p.px1, w) * Math.max(0, 1 - sx) / 2, F.lerp(p.py0, p.py1, w) * Math.max(0, 1 - sy2) / 2);
  }
  function desenharContagem(p, t) {
    var x = p.canvas.getContext('2d'), W = 256, H = 384, seg = 1.1;
    var n = 3 - Math.floor(t / seg), fr = (t % seg) / seg;
    if (n < 1) { x.fillStyle = '#050505'; x.fillRect(0, 0, W, H); p.tex.needsUpdate = true; return; }
    x.fillStyle = '#a8a39a'; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(40,38,36,0.42)';
    x.beginPath(); x.moveTo(W / 2, H / 2); x.arc(W / 2, H / 2, 260, -Math.PI / 2, -Math.PI / 2 + fr * Math.PI * 2); x.closePath(); x.fill();
    x.strokeStyle = '#2b2927'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, H / 2); x.lineTo(W, H / 2); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke();
    x.lineWidth = 4;
    x.beginPath(); x.arc(W / 2, H / 2, 96, 0, 7); x.stroke();
    x.beginPath(); x.arc(W / 2, H / 2, 112, 0, 7); x.stroke();
    x.fillStyle = '#1e1c1b'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '170px ' + F.FONTE_LETRA; x.fillText(String(n), W / 2, H / 2 + 8);
    p.tex.needsUpdate = true;
  }

  var atual = -1;
  var estado = { luz: [0, 0, 0], legenda: '', forcaLegenda: 0, indice: -1, bipe: 0 };
  function mudou(i) {
    var j;
    for (j = 0; j < planos.length; j++) if (j < i - 1 || j > i + 4) soltar(planos[j]);
    for (j = Math.max(0, i - 1); j <= Math.min(planos.length - 1, i + 3); j++) pedir(planos[j]);
    // para os vídeos que já saíram e adianta o próximo
    for (j = 0; j < planos.length; j++) {
      var q = planos[j];
      if (q.tipo === 'video' && q.tocando && (j < i - 1 || j > i)) { q.tocando = false; q.videoOk = false; try { vids[q.slot].el.pause(); } catch (e) {} }
    }
    for (j = i + 1; j <= Math.min(planos.length - 1, i + 3); j++) {
      var n = planos[j];
      if (n.tipo !== 'video') continue;
      var ocupado = (planos[i].tipo === 'video' && planos[i].slot === n.slot) || (i > 0 && planos[i - 1].tipo === 'video' && planos[i - 1].slot === n.slot);
      if (!ocupado && !videoQuebrado && !ctx.semVideo) carregarVideo(n);
      break;
    }
  }

  function atualizar(tf) {
    estado.legenda = ''; estado.forcaLegenda = 0; estado.bipe = 0;
    if (tf < 0) {
      if (atual !== -1) { atual = -1; }
      pedir(planos[0]); pedir(planos[1]); pedir(planos[2]);
      uni.tA.value = preta; uni.tB.value = preta; uni.uMix.value = 0;
      estado.luz[0] = estado.luz[1] = estado.luz[2] = 0; estado.indice = -1;
      return estado;
    }
    var i = (atual >= 0 && planos[atual].t0 <= tf) ? atual : 0;
    while (i + 1 < planos.length && planos[i + 1].t0 <= tf) i++;
    if (i !== atual) { atual = i; mudou(i); }
    var p = planos[i], ant = i > 0 ? planos[i - 1] : null;
    var mix = F.suave(F.clamp((tf - p.t0) / p.entra, 0, 1));
    if (p.tipo === 'video') tocarVideo(p);
    // o vídeo só entra quando já tem quadro de verdade; até lá fica a capa (que é o primeiro quadro)
    [p, ant].forEach(function (q) {
      if (!q || q.tipo !== 'video' || !q.tocando || q.videoOk) return;
      var el = vids[q.slot].el;
      if (el.readyState >= 2 && !el.paused && el.currentTime > q.inicio + 0.12) q.videoOk = true;
    });
    if (p.tipo === 'video' && p.videoOk && !videoConferido && !videoQuebrado && mix >= 1 && tf > proximaConferida && tf - p.t0 > 0.9) {
      if (videoPreto(vids[p.slot].tex)) { pretos++; proximaConferida = tf + 0.5; if (pretos >= 2) videoQuebrado = true; }
      else videoConferido = true;
    }
    if (p.tipo === 'contagem') {
      var tc = tf - p.t0; desenharContagem(p, tc);
      var n = Math.floor(tc / 1.1);
      if (n !== p.ultimoBipe && n < 3) { p.ultimoBipe = n; estado.bipe = 3 - n; }
    } else planos[0].ultimoBipe = -1;
    uni.tA.value = texDe(ant); uni.tB.value = texDe(p);
    transformar(ant, tf, uni.uTrA.value); transformar(p, tf, uni.uTrB.value);
    uni.uMix.value = mix;
    uni.uPb.value.set(ant && ant.pb ? 1 : 0, p.pb ? 1 : 0);
    var ca = ant ? ant.cor : [0, 0, 0], cb = p.cor, lamp = uni.uLamp.value;
    var trem = p.tipo === 'contagem' ? 0.75 + 0.25 * Math.sin(tf * 40) : 1;
    for (var k = 0; k < 3; k++) estado.luz[k] = F.lerp(ca[k], cb[k], mix) * lamp * trem;
    for (k = 0; k < legendas.length; k++) {
      var L = legendas[k];
      if (tf >= L.t0 && tf < L.t1) { estado.legenda = L.texto; estado.forcaLegenda = F.janela(tf, L.t0, L.t0 + 0.4, L.t1 - 0.35, L.t1); break; }
    }
    estado.indice = i;
    return estado;
  }

  return {
    material: material, planos: planos, dur: dur, estado: estado,
    atualizar: atualizar,
    lampada: function (v) { uni.uLamp.value = v; },
    // já vai buscando o começo do filme (chamar quando o passeio começa)
    aquecer: function () { for (var j = 0; j < 5; j++) pedir(planos[j]); },
    // dentro do primeiro toque: o iPhone só deixa o vídeo tocar depois se ele foi "destravado" num toque
    destravar: function () {
      var primeiro = null;
      planos.forEach(function (p) { if (!primeiro && p.tipo === 'video') primeiro = p; });
      if (!primeiro || ctx.semVideo) return;
      vids.forEach(function (v, k) {
        if (k === primeiro.slot) { v.arquivo = primeiro.arquivo; v.el.src = 'videos/' + primeiro.arquivo + '.mp4'; }
        else v.el.src = 'videos/' + primeiro.arquivo + '.mp4#t=0.1';
        var pr = v.el.play();
        if (pr && pr.then) pr.then(function () { v.el.pause(); if (k !== primeiro.slot) v.arquivo = null; }, function () {});
      });
    },
    pausar: function () { parado = true; vids.forEach(function (v) { try { v.el.pause(); } catch (e) {} }); },
    retomar: function () {
      parado = false;
      planos.forEach(function (p) { if (p.tipo === 'video' && p.tocando) { var pr = vids[p.slot].el.play(); if (pr && pr.catch) pr.catch(function () {}); } });
    },
    reiniciar: function () {
      vids.forEach(function (v) { try { v.el.pause(); } catch (e) {} });
      planos.forEach(function (p) { p.tocando = false; p.videoOk = false; });
      atual = -1; proximaConferida = 0;
    },
    info: function () { return { planos: planos.length, atual: atual, dur: dur, videoQuebrado: videoQuebrado, videoConferido: videoConferido, legendas: legendas.length }; }
  };
};
