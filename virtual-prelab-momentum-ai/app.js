const $ = (id) => document.getElementById(id);
const qsa = (sel) => [...document.querySelectorAll(sel)];

const state = {
  activeSim: 'collision',
  running: false,
  t: 0,
  lastReadout: {},
  sim: {}
};

$('menuToggle').addEventListener('click', () => $('navLinks').classList.toggle('show'));

function miniAnimation() {
  const c = $('miniCanvas');
  const ctx = c.getContext('2d');
  let x1 = 45, x2 = 315, v1 = 1.25, v2 = -1.1;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#081421';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, 155); ctx.lineTo(340, 155); ctx.stroke();
    x1 += v1; x2 += v2;
    if (Math.abs(x1 - x2) < 52) { v1 *= -1; v2 *= -1; }
    if (x1 < 35 || x1 > 325) v1 *= -1;
    if (x2 < 35 || x2 > 325) v2 *= -1;
    ctx.fillStyle = '#55d6be'; circle(ctx, x1, 135, 26);
    ctx.fillStyle = '#6aa7ff'; circle(ctx, x2, 135, 26);
    ctx.fillStyle = '#ecf6ff'; ctx.font = 'bold 14px sans-serif';
    ctx.fillText('A', x1 - 5, 140); ctx.fillText('B', x2 - 5, 140);
    requestAnimationFrame(draw);
  }
  draw();
}
function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
miniAnimation();

const canvas = $('simCanvas');
const ctx = canvas.getContext('2d');
const readout = $('readout');

const inputs = qsa('input[type="range"], select');
inputs.forEach(input => input.addEventListener('input', () => {
  syncOutputs();
  resetSim(false);
}));

qsa('.tab').forEach(tab => tab.addEventListener('click', () => {
  qsa('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  state.activeSim = tab.dataset.sim;
  qsa('.sim-control').forEach(panel => panel.classList.toggle('hidden', panel.dataset.panel !== state.activeSim));
  resetSim(true);
}));

$('startBtn').addEventListener('click', () => { state.running = true; });
$('resetBtn').addEventListener('click', () => resetSim(true));

function val(id) { return parseFloat($(id).value); }
function syncOutputs() {
  const map = {
    m1: 'm1Out', m2: 'm2Out', v1: 'v1Out', v2: 'v2Out', e: 'eOut',
    dropMass: 'dropMassOut', height: 'heightOut', exM1: 'exM1Out', exM2: 'exM2Out',
    energy: 'energyOut', cartMass: 'cartMassOut', ballMass: 'ballMassOut', launchVel: 'launchVelOut'
  };
  Object.entries(map).forEach(([input, output]) => {
    if ($(input) && $(output)) $(output).textContent = input === 'e' ? Number($(input).value).toFixed(2) : $(input).value;
  });
}

function resetSim(shouldStop = true) {
  if (shouldStop) state.running = false;
  state.t = 0;
  const sim = state.activeSim;
  if (sim === 'collision') initCollision();
  if (sim === 'drop') initDrop();
  if (sim === 'explosion') initExplosion();
  if (sim === 'recoil') initRecoil();
  drawCurrent();
}

function initCollision() {
  state.sim = {
    x1: 180, x2: 690,
    r1: 34 + val('m1') * 2,
    r2: 34 + val('m2') * 2,
    v1: val('v1') * 18,
    v2: val('v2') * 18,
    collided: false
  };
}
function initDrop() {
  const h = val('height');
  const surface = $('surface').value;
  const props = { hard: { e: .72, contact: .035, label: 'keras/beton' }, medium: { e: .42, contact: .09, label: 'sedang/matras tipis' }, soft: { e: .16, contact: .18, label: 'lunak/busa tebal' } }[surface];
  state.sim = { y: 80, vy: 0, ground: 405, scale: 27, h, e: props.e, contact: props.contact, label: props.label, bounces: 0 };
}
function initExplosion() {
  state.sim = { x1: 450, x2: 450, v1: 0, v2: 0, exploded: false };
}
function initRecoil() {
  state.sim = { cartX: 410, ballX: 450, cartV: 0, ballV: 0, launched: false };
}

function drawCurrent() {
  if (state.activeSim === 'collision') drawCollision(0);
  if (state.activeSim === 'drop') drawDrop(0);
  if (state.activeSim === 'explosion') drawExplosion(0);
  if (state.activeSim === 'recoil') drawRecoil(0);
}

function loop() {
  const dt = 1 / 60;
  if (state.running) {
    state.t += dt;
    if (state.activeSim === 'collision') drawCollision(dt);
    if (state.activeSim === 'drop') drawDrop(dt);
    if (state.activeSim === 'explosion') drawExplosion(dt);
    if (state.activeSim === 'recoil') drawRecoil(dt);
  } else drawCurrent();
  requestAnimationFrame(loop);
}

function clear(title) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#132945'); grad.addColorStop(1, '#081421');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = 'bold 24px sans-serif'; ctx.fillText(title, 28, 42);
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(40, 390); ctx.lineTo(860, 390); ctx.stroke();
}
function arrow(x, y, dx, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y); ctx.stroke();
  const dir = Math.sign(dx) || 1;
  ctx.beginPath(); ctx.moveTo(x + dx, y); ctx.lineTo(x + dx - dir * 12, y - 8); ctx.lineTo(x + dx - dir * 12, y + 8); ctx.closePath(); ctx.fill();
}
function label(text, x, y) { ctx.fillStyle = '#ecf6ff'; ctx.font = '14px sans-serif'; ctx.fillText(text, x, y); }

