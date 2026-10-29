/* Kosmika · landing — lógica (HTML/CSS/JS estándar, sin dependencias) */

// ====== CONFIGURACIÓN ======
var WA_PHONE = '573012295603';          // WhatsApp de Kosmika, con indicativo de país
var UNIT_PRICE = 109900;                // precio por unidad (COP)
var COLORS = ['Negro', 'Blanco', 'Verde', 'Azul', 'Gris', 'Rojo'];
var SIZES = ['S', 'M', 'L', 'XL'];
var PACKS = [
  { n: 2, title: '2 unidades', sub: 'Paga 1 y lleva 2', price: 109900 },
  { n: 3, title: '3 unidades', sub: 'Pantalón bota campana', price: 139900 },
  { n: 4, title: '4 unidades', sub: 'Pantalón bota campana', price: 169900 }
];
// Lista de ejemplo (ciudades principales). Amplíala si lo necesitas.
var DEPS = {
  'Amazonas': ['Leticia'], 'Antioquia': ['Medellín', 'Bello', 'Envigado', 'Itagüí', 'Rionegro', 'Sabaneta'],
  'Arauca': ['Arauca'], 'Atlántico': ['Barranquilla', 'Soledad', 'Malambo'], 'Bogotá D.C.': ['Bogotá'],
  'Bolívar': ['Cartagena', 'Magangué'], 'Boyacá': ['Tunja', 'Duitama', 'Sogamoso'], 'Caldas': ['Manizales'],
  'Caquetá': ['Florencia'], 'Casanare': ['Yopal'], 'Cauca': ['Popayán'], 'Cesar': ['Valledupar'],
  'Chocó': ['Quibdó'], 'Córdoba': ['Montería'], 'Cundinamarca': ['Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Fusagasugá'],
  'Guainía': ['Inírida'], 'Guaviare': ['San José del Guaviare'], 'Huila': ['Neiva'], 'La Guajira': ['Riohacha', 'Maicao'],
  'Magdalena': ['Santa Marta', 'Ciénaga'], 'Meta': ['Villavicencio'], 'Nariño': ['Pasto', 'Tumaco'],
  'Norte de Santander': ['Cúcuta'], 'Putumayo': ['Mocoa'], 'Quindío': ['Armenia'], 'Risaralda': ['Pereira', 'Dosquebradas'],
  'San Andrés y Providencia': ['San Andrés'], 'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta'],
  'Sucre': ['Sincelejo'], 'Tolima': ['Ibagué'], 'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Yumbo'],
  'Vaupés': ['Mitú'], 'Vichada': ['Puerto Carreño']
};

// ====== ESTADO ======
var state = {
  pack: 2,
  units: [{ c: null, s: null }, { c: null, s: null }],
  step: 0, // 0 cerrado, 1 paquete, 2 datos, 3 gracias
  f: { prefijo: '+57', tel: '', nombre: '', apellido: '', correo: '', dir: '', det: '', barrio: '', dep: '', ciudad: '' },
  err1: ''
};

