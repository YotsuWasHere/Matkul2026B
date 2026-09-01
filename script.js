const THEME_KEY = '2026B_THEME';
const ACCENT_KEY = '2026B_ACCENT';
const ACCENTS = {
  violet: { name:'Violet', accent:'#655cf6', accent2:'#8a74ff', rgb:'101 92 246' },
  blue: { name:'Ocean Blue', accent:'#3b82f6', accent2:'#60a5fa', rgb:'59 130 246' },
  cyan: { name:'Cyan', accent:'#06b6d4', accent2:'#22d3ee', rgb:'6 182 212' },
  emerald: { name:'Emerald', accent:'#10b981', accent2:'#34d399', rgb:'16 185 129' },
  rose: { name:'Rose', accent:'#f43f5e', accent2:'#fb7185', rgb:'244 63 94' },
  amber: { name:'Amber', accent:'#f59e0b', accent2:'#fbbf24', rgb:'245 158 11' }
};
const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat'];
const MINUTES_START = 7 * 60;
const MINUTES_END = 21 * 60;
const CLASS_PJ = 'Tisha Farica Tsaqif';
const CATEGORIES = { MKWK: new Set(['pancasila-067','pancasila-068','literasi-050','literasi-051']) };
const HALF_HOUR_PX = 34;

const PJS = [
  { name: "Husna Nafi'ah Zulfa", nim: '26112224076', code: '076', course: 'Pancasila' },
  { name: 'David Antoni', nim: '26112224044', code: '044', course: 'Etika Bisnis & Profesi' },
  { name: 'Nova Risqy Fatur Fadillah', nim: '26112224057', code: '057', course: 'Hukum Bisnis' },
  { name: 'Zhevira Threevia Nur Wardiny', nim: '26112224104', code: '104', course: 'Literasi Digital' },
  { name: 'Atha Bagus Arifianto', nim: '26112224084', code: '084', course: 'Akuntansi Pengantar' },
  { name: 'Adelia Putri Maharani', nim: '26112224051', code: '051', course: 'Hukum Pajak' },
  { name: 'Fairus Eva Ghanesa', nim: '26112224007', code: '007', course: 'Sistem Informasi Akuntansi' },
  { name: 'Ayank Naura Tita', nim: '26112224077', code: '077', course: 'Statistik' }
];

const seedCourses = [
  { id:'pancasila-067', name:'Pancasila', code:'067', day:0, start:'08:40', end:'10:20', room:'', mode:'Virtual', lecturer:'', status:'Tetap' },
  { id:'pancasila-068', name:'Pancasila', code:'068', day:0, start:'08:40', end:'10:20', room:'', mode:'Virtual', lecturer:'', status:'Tetap' },
  { id:'literasi-050', name:'Literasi Digital', code:'050', day:4, start:'07:00', end:'08:40', room:'', mode:'Virtual', lecturer:'', status:'Tetap' },
  { id:'literasi-051', name:'Literasi Digital', code:'051', day:2, start:'07:00', end:'08:40', room:'', mode:'Virtual', lecturer:'', status:'Tetap' },
  { id:'etika-bisnis-profesi', name:'Etika Bisnis & Profesi', code:'', day:1, start:'09:30', end:'12:00', room:'MG1.02.07', mode:'Tatap Muka', lecturer:'', status:'Tetap' },
  { id:'hukum-bisnis', name:'Hukum Bisnis', code:'', day:1, start:'13:00', end:'15:30', room:'', mode:'Virtual', lecturer:'', status:'Tetap' },
  { id:'akuntansi-pengantar', name:'Akuntansi Pengantar', code:'', day:2, start:'13:00', end:'15:30', room:'MG1.02.07', mode:'Tatap Muka', lecturer:'', status:'Tetap' },
  { id:'hukum-pajak', name:'Hukum Pajak', code:'', day:3, start:'13:00', end:'15:30', room:'MG1.04.03', mode:'Tatap Muka', lecturer:'', status:'Tetap' },
  { id:'sistem-informasi-akuntansi', name:'Sistem Informasi Akuntansi', code:'', day:3, start:'15:30', end:'18:00', room:'MG1.02.07', mode:'Tatap Muka', lecturer:'', status:'Tetap' },
  { id:'statistik', name:'Statistik', code:'', day:4, start:'18:00', end:'20:30', room:'MG1.02.07', mode:'Tatap Muka', lecturer:'', status:'Tetap' }
];