function drawCollision(dt) {
  clear('Praktikum 1: Tumbukan 1 Dimensi');
  const s = state.sim, m1 = val('m1'), m2 = val('m2'), e = val('e');
  if (dt) {
    s.x1 += s.v1 * dt; s.x2 += s.v2 * dt;
    if (!s.collided && Math.abs(s.x2 - s.x1) <= s.r1 + s.r2) {
      const u1 = s.v1 / 18, u2 = s.v2 / 18;
      const v1p = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2);
      const v2p = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2);
      s.v1 = v1p * 18; s.v2 = v2p * 18; s.collided = true;
    }
    if (s.x1 < s.r1 || s.x1 > canvas.width - s.r1) s.v1 *= -0.8;
    if (s.x2 < s.r2 || s.x2 > canvas.width - s.r2) s.v2 *= -0.8;
  }
  ctx.fillStyle = '#55d6be'; circle(ctx, s.x1, 350, s.r1);
  ctx.fillStyle = '#6aa7ff'; circle(ctx, s.x2, 350, s.r2);
  label(`A: ${m1} kg`, s.x1 - 30, 350); label(`B: ${m2} kg`, s.x2 - 30, 350);
  arrow(s.x1, 300, Math.max(-80, Math.min(80, s.v1 * 1.5)), '#55d6be');
  arrow(s.x2, 260, Math.max(-80, Math.min(80, s.v2 * 1.5)), '#6aa7ff');
  const pBefore = m1 * val('v1') + m2 * val('v2');
  const pNow = m1 * (s.v1 / 18) + m2 * (s.v2 / 18);
  const keBefore = .5*m1*val('v1')**2 + .5*m2*val('v2')**2;
  const keNow = .5*m1*(s.v1/18)**2 + .5*m2*(s.v2/18)**2;
  state.lastReadout = { sim: 'Tumbukan', pBefore, pNow, keBefore, keNow, e };
  setReadout([
    ['Momentum awal sistem', `${pBefore.toFixed(2)} kg·m/s`],
    ['Momentum saat ini', `${pNow.toFixed(2)} kg·m/s`],
    ['Energi kinetik', `${keNow.toFixed(2)} J`]
  ]);
}