// ====== UTILIDADES ======
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function fmt(n) { return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function curPack() { return PACKS.filter(function (p) { return p.n === state.pack; })[0]; }
function depKey() {
  var v = (state.f.dep || '').trim().toLowerCase();
  return Object.keys(DEPS).filter(function (k) { return k.toLowerCase() === v; })[0];
}
function chip(name, on, attrs) {
  return '<button type="button" class="chip' + (on ? ' on' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '" ' + attrs + '>' + esc(name) + '</button>';
}

// ====== PAQUETES (sección de precios) ======
function renderPacks() {
  $('#packs').innerHTML = PACKS.map(function (p) {
    var on = p.n === state.pack;
    return '<button type="button" class="pack' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-pack="' + p.n + '">' +
      '<span class="t">' + p.title + '</span><span class="s">' + p.sub + '</span><span class="p">' + fmt(p.price) + '</span></button>';
  }).join('');
}

function setPack(n) {
  var old = state.units;
  state.pack = n;
  state.units = [];
  for (var i = 0; i < n; i++) state.units.push(old[i] || { c: null, s: null });
  state.err1 = '';
  renderPacks();
  if (state.step === 1) renderModal();
}

// ====== MODAL: CHECKOUT 2 PASOS + GRACIAS ======
function closeBtn() {
  return '<button type="button" class="x" aria-label="Cerrar" data-close><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
}

function modalStep1() {
  var cp = curPack(), sub = state.pack * UNIT_PRICE;
  var packs = PACKS.map(function (p) {
    var on = p.n === state.pack;
    var units = '';
    if (on) {
      units = '<div class="pk-u">' + state.units.map(function (u, i) {
        return '<h4>Producto ' + (i + 1) + '</h4><p class="lb">Color</p><div class="chips" role="group" aria-label="Color del producto ' + (i + 1) + '">' +
          COLORS.map(function (c) { return chip(c, u.c === c, 'data-uc="' + i + '|' + esc(c) + '"'); }).join('') +
          '</div><p class="lb">Talla</p><div class="chips" role="group" aria-label="Talla del producto ' + (i + 1) + '">' +
          SIZES.map(function (z) { return chip(z, u.s === z, 'data-us="' + i + '|' + z + '"'); }).join('') + '</div>';
      }).join('') + '</div>';
    }
    return '<div class="pk' + (on ? ' on' : '') + '">' + (p.n === 2 ? '<span class="pop">MÁS POPULAR</span>' : '') +
      '<button type="button" class="pk-h" aria-pressed="' + on + '" data-mpack="' + p.n + '">' +
      '<img src="assets/negro-frente.jpg" alt="">' +
      '<span class="pk-t"><b>' + p.title + '</b><span>' + p.sub + '</span><span class="free">Envío gratis</span></span>' +
      '<span class="pk-p">' + fmt(p.price) + '<s>' + fmt(p.n * UNIT_PRICE) + '</s></span></button>' + units + '</div>';
  }).join('');
  return '<div class="mdl-h"><div style="width:48px"></div><div class="dots" aria-label="Paso 1 de 2"><i class="on">1</i><b></b><i>2</i></div>' + closeBtn() + '</div>' +
    packs +
    '<div class="tot"><div><span>Subtotal</span><span>' + fmt(sub) + '</span></div><div><span>Envío</span><span>Gratis</span></div>' +
    '<div class="disc"><span>Descuento</span><span>- ' + fmt(sub - cp.price) + '</span></div>' +
    '<div class="gt"><span>Total</span><span>' + fmt(cp.price) + '</span></div></div>' +
    (state.err1 ? '<p class="err" role="alert">' + esc(state.err1) + '</p>' : '') +
    '<button type="button" class="btn" data-next1>SIGUIENTE</button>';
}

function fld(label, key, opts) {
  opts = opts || {};
  return '<label class="fld"><span>' + label + (opts.req ? ' <em>*</em>' : '') + '</span>' + (opts.hint ? '<small>' + opts.hint + '</small>' : '') +
    '<input type="' + (opts.type || 'text') + '" data-f="' + key + '" placeholder="' + esc(opts.ph || '') + '" value="' + esc(state.f[key]) + '"' +
    (opts.list ? ' list="' + opts.list + '"' : '') + (opts.id ? ' id="' + opts.id + '"' : '') + (opts.disabled ? ' disabled' : '') + '></label>';
}

function modalStep2() {
  var depOpts = Object.keys(DEPS).map(function (k) { return '<option value="' + esc(k) + '"></option>'; }).join('');
  var dk = depKey();
  var cityOpts = (dk ? DEPS[dk] : []).map(function (c) { return '<option value="' + esc(c) + '"></option>'; }).join('');
  return '<div class="mdl-h"><button type="button" class="x" aria-label="Volver al paso 1" data-back><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
    '<div class="dots" aria-label="Paso 2 de 2"><i class="on">1</i><b></b><i class="on">2</i></div>' + closeBtn() + '</div>' +
    '<div class="row2">' + fld('Prefijo', 'prefijo', { req: true }) + fld('Teléfono', 'tel', { req: true, type: 'tel', ph: '3001234567' }) + '</div>' +
    fld('Nombre', 'nombre', { req: true, ph: 'Ingrese su nombre' }) +
    fld('Apellido', 'apellido', { req: true, ph: 'Ingrese su apellido' }) +
    fld('Correo electrónico', 'correo', { type: 'email', ph: 'correo@ejemplo.com', hint: 'Te enviamos ahí la confirmación de tu pedido.' }) +
    fld('Dirección', 'dir', { req: true, ph: 'Calle 123 #45 - 67' }) +
    fld('Detalle de dirección', 'det', { ph: 'Apto 101, Torre B' }) +
    fld('Barrio', 'barrio', { ph: 'Nombre del barrio' }) +
    fld('Departamento', 'dep', { req: true, ph: 'Escribe para buscar...', list: 'kk-deps' }) +
    '<datalist id="kk-deps">' + depOpts + '</datalist>' +
    fld('Ciudad', 'ciudad', { req: true, ph: dk ? 'Escribe para buscar...' : 'Primero selecciona el departamento', list: 'kk-cities', id: 'f-ciudad', disabled: !dk }) +
    '<datalist id="kk-cities">' + cityOpts + '</datalist>' +
    '<div class="cod">Pagas cuando lo recibes · Envío gratis · Total ' + fmt(curPack().price) + '</div>' +
    '<div id="err2"></div>' +
    '<button type="button" class="btn" data-submit2>Pedir ahora<small>Pago contraentrega</small></button>';
}

function waText() {
  var f = state.f, cp = curPack();
  var lines = state.units.map(function (u, i) { return 'Unidad ' + (i + 1) + ': ' + (u.c || '-') + ', talla ' + (u.s || '-'); });
  return 'Hola, soy ' + f.nombre + ' ' + f.apellido + '. Quiero confirmar mi pedido: ' + cp.title + ' (' + fmt(cp.price) + '). ' +
    lines.join('; ') + '. Entrega: ' + f.dir + (f.det ? ', ' + f.det : '') + ', ' + f.ciudad + ', ' + f.dep + '. Tel: ' + f.prefijo + ' ' + f.tel + '.';
}

function modalStep3() {
  var n = state.pack;
  return '<div class="mdl-h"><div style="width:48px"></div><div style="flex:1;text-align:center;font-family:var(--hf);font-size:16px">Tienda Kosmika</div>' + closeBtn() + '</div>' +
    '<div class="ty"><div class="ty-ic"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#D63B2F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/><path d="M9.5 14l2 2 3.5-3.5"/></svg></div>' +
    '<h2>Gracias, ' + esc(state.f.nombre.trim() || 'bienvenida') + '</h2><p class="sub">Recibimos tu pedido</p>' +
    '<div class="ty-card"><p class="lbl">Resumen de compra</p><div class="ty-row"><img src="assets/negro-frente.jpg" alt="">' +
    '<div><b>Pantalón bota campana de licra elástica</b><span>' + n + ' unidades</span></div></div>' +
    '<div class="ty-pay"><span>Pagas al recibir</span><span>' + fmt(curPack().price) + '</span></div></div>' +
    '<div class="trk" aria-label="Estado de tu pedido"><div class="done"><i>✓</i>Pedido recibido</div><div><i>2</i>Confirma tus datos</div><div><i>3</i>Recibe y paga</div></div>' +
    '<a class="btn-wa" href="https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(waText()) + '" target="_blank" rel="noopener">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B2A17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.4-4.4a8.5 8.5 0 1 1 15.6-4.4z"/></svg>Confirmar mis datos</a>' +
    '<p class="ty-n">Se abre WhatsApp con tu pedido listo. Solo pulsa Enviar.</p></div>';
}

function renderModal() {
  var root = $('#modal-root');
  if (!state.step) { root.innerHTML = ''; return; }
  var body = state.step === 1 ? modalStep1() : state.step === 2 ? modalStep2() : modalStep3();
  root.innerHTML = '<div class="ov" role="dialog" aria-modal="true" aria-label="Tu pedido"><div class="mdl">' + body + '</div></div>';
}

function openModal() { state.step = 1; state.err1 = ''; renderModal(); }
function closeModal() { state.step = 0; renderModal(); }

function next1() {
  for (var i = 0; i < state.units.length; i++) {
    if (!state.units[i].c || !state.units[i].s) { state.err1 = 'Elige color y talla en el producto ' + (i + 1) + '.'; renderModal(); return; }
  }
  state.err1 = ''; state.step = 2; renderModal();
}

function submit2() {
  var f = state.f, e = [];
  if (f.tel.replace(/\D/g, '').length < 10) e.push('Escribe un teléfono de 10 dígitos.');
  if (!f.nombre.trim()) e.push('Falta tu nombre.');
  if (!f.apellido.trim()) e.push('Falta tu apellido.');
  if (f.correo && f.correo.indexOf('@') < 0) e.push('Revisa tu correo (o déjalo vacío).');
  if (!f.dir.trim()) e.push('Falta tu dirección.');
  if (!depKey()) e.push('Elige un departamento de la lista.');
  if (depKey() && !f.ciudad.trim()) e.push('Elige tu ciudad.');
  if (e.length) {
    $('#err2').innerHTML = '<div class="err" role="alert">' + e.map(function (t) { return '<div>' + esc(t) + '</div>'; }).join('') + '</div>';
    return;
  }
  // AQUÍ se podría enviar el pedido a tu sistema (Fluxi, Dropi, hoja de cálculo...).
  state.step = 3; renderModal();
}

// ====== EVENTOS (delegación) ======
document.addEventListener('click', function (ev) {
  var t = ev.target.closest ? ev.target.closest('button,a,[data-open]') : null;
  if (!t) return;
  if (t.hasAttribute('data-open')) { ev.preventDefault(); openModal(); return; }
  if (t.hasAttribute('data-close')) { closeModal(); return; }
  if (t.hasAttribute('data-back')) { state.step = 1; renderModal(); return; }
  if (t.hasAttribute('data-next1')) { next1(); return; }
  if (t.hasAttribute('data-submit2')) { submit2(); return; }
  if (t.hasAttribute('data-pack')) { setPack(parseInt(t.getAttribute('data-pack'), 10)); return; }
  if (t.hasAttribute('data-mpack')) { setPack(parseInt(t.getAttribute('data-mpack'), 10)); return; }
  var a;
  if ((a = t.getAttribute('data-uc'))) { a = a.split('|'); state.units[+a[0]].c = a[1]; state.err1 = ''; renderModal(); return; }
  if ((a = t.getAttribute('data-us'))) { a = a.split('|'); state.units[+a[0]].s = a[1]; state.err1 = ''; renderModal(); return; }
});

document.addEventListener('input', function (ev) {
  var k = ev.target && ev.target.getAttribute ? ev.target.getAttribute('data-f') : null;
  if (!k) return;
  state.f[k] = ev.target.value;
  if (k === 'dep') {
    // al cambiar el departamento se actualizan (sin redibujar) las ciudades
    state.f.ciudad = '';
    var dk = depKey(), c = $('#f-ciudad');
    $('#kk-cities').innerHTML = (dk ? DEPS[dk] : []).map(function (x) { return '<option value="' + esc(x) + '"></option>'; }).join('');
    c.value = ''; c.disabled = !dk;
    c.placeholder = dk ? 'Escribe para buscar...' : 'Primero selecciona el departamento';
  }
});

// ====== MOVIMIENTO: aparición, video ping-pong, paralaje, barra fija ======
var reduce = false;
try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

function initReveal() {
  if (reduce || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-rv');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(function (el) { io.observe(el); });
}

function initVideo() {
  var v = $('.hero-video');
  if (!v) return;
  function still() { try { v.pause(); } catch (e) {} v.style.display = 'none'; } // muestra el primer fotograma
  if (reduce) { still(); return; }
  v.muted = true; v.setAttribute('playsinline', '');
  v.addEventListener('error', still);
  var reversing = false, t0 = 0, from = 0;
  function step(now) {
    if (!reversing) return;
    if (!t0) { t0 = now; from = v.duration || v.currentTime; }
    var target = from - (now - t0) / 1000;
    if (target <= 0.03) {
      reversing = false; t0 = 0;
      try { v.currentTime = 0; } catch (e) {}
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      return;
    }
    if (!v.seeking) { try { v.currentTime = target; } catch (e) {} }
    requestAnimationFrame(step);
  }
  if (typeof requestAnimationFrame === 'function') {
    v.loop = false;
    v.addEventListener('ended', function () { reversing = true; t0 = 0; requestAnimationFrame(step); });
  } else { v.loop = true; } // fallback: loop normal
  var pl = v.play();
  if (pl && pl.catch) pl.catch(still);
}

function initScroll() {
  var queued = false;
  function run() {
    queued = false;
    var vh = window.innerHeight || 800, sy = window.scrollY || 0;
    var stk = $('#stk');
    if (stk) stk.classList.toggle('on', sy > 520);
    if (reduce) return;
    var hv = $('.hero-video');
    if (hv && sy < vh * 1.2) hv.style.transform = 'translate3d(0,' + (sy * 0.06).toFixed(1) + 'px,0) scale(1.06)';
    $$('[data-par]').forEach(function (el) {
      var f = parseFloat(el.getAttribute('data-par')) || 0, box = el.parentNode.getBoundingClientRect();
      if (box.bottom < -100 || box.top > vh + 100) return;
      var d = (box.top + box.height / 2 - vh / 2) * f, max = box.height * 0.055;
      el.style.transform = 'translate3d(0,' + Math.max(-max, Math.min(max, d)).toFixed(1) + 'px,0)';
    });
  }
  function onScroll() { if (!queued) { queued = true; requestAnimationFrame(run); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  run();
}

// ====== INICIO ======
$('#wa-float').href = 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent('Hola, quiero más información del pantalón bota campana.');
renderPacks();
initReveal();
initVideo();
initScroll();