let state = { courses: [], changes: [] };
let currentWeek = startOfWeek(new Date());
let loggedInAs = null;
let editorCourseId = null;
let editorMode = 'course';
let supabaseClient = null;
let activeCategory = 'MKWU';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
function pad2(n){ return String(n).padStart(2,'0'); }
function fmtDateISO(date){ return `${date.getFullYear()}-${pad2(date.getMonth()+1)}-${pad2(date.getDate())}`; }
function parseISO(s){ const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function startOfWeek(date){ const d=new Date(date.getFullYear(),date.getMonth(),date.getDate()); const offset=(d.getDay()+6)%7; d.setDate(d.getDate()-offset); return d; }
function addDays(date,n){ const d=new Date(date); d.setDate(d.getDate()+n); return d; }
function weekKey(date){ return fmtDateISO(startOfWeek(date)); }
function formatDayDate(date){ return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short'}).format(date); }
function formatRange(weekStart){ const weekEnd=addDays(weekStart,4); const fmt=new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long'}); return `${fmt.format(weekStart)} – ${fmt.format(weekEnd)}`; }
function formatFullDate(date){ return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'long',year:'numeric'}).format(date); }
function timeToMin(t){ const [h,m]=String(t).slice(0,5).split(':').map(Number); return h*60+m; }
function formatTimeRange(start,end){ return `${String(start).slice(0,5)}–${String(end).slice(0,5)}`; }
function getDateForCourse(course, weekStart){ return addDays(weekStart, course.day); }
function weekdayOf(date){ return (date.getDay()+6)%7; }
function clone(v){ return JSON.parse(JSON.stringify(v)); }

function setConnectionStatus(text, isError=false){
  const el=$('#dataConnectionStatus');
  if(el){ el.textContent=text; el.style.color=isError?'var(--danger)':''; }
}

function normalizeSupabaseUrl(value){
  const raw=String(value??'').trim();
  if(!raw) throw new Error('SUPABASE_URL belum diisi di config.js.');
  if(!/^https?:\/\//i.test(raw)) throw new Error('SUPABASE_URL harus diawali http:// atau https://.');

  let u;
  try{ u=new URL(raw); }
  catch{ throw new Error('SUPABASE_URL tidak valid. Salin Project URL dari Supabase Dashboard → Settings → API.'); }

  // URL Dashboard: https://supabase.com/dashboard/project/<ref>
  const dashboardMatch=u.hostname==='supabase.com' ? u.pathname.match(/^\/dashboard\/project\/([a-z0-9]+)(?:\/|$)/i) : null;
  if(dashboardMatch) return `https://${dashboardMatch[1]}.supabase.co`;

  // Untuk project URL, path seperti /rest/v1 atau path lain dibuang.
  // Supabase JS membutuhkan origin project, bukan endpoint REST.
  return u.origin;
}

function initSupabase(){
  const cfg=window.APP_CONFIG || {};
  if(!cfg.SUPABASE_ENABLED) throw new Error('Supabase masih dinonaktifkan di config.js.');
  if(!window.supabase?.createClient) throw new Error('Supabase JS gagal dimuat. Periksa koneksi internet.');
  if(!cfg.SUPABASE_URL || String(cfg.SUPABASE_URL).includes('PASTE_SUPABASE')) throw new Error('SUPABASE_URL belum diisi di config.js.');
  if(!cfg.SUPABASE_ANON_KEY || String(cfg.SUPABASE_ANON_KEY).includes('PASTE_SUPABASE')) throw new Error('SUPABASE_ANON_KEY belum diisi di config.js.');

  const normalizedUrl=normalizeSupabaseUrl(cfg.SUPABASE_URL);
  supabaseClient=window.supabase.createClient(normalizedUrl,String(cfg.SUPABASE_ANON_KEY).trim(),{auth:{persistSession:false,autoRefreshToken:false}});
}

function courseFromRow(r){
  return { id:r.id, name:r.name, code:r.code||'', day:Number(r.original_day), start:String(r.original_start).slice(0,5), end:String(r.original_end).slice(0,5), room:r.room||'', mode:r.mode||'Virtual', lecturer:r.lecturer||'', status:r.status||'Tetap' };
}
function changeFromRow(r){
  return { id:r.id, course_id:r.course_id, week_key:r.week_key, original_date:r.original_date||'', new_date:r.new_date||'', new_start:r.new_start?String(r.new_start).slice(0,5):'', new_end:r.new_end?String(r.new_end).slice(0,5):'', status:r.status||'Dipindahkan', mode:r.mode||'Virtual', room:r.room||'', note:r.note||'', edited_by:r.edited_by_name||r.edited_by||'—', updated_at:r.updated_at||new Date().toISOString() };
}

async function loadRemoteState(){
  setConnectionStatus('Mengambil data…');
  const [{data:courses,error:cErr},{data:changes,error:mErr}]=await Promise.all([
    supabaseClient.from('courses').select('*').order('original_day').order('original_start'),
    supabaseClient.from('meeting_changes_view').select('*').order('updated_at',{ascending:false})
  ]);
  if(cErr) throw cErr;
  if(mErr) throw mErr;
  const cleanCourses=(courses||[]).map(courseFromRow);
  const cleanChanges=(changes||[]).map(changeFromRow);
  state={courses:normalizeCourseRows(cleanCourses),changes:cleanChanges};
  if(!state.courses.length){
    state={courses:clone(seedCourses),changes:[]};
    throw new Error('Tabel courses kosong. Jalankan schema.sql agar data awal 10 kelas dibuat.');
  }
  setConnectionStatus('● Online');
}

async function refreshRemoteState(silent=false){
  try{ await loadRemoteState(); render(); if(!silent) showToast('Data terbaru sudah dimuat.','success'); }
  catch(e){ console.error(e); setConnectionStatus('Database gagal dibaca',true); if(!silent) showToast(`Gagal memuat database: ${e.message}`,'error'); }
}

function subscribeRealtime(){
  const channel=supabaseClient.channel('2026b-live')
    .on('postgres_changes',{event:'*',schema:'public',table:'courses'},()=>refreshRemoteState(true))
    .on('postgres_changes',{event:'*',schema:'public',table:'meeting_changes'},()=>refreshRemoteState(true))
    .subscribe((status)=>{ if(status==='SUBSCRIBED') setConnectionStatus('● Live / Realtime'); });
  return channel;
}

function getChange(courseId,wkKey){ return state.changes.find(c=>c.course_id===courseId && c.week_key===wkKey); }
function getEffective(course,wkStart){
  const wk=weekKey(wkStart); const change=getChange(course.id,wk);
  if(!change) return {course,moved:false,date:getDateForCourse(course,wkStart),start:course.start,end:course.end,mode:course.mode,room:course.room,status:course.status,change:null};
  const date=change.new_date?parseISO(change.new_date):getDateForCourse(course,wkStart);
  return {course,moved:change.status==='Dipindahkan',date,start:change.new_start||course.start,end:change.new_end||course.end,mode:change.mode||course.mode,room:change.room??course.room,status:change.status||'Dipindahkan',change};
}


function isMKWKCourse(course){
  const id=String(course?.id||'').toLowerCase();
  const name=String(course?.name||'').trim().toLowerCase();
  const code=String(course?.code||'').trim();
  return CATEGORIES.MKWK.has(course?.id) ||
    (name==='pancasila' && ['067','068'].includes(code)) ||
    (name==='literasi digital' && ['050','051'].includes(code)) ||
    /^(pancasila|literasi[-_ ]?digital)[-_ ]?(067|068|050|051)$/i.test(id);
}
function isCourseInCategory(course, category){
  return category === 'MKWK' ? isMKWKCourse(course) : !isMKWKCourse(course);
}
function visibleCourses(){
  return state.courses.filter(c=>isCourseInCategory(c, activeCategory));
}
function findPjName(change){
  return change?.edited_by || change?.edited_by_name || '—';
}
function describeChangeTiming(course, change){
  const originalDate = change?.original_date ? parseISO(change.original_date) : getDateForCourse(course,currentWeek);
  const newDate = change?.new_date ? parseISO(change.new_date) : originalDate;
  const daysBetweenWeeks = (startOfWeek(newDate)-startOfWeek(originalDate))/86400000;
  if(daysBetweenWeeks > 0){
    return `Perubahan - Minggu depan, ${new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(newDate)}`;
  }
  return `Perubahan - ${new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(newDate)}`;
}
function getCourseNotesStore(){
  try{
    const raw=localStorage.getItem(COURSE_NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch{return {};}
}
function saveCourseNotesStore(store){
  localStorage.setItem(COURSE_NOTES_KEY,JSON.stringify(store));
}
function getCourseMeta(courseId){
  const store=getCourseNotesStore();
  const base={hasTask:false,note:'',deadline:'',sidiaUrl:'',taskUrl:''};
  return {...base,...(store?.[courseId]||{})};
}
function setCourseMeta(courseId,patch){
  const store=getCourseNotesStore();
  store[courseId]={...getCourseMeta(courseId),...patch};
  saveCourseNotesStore(store);
  return store[courseId];
}
function formatDeadline(value){
  if(!value) return '';
  const d=parseISO(value);
  if(Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(d);
}
function safeWeekday(dateValue, fallbackDay){
  if(dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) return weekdayOf(dateValue);
  return Number.isInteger(fallbackDay) ? fallbackDay : -1;
}
function normalizeCourseCode(value){
  const raw=String(value??'').trim();
  const digits=raw.replace(/\D/g,'');
  return digits ? digits.padStart(3,'0').slice(-3) : raw;
}
function canonicalMkwkSeedByCode(code){
  const c=normalizeCourseCode(code);
  const map={
    '067':{id:'pancasila-067',name:'Pancasila',code:'067',day:0,start:'08:40',end:'10:20',room:'',mode:'Virtual',lecturer:'',status:'Tetap'},
    '068':{id:'pancasila-068',name:'Pancasila',code:'068',day:0,start:'08:40',end:'10:20',room:'',mode:'Virtual',lecturer:'',status:'Tetap'},
    '050':{id:'literasi-050',name:'Literasi Digital',code:'050',day:4,start:'07:00',end:'08:40',room:'',mode:'Virtual',lecturer:'',status:'Tetap'},
    '051':{id:'literasi-051',name:'Literasi Digital',code:'051',day:2,start:'07:00',end:'08:40',room:'',mode:'Virtual',lecturer:'',status:'Tetap'}
  };
  return map[c] ? clone(map[c]) : null;
}
function normalizeCourseRows(courses){
  const list=Array.isArray(courses)?courses.map(clone):[];
  // MKWK uses the exact same two-record model as Pancasila: each code is its own
  // course, with a canonical original day/time. Weekly overrides are then applied
  // independently through meeting_changes. This prevents a stale/malformed remote
  // day from making one of the paired codes disappear from the calendar.
  for(const code of ['067','068','050','051']){
    const canonical=canonicalMkwkSeedByCode(code);
    const idx=list.findIndex(c=>normalizeCourseCode(c?.code)===code &&
      String(c?.name||'').trim().toLowerCase()===String(canonical?.name||'').trim().toLowerCase());
    if(idx<0){
      if(canonical) list.push(canonical);
      continue;
    }
    if(canonical){
      const current=list[idx];
      // Preserve database identity/details, but normalize the base schedule exactly.
      // Any weekly move remains in meeting_changes and is not overwritten here.
      list[idx]={...current,
        id: current.id || canonical.id,
        name: current.name || canonical.name,
        code: code,
        day: canonical.day,
        start: canonical.start,
        end: canonical.end,
        room: current.room ?? canonical.room,
        mode: current.mode || canonical.mode,
        lecturer: current.lecturer || canonical.lecturer,
        status: current.status || canonical.status
      };
    }
  }
  return list;
}
function groupEffectiveCourses(courses){
  const groups=new Map();
  for(const course of courses){
    const e=getEffective(course,currentWeek);
    const day=safeWeekday(e.date,course.day);
    if(day<0 || day>4) continue;
    // Same rule as Pancasila: only merge when the effective schedule is truly identical.
    const key=[
      String(course.name||'').trim().toLowerCase(),
      day,
      String(e.start||'').slice(0,5),
      String(e.end||'').slice(0,5),
      String(e.mode||''),
      String(e.room||'')
    ].join('|');
    if(!groups.has(key)) groups.set(key,{day,start:e.start,end:e.end,items:[]});
    groups.get(key).items.push({course,e});
  }
  return [...groups.values()];
}
function render(){
  $('#weekLabel').textContent=formatRange(currentWeek); $('#changesWeekHint').textContent=formatRange(currentWeek);
  const today=new Date();
  const todayKey=fmtDateISO(today);
  for(let i=0;i<5;i++){
    const date=addDays(currentWeek,i);
    $('#date-'+(i+1)).textContent=formatDayDate(date);
    const isToday=fmtDateISO(date)===todayKey;
    const head=document.querySelector(`.day-head[data-day="${i+1}"]`);
    const col=document.querySelector(`.day-column[data-day-col="${i+1}"]`);
    head?.classList.toggle('today',isToday);
    col?.classList.toggle('today',isToday);
  }
  renderTimeline(); renderHistory(); renderAdmin();
  $('#courseCount').textContent=state.courses.length;
  $('#changeCount').textContent=state.changes.filter(c=>c.week_key===weekKey(currentWeek)).length;
  $('#mkwuCount').textContent=`${new Set(state.courses.filter(c=>isCourseInCategory(c,'MKWU')).map(c=>c.name)).size} mata kuliah`;
  $('#mkwkCount').textContent=`${new Set(state.courses.filter(c=>isCourseInCategory(c,'MKWK')).map(c=>c.name)).size} mata kuliah`;
  $('#tabMKWU').classList.toggle('active',activeCategory==='MKWU');
  $('#tabMKWK').classList.toggle('active',activeCategory==='MKWK');
}
function renderTimeline(){
  const timeAxis=$('#timeAxis'); timeAxis.innerHTML='';
  for(let min=MINUTES_START;min<MINUTES_END;min+=30){
    const label=document.createElement('div'); label.className='time-slot-label';
    label.textContent=`${pad2(Math.floor(min/60))}.${pad2(min%60)}`; timeAxis.appendChild(label);
  }
  $$('.day-column').forEach(col=>col.innerHTML='');
  for(const group of groupEffectiveCourses(visibleCourses())){
    const col=document.querySelector(`[data-day-col="${group.day+1}"]`); if(!col) continue;
    const moved=group.items.some(x=>x.e.moved);
    const block=document.createElement('div'); block.className='course-block'+(moved?' moved':'');
    const top=(timeToMin(group.start)-MINUTES_START)*(HALF_HOUR_PX/30);
    const h=Math.max(52,(timeToMin(group.end)-timeToMin(group.start))*(HALF_HOUR_PX/30));
    block.style.top=`${top}px`; block.style.height=`${h}px`; block.innerHTML=courseGroupHtml(group); col.appendChild(block);
    group.items.forEach(({course})=>{
      block.dataset.courseId=course.id;
    });
    block.addEventListener('click',(ev)=>{
      const action=ev.target.closest('[data-course-open]');
      const id=action?.dataset.courseOpen || group.items[0].course.id;
      openCourseDetails(id);
    });
    block.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',(e)=>e.stopPropagation()));
  }
  for(const col of $$('.day-column')) if(!col.children.length){
    const empty=document.createElement('div'); empty.className='empty-day'; empty.textContent='Tidak ada kelas'; col.appendChild(empty);
  }
}
function courseGroupHtml(group){
  const first=group.items[0];
  const codes=group.items.map(({course})=>course.code).filter(Boolean);
  const code=codes.length ? `<div class="course-group-code">KODE ${codes.map(escapeHtml).join('<span class="amp">&amp;</span>')}</div>` : '';
  const room=first.e.room?`<span>📍 ${escapeHtml(first.e.room)}</span>`:'';
  const lecturers=[...new Set(group.items.map(({course})=>course.lecturer).filter(Boolean))];
  const lecturerText=lecturers.length ? lecturers.join(', ') : 'Dosen Pengampu —';
  const lecturer=`<span>👨‍🏫 ${escapeHtml(lecturerText)}</span>`;
  const metaList=group.items.map(({course})=>getCourseMeta(course.id));
  const hasTask=metaList.some(m=>m.hasTask);
  const note=metaList.some(m=>m.note) ? '<span class="course-note-indicator">📌</span>' : '';
  const status=group.items.some(x=>x.e.moved) ? '<span class="course-badge moved-badge">🔄 Dipindahkan</span>' : '<span class="course-badge">✅ Tetap</span>';
  const mode=first.e.mode==='Virtual' ? '<span class="course-badge">💻 Virtual</span>' : '<span class="course-badge">🏫 Tatap Muka</span>';
  const task=hasTask ? '<span class="course-badge task-badge">📝 Ada Tugas</span>' : '';
  return `<div data-course-open="${escapeAttr(first.course.id)}"><div class="course-name">${escapeHtml(first.course.name)}</div>${code}<div class="course-time">${formatTimeRange(group.start,group.end)}</div><div class="course-meta">${room}${room?' · ':''}${lecturer}</div><div class="course-badges">${status}${mode}${task}</div><div class="course-click-hint">Klik untuk detail${note}</div></div>`;
}

function renderHistory(){
  const list=$('#changeHistoryList');
  const changes=state.changes
    .filter(c=>c.week_key===weekKey(currentWeek))
    .filter(c=>state.courses.some(course=>course.id===c.course_id && isCourseInCategory(course,activeCategory)))
    .sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
  if(!changes.length){
    list.innerHTML=`<div class="empty-history">Belum ada perubahan untuk ${activeCategory} pada minggu ${escapeHtml(formatRange(currentWeek))}. Jadwal original tetap digunakan.</div>`;
    return;
  }
  list.innerHTML=changes.map(c=>{
    const course=state.courses.find(x=>x.id===c.course_id); if(!course) return '';
    const originalDate=c.original_date?parseISO(c.original_date):getDateForCourse(course,currentWeek);
    const original=`${new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(originalDate)} ${course.start}–${course.end}`;
    const date=c.new_date?parseISO(c.new_date):originalDate;
    const current=`${new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(date)} ${c.new_start||course.start}–${c.new_end||course.end}`;
    const timing=describeChangeTiming(course,c);
    return `<article class="history-card">
      <div class="history-top"><div><div class="history-title">${escapeHtml(course.name)}${course.code?` · ${escapeHtml(course.code)}`:''}</div></div><span class="history-badge">${escapeHtml(timing)}</span></div>
      <div class="history-grid"><div class="history-box"><small>Original</small><strong>${escapeHtml(original)}</strong></div><div class="history-arrow">→</div><div class="history-box"><small>Perubahan</small><strong>${escapeHtml(current)}</strong></div></div>
      <div class="history-footer"><span>📅 Berlaku: ${escapeHtml(formatRange(currentWeek))}</span><span>${c.mode==='Virtual'?'💻 Virtual':'🏫 Tatap Muka'}</span>${c.room?`<span>📍 ${escapeHtml(c.room)}</span>`:''}<span>👨‍🏫 Dosen: ${escapeHtml(course.lecturer || 'Dosen Pengampu —')}</span></div>
      ${c.note?`<div class="history-note">📝 ${escapeHtml(c.note)}</div>`:''}
    </article>`;
  }).join('');
}

function renderAdmin(){
  const section=$('#adminSection'); if(!loggedInAs){ section.classList.add('hidden'); return; } section.classList.remove('hidden');
  $('#adminGrid').innerHTML=visibleCourses().map(c=>`<article class="admin-course-card"><div class="admin-course-top"><div><div class="admin-course-name">${escapeHtml(c.name)}${c.code?` — ${escapeHtml(c.code)}`:''}</div><div class="admin-course-sub">${DAYS[c.day]} · ${c.start}–${c.end} · ${c.mode}</div></div><span class="role-badge">Admin</span></div><div class="admin-actions"><button class="mini-button" data-action="edit-course" data-course-id="${escapeAttr(c.id)}">✏️ Edit Jadwal</button><button class="mini-button" data-action="edit-meeting" data-course-id="${escapeAttr(c.id)}">🔄 Edit Pertemuan</button></div></article>`).join('');
}
function openModal(id){ const el=document.getElementById(id); if(el) el.classList.remove('hidden'); }
function closeModal(id){ const el=document.getElementById(id); if(el) el.classList.add('hidden'); }
function openEditor(courseId,mode){ if(!loggedInAs){showToast('Login PJ diperlukan.','error');return;} const course=state.courses.find(c=>c.id===courseId); if(!course) return; editorCourseId=courseId; setEditorMode(mode); $('#editorKicker').textContent=mode==='course'?'BASE / ORIGINAL SCHEDULE':'WEEKLY MEETING OVERRIDE'; $('#editorTitle').textContent=`${course.name}${course.code?` — ${course.code}`:''}`; populateCourseForm(course); populateMeetingForm(course); openModal('editorModal'); }
function populateCourseForm(c){ $('#courseIdField').value=c.id; $('#courseName').value=c.name; $('#courseCode').value=c.code; $('#courseDay').value=String(c.day); $('#courseStart').value=c.start; $('#courseEnd').value=c.end; $('#courseRoom').value=c.room; $('#courseMode').value=c.mode; $('#courseLecturer').value=c.lecturer; $('#courseStatus').value=c.status; }
function populateMeetingForm(c){ const wk=weekKey(currentWeek),change=getChange(c.id,wk),originalDate=getDateForCourse(c,currentWeek); $('#meetingCourseId').value=c.id; $('#meetingWeek').value=wk; $('#meetingWeekCaption').textContent=`Minggu aktif: ${formatRange(currentWeek)}`; $('#meetingStatus').value=change?.status||'Tetap'; $('#meetingDate').value=change?.new_date||fmtDateISO(originalDate); $('#meetingStart').value=change?.new_start||c.start; $('#meetingEnd').value=change?.new_end||c.end; $('#meetingMode').value=change?.mode||c.mode; $('#meetingRoom').value=change?.room??c.room; $('#meetingNote').value=change?.note||''; $('#deleteMeetingButton').disabled=!change; $('#deleteMeetingButton').style.opacity=change?'1':'.5'; updateOverridePreview(c,change); }
function updateOverridePreview(c,change){ const original=`${DAYS[c.day]} ${c.start}–${c.end}`; if(!change){ $('#overridePreview').innerHTML=`<strong>Belum ada override untuk minggu ini.</strong><br>Jika Anda menyimpan perubahan, data hanya tersimpan pada <strong>${escapeHtml(formatRange(currentWeek))}</strong>.`; return; } const date=change.new_date?parseISO(change.new_date):getDateForCourse(c,currentWeek); $('#overridePreview').innerHTML=`<strong>Override aktif.</strong><br>Original: ${escapeHtml(original)} → Perubahan: ${escapeHtml(new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(date)+' '+(change.new_start||c.start)+'–'+(change.new_end||c.end))}<br>Berlaku hanya untuk minggu <strong>${escapeHtml(formatRange(currentWeek))}</strong>.`; }
function setEditorMode(mode){ editorMode=mode; $('#tabCourse').classList.toggle('active',mode==='course'); $('#tabMeeting').classList.toggle('active',mode==='meeting'); $('#courseForm').classList.toggle('hidden',mode!=='course'); $('#meetingForm').classList.toggle('hidden',mode!=='meeting'); }

async function doLogin(e){
  e.preventDefault(); const name=$('#loginPJ').value; const code=$('#loginCode').value.trim();
  if(!name||!/^\d{3}$/.test(code)){showToast('Pilih PJ dan masukkan 3 digit kode NIM.','error');return;}
  try{
    const {data,error}=await supabaseClient.rpc('verify_pj',{p_name:name,p_code:code});
    if(error) throw error;
    if(!data?.valid){showToast('Nama PJ atau 3 digit NIM tidak cocok.','error');return;}
    loggedInAs={name:data.name,code};
    $('#adminNameLabel').textContent=loggedInAs.name; $('#adminIdentity').classList.remove('hidden'); $('#loginButton').classList.add('hidden'); $('#logoutButton').classList.remove('hidden');
    closeModal('loginModal'); render(); showToast(`Login berhasil sebagai ${data.name}.`,'success');
  }catch(err){console.error(err);showToast(`Login gagal: ${err.message}`,'error');}
}
function doLogout(){ loggedInAs=null; $('#adminIdentity').classList.add('hidden'); $('#loginButton').classList.remove('hidden'); $('#logoutButton').classList.add('hidden'); closeModal('editorModal'); render(); showToast('Anda telah logout.','success'); }

async function saveCourse(e){
  e.preventDefault(); if(!loggedInAs) return;
  const c=state.courses.find(x=>x.id===$('#courseIdField').value); if(!c) return;
  const payload={p_name:loggedInAs.name,p_code:loggedInAs.code,p_course_id:c.id,p_course_name:$('#courseName').value.trim(),p_code_value:$('#courseCode').value.trim(),p_day:Number($('#courseDay').value),p_start:$('#courseStart').value,p_end:$('#courseEnd').value,p_room:$('#courseRoom').value.trim(),p_mode:$('#courseMode').value,p_lecturer:$('#courseLecturer').value.trim(),p_status:$('#courseStatus').value};
  try{ const {error}=await supabaseClient.rpc('update_course_by_pj',payload); if(error) throw error; closeModal('editorModal'); await refreshRemoteState(true); showToast('Jadwal original berhasil disimpan ke Supabase.','success'); }
  catch(err){ console.error(err); showToast(`Gagal menyimpan jadwal: ${err.message}`,'error'); }
}
async function saveMeeting(e){
  e.preventDefault(); if(!loggedInAs) return;
  const courseId=$('#meetingCourseId').value; const c=state.courses.find(x=>x.id===courseId); if(!c) return; const wk=$('#meetingWeek').value;
  if(wk!==weekKey(currentWeek)){showToast('Form ini dikunci untuk minggu yang sedang dibuka.','error');return;}
  const existing=getChange(courseId,wk); const payload={p_name:loggedInAs.name,p_code:loggedInAs.code,p_course_id:courseId,p_week_key:wk,p_original_date:fmtDateISO(getDateForCourse(c,currentWeek)),p_new_date:$('#meetingDate').value,p_new_start:$('#meetingStart').value,p_new_end:$('#meetingEnd').value,p_status:$('#meetingStatus').value,p_mode:$('#meetingMode').value,p_room:$('#meetingRoom').value.trim(),p_note:$('#meetingNote').value.trim(),p_existing_id:existing?.id||null};
  try{ const {error}=await supabaseClient.rpc('upsert_meeting_change_by_pj',payload); if(error) throw error; closeModal('editorModal'); await refreshRemoteState(true); showToast('Perubahan pertemuan tersimpan di Supabase untuk minggu ini saja.','success'); }
  catch(err){console.error(err);showToast(`Gagal menyimpan perubahan: ${err.message}`,'error');}
}
async function deleteMeeting(){
  if(!loggedInAs)return; const courseId=$('#meetingCourseId').value,wk=weekKey(currentWeek);
  try{ const {error}=await supabaseClient.rpc('delete_meeting_change_by_pj',{p_name:loggedInAs.name,p_code:loggedInAs.code,p_course_id:courseId,p_week_key:wk}); if(error) throw error; closeModal('editorModal'); await refreshRemoteState(true); showToast('Perubahan minggu ini dihapus; jadwal original kembali.','success'); }
  catch(err){console.error(err);showToast(`Gagal menghapus perubahan: ${err.message}`,'error');}
}

function openCourseDetails(courseId){
  const course=state.courses.find(c=>c.id===courseId); if(!course) return;
  const e=getEffective(course,currentWeek);
  const meta=getCourseMeta(courseId);
  $('#courseDetailCourseId').value=courseId;
  $('#courseDetailTitle').textContent=`${course.name}${course.code?` — ${course.code}`:''}`;
  $('#courseDetailSchedule').textContent=`${new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(e.date)}, ${formatTimeRange(e.start,e.end)}${e.room?` · ${e.room}`:''}`;
  $('#courseDetailLecturer').textContent=course.lecturer?.trim() || 'Dosen Pengampu —';
  $('#courseDetailMode').textContent=e.mode==='Virtual' ? 'Virtual' : 'Tatap Muka';
  $('#courseDetailTask').checked=Boolean(meta.hasTask);
  $('#courseDetailDeadline').value=meta.deadline||'';
  $('#courseDetailNotes').value=meta.note||'';
  $('#courseDetailSidia').value=meta.sidiaUrl||'';
  $('#courseDetailTaskUrl').value=meta.taskUrl||'';
  $('#courseDetailSidia').setAttribute('placeholder','https://...');
  $('#courseDetailTaskUrl').setAttribute('placeholder','https://...');
  syncCourseDetailTaskState();
  renderCourseDetailLinks(meta);
  openModal('courseDetailModal');
}
function syncCourseDetailTaskState(){
  const on=$('#courseDetailTask')?.checked;
  $('#courseDetailDeadlineWrap')?.classList.toggle('hidden',!on);
}
function renderCourseDetailLinks(meta=getCourseMeta($('#courseDetailCourseId')?.value)){
  const box=$('#courseDetailLinks'); if(!box)return;
  const links=[];
  if(meta.sidiaUrl) links.push(`<a class="shortcut-button" href="${escapeAttr(meta.sidiaUrl)}" target="_blank" rel="noopener noreferrer">📚 Buka SiDia</a>`);
  if(meta.taskUrl) links.push(`<a class="shortcut-button" href="${escapeAttr(meta.taskUrl)}" target="_blank" rel="noopener noreferrer">📝 Buka Link Tugas</a>`);
  box.innerHTML=links.length?links.join(''):'<span class="shortcut-empty">Belum ada quick shortcut. Simpan link di bawah.</span>';
}
function saveCourseDetails(e){
  e.preventDefault();
  const id=$('#courseDetailCourseId').value; if(!id)return;
  const hasTask=$('#courseDetailTask').checked;
  setCourseMeta(id,{
    hasTask,
    deadline:hasTask?$('#courseDetailDeadline').value:'',
    note:$('#courseDetailNotes').value.trim(),
    sidiaUrl:$('#courseDetailSidia').value.trim(),
    taskUrl:$('#courseDetailTaskUrl').value.trim()
  });
  closeModal('courseDetailModal');
  render();
  showToast('Catatan dan info tugas berhasil disimpan di perangkat ini.','success');
}
function setupTheme(){ const saved=localStorage.getItem(THEME_KEY); const prefers=window.matchMedia?.('(prefers-color-scheme: dark)').matches; applyTheme(saved||'dark',false); applyAccent(localStorage.getItem(ACCENT_KEY)||'violet',false); renderAccentPicker(); }
function applyTheme(theme,save=true){ document.documentElement.dataset.theme=theme; $('#themeIcon').textContent=theme==='dark'?'☀️':'🌙'; if(save)localStorage.setItem(THEME_KEY,theme); }
function toggleTheme(){ applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'); }
function applyAccent(name,save=true){ const cfg=ACCENTS[name]||ACCENTS.violet; const root=document.documentElement; root.dataset.accent=name||'violet'; root.style.setProperty('--accent',cfg.accent); root.style.setProperty('--accent-2',cfg.accent2); root.style.setProperty('--accent-rgb',cfg.rgb); if(save)localStorage.setItem(ACCENT_KEY,name||'violet'); renderAccentPicker(); }
function renderAccentPicker(){ const box=$('#themeSwatches'); if(!box)return; box.innerHTML=Object.entries(ACCENTS).map(([key,cfg])=>`<button type="button" class="theme-swatch" data-accent="${key}" title="${cfg.name}" aria-label="${cfg.name}" style="--swatch:${cfg.accent};--swatch-2:${cfg.accent2}"><span></span><b>${cfg.name}</b></button>`).join(''); box.querySelectorAll('[data-accent]').forEach(btn=>btn.addEventListener('click',()=>applyAccent(btn.dataset.accent)));}
function togglePalette(){ const p=$('#themePicker'); if(!p)return; const open=p.classList.toggle('hidden'); $('#paletteToggle').setAttribute('aria-expanded',String(!open)); }
function closePalette(){ const p=$('#themePicker'); if(p)p.classList.add('hidden'); $('#paletteToggle')?.setAttribute('aria-expanded','false'); }
function showToast(message,type='success'){ const box=document.createElement('div'); box.className=`toast ${type}`; box.textContent=message; $('#toastRegion').appendChild(box); setTimeout(()=>box.remove(),3400); }
function escapeHtml(s){ return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function escapeAttr(s){ return escapeHtml(s).replace(/`/g,'&#096;'); }
const COIN_GIF_URL = 'https://media.tenor.com/jX0Ytn_JLcIAAAAj/mario-coins.gif';
function coinIcon(){ return '🪙'; }

// ============================================================
// GAME ZONE — lightweight mini-games for waiting between classes
// ============================================================
const COURSE_NOTES_KEY = '2026B_COURSE_NOTES_V1';
const GAME_STATE_KEY = '2026B_GAME_STATE_V1';
let gamePanelOpen = false;
let activeGame = null;
let tapTimer = null;
let tapScore = 0;
let tapRemaining = 5;
let coinTimer = null;
let coinScore = 0;
let coinRemaining = 20;
let quizIndex = 0;
let quizScore = 0;
let gameDrag = null;

const QUIZ_QUESTIONS = [
  {q:'Apa kepanjangan dari AI?', a:['Artificial Intelligence','Automatic Internet','Advanced Information'], correct:0},
  {q:'Dokumen yang berisi catatan debit dan kredit disebut…', a:['Jurnal','Neraca saldo','Invoice'], correct:0},
  {q:'SSO biasanya digunakan untuk…', a:['Satu login ke beberapa layanan','Menghapus semua password','Mematikan akun'], correct:0},
  {q:'Shortcut umum untuk menyimpan dokumen adalah…', a:['Ctrl + S','Ctrl + P','Ctrl + Shift + Esc'], correct:0},
  {q:'Dalam jadwal ini, kode mata kuliah digunakan untuk…', a:['Membedakan kelas/kode pengampu','Mengubah warna tema','Menentukan wallpaper'], correct:0},
  {q:'Phishing paling sering bertujuan untuk…', a:['Mencuri data/akses','Mempercepat Wi-Fi','Menghapus cache browser'], correct:0},
  {q:'Tanggal override jadwal mingguan seharusnya berlaku untuk…', a:['Minggu yang dipilih','Semua semester selamanya','Hanya hari ini'], correct:0}
];

function defaultGameState(){
  return {coins:0,best:{tap:0,coin:0,quiz:0},pet:{name:'Oyen',hunger:72,happiness:76,exp:0,level:1}};
}
function getGameState(){
  try{
    const raw=localStorage.getItem(GAME_STATE_KEY);
    const saved=raw?JSON.parse(raw):null;
    const base=defaultGameState();
    return {
      ...base,...saved,
      best:{...base.best,...(saved?.best||{})},
      pet:{...base.pet,...(saved?.pet||{})}
    };
  }catch{return defaultGameState();}
}
function saveGameState(next){
  localStorage.setItem(GAME_STATE_KEY,JSON.stringify(next));
  updateGameBalance(next.coins);
}
function updateGameBalance(coins=getGameState().coins){
  const el=$('#gameCoinBalance'); if(el) el.textContent=Math.max(0,Number(coins)||0);
}
function addGameCoins(amount){
  const g=getGameState(); g.coins=Math.max(0,g.coins+Number(amount||0)); saveGameState(g); return g.coins;
}
function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function gameMenu(){
  activeGame=null;
  stopAllGames();
  $('#gameMenuView').classList.remove('hidden');
  $('#gamePlayView').classList.add('hidden');
  $('#gamePanelTitle').textContent='🎮 Game Zone';
  updateGameBalance();
}
function openGame(game){
  activeGame=game;
  $('#gameMenuView').classList.add('hidden');
  $('#gamePlayView').classList.remove('hidden');
  renderGame(game);
}
function renderGame(game){
  stopAllGames();
  const content=$('#gameContent'); if(!content)return;
  const titles={pet:'🐾 Raise Pets',tap:'⚡ Tap Speed',quiz:'🧠 Quick Quiz',coin:'🪙 Coin Rush',gacha:'🎲 Mini Gacha'};
  $('#gamePanelTitle').textContent=titles[game]||'🎮 Game';
  if(game==='pet') renderPetGame(content);
  if(game==='tap') renderTapGame(content);
  if(game==='quiz') renderQuizGame(content);
  if(game==='coin') renderCoinGame(content);
  if(game==='gacha') renderGachaGame(content);
}
function renderPetGame(box){
  const g=getGameState(); const p=g.pet;
  box.innerHTML=`<div class="game-hero">\n    <div class="pet-face">🐱</div>\n    <div><div class="game-eyebrow">LEVEL ${p.level}</div><h3>${escapeHtml(p.name)}</h3><p>Rawat pet kamu sambil nunggu kelas dimulai.</p></div>\n  </div>\n  <div class="pet-stats"><div><span>🍖 Lapar</span><strong>${p.hunger}%</strong><i><b style="width:${p.hunger}%"></b></i></div><div><span>💖 Bahagia</span><strong>${p.happiness}%</strong><i><b style="width:${p.happiness}%"></b></i></div><div><span>⭐ EXP</span><strong>${p.exp}/100</strong><i><b style="width:${p.exp}%"></b></i></div></div>\n  <div class="game-actions"><button class="primary-button" data-pet-action="feed">🍖 Feed</button><button class="ghost-button" data-pet-action="play">🎾 Play</button><button class="ghost-button" data-pet-action="sleep">😴 Sleep</button></div>\n  <div class="game-tip" id="petMessage">Pet kamu siap diajak main! Setiap aksi memberi EXP.</div>`;
  box.querySelectorAll('[data-pet-action]').forEach(btn=>btn.addEventListener('click',()=>petAction(btn.dataset.petAction)));
}
function petAction(action){
  const g=getGameState(); const p=g.pet;
  if(action==='feed'){p.hunger=Math.min(100,p.hunger+12);p.happiness=Math.min(100,p.happiness+2);}
  if(action==='play'){p.happiness=Math.min(100,p.happiness+12);p.hunger=Math.max(0,p.hunger-6);}
  if(action==='sleep'){p.hunger=Math.max(0,p.hunger-2);p.happiness=Math.min(100,p.happiness+7);}
  p.exp=Math.min(100,p.exp+20);
  let levelUp=false;
  if(p.exp>=100){p.exp=p.exp-100;p.level+=1;levelUp=true;g.coins+=50;}
  saveGameState(g);
  renderPetGame($('#gameContent'));
  const msg=$('#petMessage'); if(msg) msg.textContent=levelUp?`🎉 ${p.name} naik ke Level ${p.level}! Bonus +50 coin.`:'✨ Mood pet kamu membaik. Jangan sampai kelaparan!';
}
function renderTapGame(box){
  const g=getGameState();
  box.innerHTML=`<div class="game-center"><div class="game-eyebrow">BEST ${g.best.tap}</div><h3>Tap secepat mungkin!</h3><p>Tekan tombol selama 5 detik. Setiap tap = 1 poin.</p><div class="tap-score" id="tapScore">0</div><div class="tap-timer" id="tapTimer">5.0s</div><button class="tap-big-button" id="tapButton" type="button" disabled>START</button><div class="game-tip" id="tapMessage">Siap? Klik START dulu.</div></div>`;
  $('#tapButton').addEventListener('click',()=>{if(tapRemaining>0){tapScore++;$('#tapScore').textContent=tapScore;}});
  // Start button doubles as a clean launcher: first click arms the 5-second round.
  const start=$('#tapButton');
  start.disabled=false;
  start.addEventListener('click',()=>{
    if(tapRemaining!==5 || tapScore!==0 || tapTimer)return;
    tapScore=0; tapRemaining=5; start.textContent='TAP!'; start.classList.add('running'); $('#tapMessage').textContent='GO! GO! GO!';
    const started=performance.now();
    const tick=()=>{
      const elapsed=(performance.now()-started)/1000; tapRemaining=Math.max(0,5-elapsed); $('#tapTimer').textContent=`${tapRemaining.toFixed(1)}s`;
      if(tapRemaining<=0){
        clearInterval(tapTimer);tapTimer=null;start.disabled=true;start.classList.remove('running');start.textContent='SELESAI';
        const gg=getGameState(); if(tapScore>gg.best.tap)gg.best.tap=tapScore; const reward=Math.max(5,Math.min(60,tapScore*2)); gg.coins+=reward; saveGameState(gg); $('#tapMessage').textContent=`⚡ ${tapScore} tap! +${reward} coin.`;
      }
    };
    tapTimer=setInterval(tick,50);tick();
  },{once:true});
}
function renderQuizGame(box){
  quizIndex=0; quizScore=0;
  renderQuizQuestion(box);
}
function renderQuizQuestion(box){
  const q=QUIZ_QUESTIONS[quizIndex]; const g=getGameState();
  box.innerHTML=`<div class="game-quiz"><div class="game-eyebrow">SOAL ${quizIndex+1} / 5</div><h3>${escapeHtml(q.q)}</h3><div class="quiz-options">${q.a.map((a,i)=>`<button class="quiz-option" type="button" data-answer="${i}">${escapeHtml(a)}</button>`).join('')}</div><div class="quiz-progress"><span>Skor sementara: <strong>${quizScore}</strong></span><span>Best: <strong>${g.best.quiz}</strong></span></div></div>`;
  box.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>answerQuiz(Number(btn.dataset.answer))));
}
function answerQuiz(answer){
  const q=QUIZ_QUESTIONS[quizIndex];
  if(answer===q.correct)quizScore++;
  quizIndex++;
  if(quizIndex>=5){
    const reward=quizScore*20+10; const g=getGameState(); if(quizScore>g.best.quiz)g.best.quiz=quizScore;g.coins+=reward;saveGameState(g);
    $('#gameContent').innerHTML=`<div class="game-result"><div class="result-icon">🧠</div><div class="game-eyebrow">QUIZ SELESAI</div><h3>${quizScore}/5 benar</h3><p>+${reward} ${coinIcon()} coin masuk ke saldo Game Zone.</p><button class="primary-button" id="quizAgain">Main lagi</button></div>`;
    $('#quizAgain').addEventListener('click',()=>renderQuizGame($('#gameContent'))); return;
  }
  renderQuizQuestion($('#gameContent'));
}
function renderCoinGame(box){
  const g=getGameState(); coinScore=0; coinRemaining=20;
  box.innerHTML=`<div class="coin-game-wrap"><div class="game-eyebrow">BEST ${g.best.coin}</div><h3>Kejar coin!</h3><p>Klik coin Mario sebanyak mungkin sebelum waktu habis.</p><div class="coin-board" id="coinBoard"><button class="floating-coin" id="coinTarget" type="button" aria-label="Ambil coin"><img src="${COIN_GIF_URL}" alt="Coin Mario" /></button><div class="coin-hud"><strong>${coinIcon()} <span id="coinScore">0</span></strong><span id="coinTimer">20s</span></div></div><button class="primary-button" id="coinStart">START</button><div class="game-tip" id="coinMessage">Setelah START, coin akan berpindah setiap kali diklik.</div></div>`;
  const start=$('#coinStart'); start.addEventListener('click',startCoinRush,{once:true});
}
function startCoinRush(){
  const target=$('#coinTarget'),board=$('#coinBoard'),start=$('#coinStart'); if(!target||!board)return;
  coinScore=0;coinRemaining=20;$('#coinScore').textContent='0';start.disabled=true;start.textContent='BERMAIN…';
  const move=()=>{const maxX=Math.max(8,board.clientWidth-target.offsetWidth-8),maxY=Math.max(40,board.clientHeight-target.offsetHeight-8);target.style.left=`${randomInt(8,maxX)}px`;target.style.top=`${randomInt(40,maxY)}px`;};
  target.addEventListener('click',()=>{if(coinRemaining<=0)return;coinScore++;$('#coinScore').textContent=coinScore;move();},{once:false});
  move();
  const started=performance.now();
  const tick=()=>{coinRemaining=Math.max(0,20-(performance.now()-started)/1000);$('#coinTimer').textContent=`${coinRemaining.toFixed(1)}s`;if(coinRemaining<=0){clearInterval(coinTimer);coinTimer=null;target.disabled=true;const g=getGameState();if(coinScore>g.best.coin)g.best.coin=coinScore;const reward=Math.max(10,coinScore*3);g.coins+=reward;saveGameState(g);start.disabled=false;start.textContent='MAIN LAGI';start.onclick=()=>renderCoinGame($('#gameContent'));$('#coinMessage').textContent=`🪙 ${coinScore} coin tertangkap! +${reward} ${coinIcon()} coin reward.`;}};
  coinTimer=setInterval(tick,50);tick();
}
function renderGachaGame(box){
  const g=getGameState();
  const cost=25;
  box.innerHTML=`<div class="gacha-card"><div class="gacha-icon">🎲</div><div class="game-eyebrow">LUCKY DRAW</div><h3>Mini Gacha</h3><p>Biaya <strong>${cost} coin</strong> per pull.</p><div class="gacha-result" id="gachaResult">?</div><button class="primary-button" id="gachaButton" ${g.coins<cost?'disabled':''}>TRY YOUR LUCK</button><div class="game-tip">Saldo sekarang: ${coinIcon()} <strong id="gachaBalance">${g.coins}</strong></div></div>`;
  $('#gachaButton').addEventListener('click',playGacha);
}
function playGacha(){
  const rewards=[{text:'🍕 Pizza +15',value:15},{text:'☕ Kopi +20',value:20},{text:'📚 Buku +30',value:30},{text:'💎 RARE +80',value:80},{text:'😭 Apes +0',value:0}];
  const g=getGameState(); if(g.coins<25)return;
  g.coins-=25; const r=rewards[randomInt(0,rewards.length-1)]; g.coins+=r.value; saveGameState(g); $('#gachaResult').textContent=r.text; $('#gachaBalance').textContent=g.coins; $('#gachaButton').disabled=g.coins<25;
}
function stopAllGames(){
  if(tapTimer){clearInterval(tapTimer);tapTimer=null;} if(coinTimer){clearInterval(coinTimer);coinTimer=null;}
  tapRemaining=5;tapScore=0;coinRemaining=20;coinScore=0;
}
function toggleGamePanel(){
  gamePanelOpen=!gamePanelOpen; const panel=$('#gamePanel'); if(!panel)return;
  panel.classList.toggle('hidden',!gamePanelOpen); $('#gameLauncher').setAttribute('aria-expanded',String(gamePanelOpen));
  updateGameBalance(); if(!gamePanelOpen){stopAllGames();gameMenu();}
}
function closeGamePanel(){gamePanelOpen=false;$('#gamePanel')?.classList.add('hidden');$('#gameLauncher')?.setAttribute('aria-expanded','false');stopAllGames();}
function setupGameDrag(){
  const panel=$('#gamePanel'),handle=$('#gamePanelHandle'); if(!panel||!handle)return;
  handle.addEventListener('pointerdown',(e)=>{if(window.innerWidth<=720)return;if(e.target.closest('button'))return;const r=panel.getBoundingClientRect();gameDrag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};handle.setPointerCapture?.(e.pointerId);});
  handle.addEventListener('pointermove',(e)=>{if(!gameDrag)return;const dx=e.clientX-gameDrag.x,dy=e.clientY-gameDrag.y;const left=Math.max(10,Math.min(window.innerWidth-panel.offsetWidth-10,gameDrag.left+dx));const top=Math.max(10,Math.min(window.innerHeight-panel.offsetHeight-10,gameDrag.top+dy));panel.style.left=`${left}px`;panel.style.top=`${top}px`;panel.style.right='auto';panel.style.bottom='auto';});
  handle.addEventListener('pointerup',()=>{gameDrag=null;}); handle.addEventListener('pointercancel',()=>{gameDrag=null;});
}
function setupGameZone(){
  $('#gameLauncher')?.addEventListener('click',toggleGamePanel);
  $('#gamePanelClose')?.addEventListener('click',closeGamePanel);
  $('#gameBackButton')?.addEventListener('click',gameMenu);
  $$('.game-card').forEach(btn=>btn.addEventListener('click',()=>openGame(btn.dataset.game)));
  updateGameBalance(); setupGameDrag();
}

async function init(){
  $('#loginPJ').innerHTML='<option value="">Pilih nama PJ…</option>'+PJS.map(p=>`<option value="${escapeAttr(p.name)}">${escapeHtml(p.name)}</option>`).join('');
  $('#courseDay').innerHTML=DAYS.map((d,i)=>`<option value="${i}">${d}</option>`).join('');
  setupTheme();
  try{ initSupabase(); await loadRemoteState(); render(); subscribeRealtime(); }
  catch(err){ console.error(err); setConnectionStatus('Database belum terhubung',true); state={courses:clone(seedCourses),changes:[]}; render(); showToast(`Supabase belum siap: ${err.message}`,'error'); }
  finally { $('#loadingScreen')?.classList.add('hidden'); }

  $('#themeToggle').addEventListener('click',toggleTheme);
  $('#paletteToggle').addEventListener('click',(e)=>{e.stopPropagation();togglePalette();});
  document.addEventListener('click',(e)=>{if(!e.target.closest('.theme-picker-wrap'))closePalette();});
  $$('.category-tab').forEach(btn=>btn.addEventListener('click',()=>{ activeCategory=btn.dataset.category; render(); }));
  $('#prevWeek').addEventListener('click',()=>{currentWeek=addDays(currentWeek,-7);render();});
  $('#nextWeek').addEventListener('click',()=>{currentWeek=addDays(currentWeek,7);render();});
  $('#todayButton').addEventListener('click',()=>{currentWeek=startOfWeek(new Date());render();});
  $('#loginButton').addEventListener('click',()=>openModal('loginModal'));
  $('#logoutButton').addEventListener('click',doLogout);
  $('#courseDetailTask').addEventListener('change',syncCourseDetailTaskState);
  $('#courseDetailForm').addEventListener('submit',saveCourseDetails);
  setupGameZone();
  $('#loginForm').addEventListener('submit',doLogin);
  $('#courseForm').addEventListener('submit',saveCourse);
  $('#meetingForm').addEventListener('submit',saveMeeting);
  $('#deleteMeetingButton').addEventListener('click',deleteMeeting);
  $('#meetingStatus').addEventListener('change',()=>{if($('#meetingStatus').value==='Tetap'){const c=state.courses.find(c=>c.id===$('#meetingCourseId').value);if(c)$('#meetingDate').value=fmtDateISO(getDateForCourse(c,currentWeek));}});
  $$('.editor-tab').forEach(b=>b.addEventListener('click',()=>setEditorMode(b.dataset.mode)));
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
  $$('.modal-backdrop').forEach(b=>b.addEventListener('click',(e)=>{if(e.target===b)closeModal(b.id);}));
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape'){closeModal('loginModal');closeModal('editorModal');}});
  document.addEventListener('click',(e)=>{const btn=e.target.closest('[data-action]');if(!btn)return;const action=btn.dataset.action,courseId=btn.dataset.courseId;if(action==='edit-course')openEditor(courseId,'course');if(action==='edit-meeting')openEditor(courseId,'meeting');});
}

document.addEventListener('mousemove',(e)=>{
  document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});
document.addEventListener('DOMContentLoaded',init);