function drawDrop(dt) {
  clear('Praktikum 2: Benda Jatuh pada Permukaan Berbeda');
  const s = state.sim, m = val('dropMass'), g = 9.8;
  const startY = s.ground - s.h * s.scale;
  if (!state.running && state.t === 0) s.y = startY;
  if (dt) {
    s.vy += g * s.scale * dt;
    s.y += s.vy * dt;
    if (s.y > s.ground - 25) {
      const impactV = Math.abs(s.vy / s.scale);
      const deltaP = m * impactV * (1 + s.e);
      const avgF = deltaP / s.contact;
      s.y = s.ground - 25;
      s.vy = -s.vy * s.e;
      s.bounces++;
      if (Math.abs(s.vy) < 20) s.vy = 0;
      state.lastReadout = { sim: 'Benda jatuh', surface: s.label, impactV, avgF, contact: s.contact, e: s.e };
    }
  }
  ctx.fillStyle = s.label.includes('keras') ? '#8d99ae' : s.label.includes('sedang') ? '#ffd166' : '#55d6be';
  ctx.fillRect(80, s.ground, 740, 36);
  ctx.fillStyle = '#ff6b6b'; circle(ctx, 450, s.y, 25);
  label(`Permukaan: ${s.label}`, 90, s.ground + 24);
  label(`Ketinggian awal: ${s.h} m`, 90, 82);
  label('Semakin lunak permukaan, waktu kontak makin besar dan gaya rata-rata mengecil.', 90, 112);
  const v = Math.abs(s.vy / s.scale);
  const estF = state.lastReadout.avgF || 0;
  setReadout([
    ['Kecepatan saat ini', `${v.toFixed(2)} m/s`],
    ['Waktu kontak estimasi', `${s.contact.toFixed(3)} s`],
    ['Gaya rata-rata saat tumbukan', estF ? `${estF.toFixed(1)} N` : 'belum tumbukan']
  ]);
}

function drawExplosion(dt) {
  clear('Praktikum 3: Ledakan Dua Benda dan Kekekalan Momentum');
  const s = state.sim, m1 = val('exM1'), m2 = val('exM2'), energy = val('energy');
  if (state.running && !s.exploded) {
    s.v1 = -energy * 26 / m1;
    s.v2 = energy * 26 / m2;
    s.exploded = true;
  }
  if (dt && s.exploded) { s.x1 += s.v1 * dt; s.x2 += s.v2 * dt; }
  ctx.fillStyle = '#55d6be'; circle(ctx, s.x1, 350, 28 + m1 * 2);
  ctx.fillStyle = '#6aa7ff'; circle(ctx, s.x2, 350, 28 + m2 * 2);
  label(`A ${m1} kg`, s.x1 - 24, 350); label(`B ${m2} kg`, s.x2 - 24, 350);
  if (!s.exploded) label('Klik Mulai: benda diam lalu terpisah. Momentum total tetap sekitar nol.', 235, 220);
  const pTotal = m1 * (s.v1 / 26) + m2 * (s.v2 / 26);
  state.lastReadout = { sim: 'Ledakan', pTotal, v1: s.v1/26, v2: s.v2/26 };
  setReadout([
    ['Momentum total', `${pTotal.toFixed(2)} kg·m/s`],
    ['Kecepatan A', `${(s.v1/26).toFixed(2)} m/s`],
    ['Kecepatan B', `${(s.v2/26).toFixed(2)} m/s`]
  ]);
}

function drawRecoil(dt) {
  clear('Praktikum 4: Recoil / Tolakan karena Kekekalan Momentum');
  const s = state.sim, mc = val('cartMass'), mb = val('ballMass'), vbRel = val('launchVel');
  if (state.running && !s.launched) {
    s.ballV = vbRel * 22;
    s.cartV = -(mb * vbRel / mc) * 22;
    s.launched = true;
  }
  if (dt && s.launched) { s.cartX += s.cartV * dt; s.ballX += s.ballV * dt; }
  ctx.fillStyle = '#55d6be'; ctx.fillRect(s.cartX - 72, 330, 144, 48);
  ctx.fillStyle = '#0b1220'; circle(ctx, s.cartX - 40, 385, 12); circle(ctx, s.cartX + 40, 385, 12);
  ctx.fillStyle = '#ffd166'; circle(ctx, s.ballX, 335, 16 + mb * 2);
  label(`Kereta ${mc} kg`, s.cartX - 50, 322); label(`Bola ${mb} kg`, s.ballX - 25, 300);
  const pTotal = mc * (s.cartV/22) + mb * (s.ballV/22);
  state.lastReadout = { sim: 'Recoil', pTotal, cartV: s.cartV/22, ballV: s.ballV/22 };
  setReadout([
    ['Momentum total', `${pTotal.toFixed(2)} kg·m/s`],
    ['Kecepatan kereta', `${(s.cartV/22).toFixed(2)} m/s`],
    ['Kecepatan bola', `${(s.ballV/22).toFixed(2)} m/s`]
  ]);
}

function setReadout(items) {
  readout.innerHTML = items.map(([k, v]) => `<div><strong>${k}</strong>${v}</div>`).join('');
}

syncOutputs(); resetSim(true); loop();

const qa = [
  { keys: ['momentum', 'p =', 'p='], ans: 'Momentum adalah kuantitas gerak benda dan dirumuskan p = m × v. Karena vektor, arahnya mengikuti arah kecepatan benda. Satuan SI momentum adalah kg·m/s.' },
  { keys: ['impuls', 'delta p', 'perubahan momentum'], ans: 'Impuls adalah F × Δt dan sama dengan perubahan momentum. Jika gaya bekerja lebih lama, perubahan momentum yang sama dapat terjadi dengan gaya rata-rata yang lebih kecil.' },
  { keys: ['elastis', 'tidak elastis', 'tumbukan'], ans: 'Pada tumbukan elastis, momentum dan energi kinetik kekal. Pada tumbukan tidak elastis, momentum tetap kekal jika sistem tertutup, tetapi energi kinetik berkurang karena berubah menjadi bunyi, panas, atau deformasi.' },
  { keys: ['permukaan lunak', 'lunak', 'busa', 'matras'], ans: 'Permukaan lunak memperpanjang waktu kontak. Berdasarkan F rata-rata = Δp/Δt, jika Δt lebih besar maka gaya rata-rata menjadi lebih kecil. Itulah alasan matras atau busa dapat mengurangi risiko benturan.' },
  { keys: ['hukum kekekalan', 'kekekalan momentum'], ans: 'Hukum kekekalan momentum menyatakan bahwa momentum total sebelum interaksi sama dengan momentum total sesudah interaksi, selama resultan gaya luar pada sistem dapat diabaikan.' },
  { keys: ['koefisien restitusi', 'restitusi'], ans: 'Koefisien restitusi e menunjukkan tingkat kelentingan tumbukan. Nilai e = 1 mendekati elastis sempurna, sedangkan e = 0 menunjukkan tidak elastis sempurna.' },
  { keys: ['hasil simulasi', 'simulasi saat ini', 'readout'], ans: () => explainCurrentSim() },
  { keys: ['kuis', 'soal'], ans: 'Untuk kuis, fokuslah pada hubungan p = m × v, I = F × Δt = Δp, jenis tumbukan, dan alasan permukaan lunak mengurangi gaya benturan.' }
];

function explainCurrentSim() {
  const r = state.lastReadout;
  if (!r.sim) return 'Jalankan salah satu simulasi terlebih dahulu, lalu saya dapat membantu menafsirkan hasilnya.';
  if (r.sim === 'Tumbukan') return `Pada simulasi tumbukan, momentum awal sistem sekitar ${r.pBefore.toFixed(2)} kg·m/s dan momentum saat ini sekitar ${r.pNow.toFixed(2)} kg·m/s. Jika selisihnya kecil, simulasi menunjukkan prinsip kekekalan momentum. Nilai e = ${r.e} menentukan seberapa lenting tumbukan.`;
  if (r.sim === 'Benda jatuh') return `Pada simulasi benda jatuh, permukaan yang dipilih adalah ${r.surface}. Estimasi waktu kontak ${r.contact.toFixed(3)} s. Jika permukaan makin lunak, waktu kontak naik sehingga gaya rata-rata benturan turun.`;
  if (r.sim === 'Ledakan') return `Pada simulasi ledakan, dua benda bergerak berlawanan arah. Momentum total sekitar ${r.pTotal.toFixed(2)} kg·m/s, sehingga sistem mendekati keadaan momentum awal nol.`;
  if (r.sim === 'Recoil') return `Pada simulasi recoil, bola bergerak maju dan kereta terdorong mundur. Momentum total sekitar ${r.pTotal.toFixed(2)} kg·m/s, sesuai prinsip kekekalan momentum.`;
}

function botReply(text) {
  const lower = text.toLowerCase();
  const hit = qa.find(item => item.keys.some(k => lower.includes(k)));
  if (hit) return typeof hit.ans === 'function' ? hit.ans() : hit.ans;
  if (lower.includes('rumus')) return 'Rumus utama: p = m × v, I = F × Δt, dan I = Δp. Untuk tumbukan satu dimensi: m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′.';
  return 'Pertanyaanmu menarik. Coba kaitkan dengan massa, kecepatan, gaya, waktu kontak, atau jenis tumbukan. Saya bisa menjelaskan momentum, impuls, tumbukan elastis, permukaan lunak, dan hasil simulasi saat ini.';
}

function addMessage(text, who) {
  const div = document.createElement('div');
  div.className = `message ${who}`;
  div.textContent = text;
  $('chatBox').appendChild(div);
  $('chatBox').scrollTop = $('chatBox').scrollHeight;
}
$('chatForm').addEventListener('submit', e => {
  e.preventDefault();
  const text = $('chatInput').value.trim();
  if (!text) return;
  addMessage(text, 'user');
  $('chatInput').value = '';
  setTimeout(() => addMessage(botReply(text), 'bot'), 250);
});
qsa('.prompt').forEach(btn => btn.addEventListener('click', () => {
  $('chatInput').value = btn.textContent;
  $('chatForm').dispatchEvent(new Event('submit'));
}));

const quiz = [
  { type:'mc', q:'Momentum suatu benda dirumuskan sebagai ...', options:['p = m/v','p = m × v','p = F × t','p = 1/2 mv²'], answer:1, explain:'Momentum adalah hasil kali massa dan kecepatan.' },
  { type:'mc', q:'Satuan SI momentum adalah ...', options:['N','J','kg·m/s','m/s²'], answer:2, explain:'kg·m/s berasal dari kg dikali m/s.' },
  { type:'mc', q:'Jika massa benda diperbesar dua kali dan kecepatannya tetap, momentumnya ...', options:['tetap','menjadi setengah','menjadi dua kali','menjadi empat kali'], answer:2, explain:'p berbanding lurus dengan massa.' },
  { type:'mc', q:'Impuls sama dengan ...', options:['perubahan momentum','perubahan massa','energi potensial','usaha per satuan waktu'], answer:0, explain:'I = Δp.' },
  { type:'mc', q:'Pada sistem tertutup, besaran yang tetap dalam tumbukan adalah ...', options:['energi potensial','momentum total','suhu benda','warna benda'], answer:1, explain:'Momentum total kekal jika gaya luar diabaikan.' },
  { type:'mc', q:'Tumbukan elastis sempurna memiliki koefisien restitusi ...', options:['0','0,25','0,5','1'], answer:3, explain:'e = 1 untuk elastis sempurna.' },
  { type:'mc', q:'Pada tumbukan tidak elastis sempurna, kedua benda setelah tumbukan ...', options:['selalu diam','bergerak bersama','hilang massanya','berubah menjadi cahaya'], answer:1, explain:'Ciri tidak elastis sempurna adalah benda menyatu/bergerak bersama.' },
  { type:'mc', q:'Permukaan lunak mengurangi gaya benturan karena ...', options:['momentum selalu nol','waktu kontak lebih lama','massa benda hilang','gravitasi tidak bekerja'], answer:1, explain:'F rata-rata = Δp/Δt.' },
  { type:'mc', q:'Dua benda bermassa sama bergerak saling mendekat dengan laju sama. Momentum total sistemnya ...', options:['nol','paling besar','selalu positif','selalu negatif'], answer:0, explain:'Momentum berlawanan arah saling meniadakan.' },
  { type:'mc', q:'Jika gaya rata-rata 20 N bekerja selama 0,5 s, impulsnya adalah ...', options:['10 N·s','20 N·s','40 N·s','0,025 N·s'], answer:0, explain:'I = F × Δt = 20 × 0,5 = 10 N·s.' },
  { type:'short', q:'Jelaskan dengan singkat mengapa momentum termasuk besaran vektor.', keywords:['arah','kecepatan','vektor'] },
  { type:'short', q:'Apa perbedaan utama tumbukan elastis dan tidak elastis?', keywords:['energi kinetik','momentum','kekal'] },
  { type:'short', q:'Mengapa helm, matras, atau airbag dapat mengurangi risiko cedera saat benturan?', keywords:['waktu kontak','gaya','impuls','delta p'] },
  { type:'short', q:'Berikan satu contoh penerapan hukum kekekalan momentum dalam kehidupan sehari-hari.', keywords:['recoil','roket','tumbukan','ledakan','perahu','senapan'] },
  { type:'short', q:'Sebuah benda 2 kg bergerak 3 m/s. Hitung momentumnya dan tuliskan satuannya.', keywords:['6','kg','m/s'] }
];

function renderQuiz() {
  const form = $('quizForm');
  form.innerHTML = quiz.map((item, i) => {
    if (item.type === 'mc') {
      return `<div class="question" data-i="${i}"><p>${i+1}. ${item.q}</p><div class="options">${item.options.map((op, j) => `<label><input type="radio" name="q${i}" value="${j}"> ${op}</label>`).join('')}</div><div class="feedback" id="fb${i}"></div></div>`;
    }
    return `<div class="question" data-i="${i}"><p>${i+1}. ${item.q}</p><textarea name="q${i}" placeholder="Tulis jawaban singkatmu..."></textarea><div class="feedback" id="fb${i}"></div></div>`;
  }).join('');
}
renderQuiz();

$('submitQuiz').addEventListener('click', () => {
  let mcScore = 0, shortScore = 0, shortMax = 5;
  quiz.forEach((item, i) => {
    const fb = $(`fb${i}`);
    if (item.type === 'mc') {
      const chosen = document.querySelector(`input[name="q${i}"]:checked`);
      if (chosen && Number(chosen.value) === item.answer) { mcScore++; fb.innerHTML = `<p class="correct">Benar. ${item.explain}</p>`; }
      else fb.innerHTML = `<p class="wrong">Belum tepat. Jawaban benar: ${item.options[item.answer]}. ${item.explain}</p>`;
    } else {
      const ans = (document.querySelector(`textarea[name="q${i}"]`).value || '').toLowerCase();
      const hits = item.keywords.filter(k => ans.includes(k.toLowerCase())).length;
      if (hits >= Math.min(2, item.keywords.length)) { shortScore++; fb.innerHTML = '<p class="correct">Jawaban memuat konsep kunci.</p>'; }
      else fb.innerHTML = `<p class="wrong">Jawaban perlu dilengkapi. Kata kunci yang diharapkan antara lain: ${item.keywords.join(', ')}.</p>`;
    }
  });
  const total = mcScore + shortScore;
  const percent = Math.round((total / 15) * 100);
  $('quizResult').classList.remove('hidden');
  $('quizResult').innerHTML = `<h3>Hasil Kuis</h3><p>Skor pilihan ganda: <strong>${mcScore}/10</strong></p><p>Skor uraian singkat berbasis kata kunci: <strong>${shortScore}/${shortMax}</strong></p><p>Nilai akhir: <strong>${percent}</strong></p><p>${percent >= 80 ? 'Sangat baik. Kamu sudah memahami konsep momentum dengan kuat.' : percent >= 60 ? 'Cukup baik. Pelajari kembali impuls, tumbukan, dan kekekalan momentum.' : 'Perlu penguatan. Baca ulang materi dan coba simulasi dengan beberapa variasi variabel.'}</p>`;
  $('quizResult').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('resetQuiz').addEventListener('click', () => { renderQuiz(); $('quizResult').classList.add('hidden'); });
