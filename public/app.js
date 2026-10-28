const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const api=u=>fetch('/api/'+u).then(async r=>{const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||r.status);return d});
const ISO={'Mexico':'mx','South Africa':'za','South Korea':'kr','Korea Republic':'kr','Czechia':'cz','Czech Republic':'cz','Canada':'ca','Bosnia and Herzegovina':'ba','Qatar':'qa','Switzerland':'ch','Brazil':'br','Morocco':'ma','Haiti':'ht','Scotland':'gb-sct','USA':'us','United States':'us','Paraguay':'py','Australia':'au','Turkey':'tr','Türkiye':'tr','Germany':'de','Curaçao':'cw','Curacao':'cw','Ivory Coast':'ci',"Côte d'Ivoire":'ci','Ecuador':'ec','Netherlands':'nl','Japan':'jp','Sweden':'se','Tunisia':'tn','Belgium':'be','Egypt':'eg','Iran':'ir','IR Iran':'ir','New Zealand':'nz','Spain':'es','Cabo Verde':'cv','Saudi Arabia':'sa','Uruguay':'uy','France':'fr','Senegal':'sn','Iraq':'iq','Norway':'no','Argentina':'ar','Algeria':'dz','Austria':'at','Jordan':'jo','Portugal':'pt','Congo DR':'cd','Uzbekistan':'uz','Colombia':'co','England':'gb-eng','Croatia':'hr','Ghana':'gh','Panama':'pa'};
// const flag=(n,c='w-6 h-4')=>ISO[n]?`<img class="${c} object-cover rounded-sm shadow-sm" src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${ISO[n]}.svg" alt="">`:`<span class="${c} inline-flex items-center justify-center bg-slate-200 rounded-sm text-[8px] font-bold text-slate-500">${(n||'?').slice(0,3).toUpperCase()}</span>`;
const PODIUM={'Spain':['👑','Champion'],'Argentina':['🥈','Runner-up'],'England':['🥉','Third place']};
const flag=(n,c='w-6 h-4',b='text-xs')=>{
  const img=ISO[n]?`<img class="${c} object-cover rounded-sm shadow-sm" src="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${ISO[n]}.svg" alt="">`:`<span class="${c} inline-flex items-center justify-center bg-slate-200 rounded-sm text-[8px] font-bold text-slate-500">${(n||'?').slice(0,3).toUpperCase()}</span>`;
  const p=PODIUM[n];
  // return p?`<span class="relative inline-block shrink-0 align-middle">${img}<span class="absolute leading-none drop-shadow ${b}" style="top:-.65em;right:-.45em" title="${p[1]}">${p[0]}</span></span>`:img};
    return p?`<span class="relative inline-block shrink-0 align-middle">${img}<span class="podium-emoji ${p[0]==='👑'?'crown':''} ${b}" title="${p[1]}">${p[0]}</span></span>`:img};
  // Huy chuong 🥇 dang anh (khong phu thuoc font emoji cua may): Fluent 3D -> Twemoji -> emoji
const MEDAL_URL='https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/1st%20place%20medal/3D/1st_place_medal_3d.png',
      MEDAL_ALT='https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f947.svg';
const medal=(c='w-4 h-4')=>`<img class="${c} inline-block shrink-0 object-contain" src="${MEDAL_URL}" alt="🥇" onerror="this.onerror=null;this.src='${MEDAL_ALT}'">`;
// const MEDAL_IMG=['1st%20place%20medal/3D/1st_place_medal_3d.png','2nd%20place%20medal/3D/2nd_place_medal_3d.png','3rd%20place%20medal/3D/3rd_place_medal_3d.png'],MEDAL_TW=['1f947','1f948','1f949'];
// const medalN=(i,c='w-12 h-12')=>`<img class="${c} mx-auto object-contain" src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${MEDAL_IMG[i]}" alt="" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${MEDAL_TW[i]}.svg'">`;
const CARD_ICON=['Soccer%20ball/3D/soccer_ball_3d.png','Running%20shoe/3D/running_shoe_3d.png','Star/3D/star_3d.png'],CARD_ICON_TW=['26bd','1f45f','2b50'];
const medalN=(i,c='w-12 h-12')=>`<img class="${c} mx-auto object-contain" src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${CARD_ICON[i]}" alt="" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${CARD_ICON_TW[i]}.svg'">`;
const shirt=p=>p&&p.shirt_number!=null&&p.shirt_number!==''?'#'+p.shirt_number+' ':'';
const AGE={},ageOf=b=>Math.floor((Date.now()-new Date(b))/31557600000);   // cache tuoi theo player_id
// So ao du phong: moi doi 26 cau thu, player_id 1..1248 -> so ao 1..26 lap lai (dung khi API chua tra shirt_number)
const SHIRTS=Object.fromEntries(Array.from({length:1248},(_,i)=>[i+1,i%26+1]));
const PCOL={GK:'bg-amber-600',DEF:'bg-emerald-700',MID:'bg-indigo-700',FWD:'bg-red-600'},
      GNAME={GK:'Goalkeepers',DEF:'Defenders',MID:'Midfielders',FWD:'Forwards'};
// Chuan hoa ten (du lieu hay bi lap / dinh chu: "Matheus Matheus Cunha", "GUIMARAESBruno Bruno")
const cleanName=n=>{
  let t=String(n||'').replace(/([A-Z]{2,})([A-Z][a-z])/g,'$1 $2').split(/\s+/).filter(Boolean);
  const o=t;t=o.filter((w,i)=>i===0||w.toLowerCase()!==o[i-1].toLowerCase());
  if(t.length>1&&t[0].length>2&&t[0]===t[0].toUpperCase()&&t.slice(1).every(w=>w!==w.toUpperCase()))t=[...t.slice(1),t[0][0]+t[0].slice(1).toLowerCase()];
  return t.join(' ')};
const shortName=n=>{const t=cleanName(n).split(' ');return t.length>1?t[0]+' '+t[t.length-1][0]+'.':t[0]};
const PARTICLE=new Set(['mac','mc','de','da','do','dos','das','del','della','di','van','von','der','den','ten','ter','la','le','lo','los','las','el','al','bin','ben','du']);
const shortFull=n=>{const t=cleanName(n).split(' ');if(t.length<=2)return t.join(' ');
  let k=t.length-1;while(k>1&&PARTICLE.has(t[k-1].toLowerCase()))k--;   // gom cac tiu to ho (van, de, mac...)
  return t[0]+' '+t.slice(k).join(' ')};
const SUFFIX=new Set(['junior','júnior','jr','jr.','filho','neto']);
const surname=n=>{const t=cleanName(n).split(' ');if(t.length===1)return t[0];
  let end=t.length;while(end>1&&SUFFIX.has(t[end-1].toLowerCase()))end--;      // "Vinicius Junior" -> "Vinicius"
  let k=end-1;while(k>1&&PARTICLE.has(t[k-1].toLowerCase()))k--;                // "van Dijk", "Mac Allister"
  return t.slice(k,end).join(' ')};
const iso=v=>typeof v==='string'?v.slice(0,10):new Date(v).toISOString().slice(0,10);
const fmtD=v=>new Date(iso(v)+'T00:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'});
const fmtT=v=>{if(v==null)return '';const t=String(v);return t.includes('T')?t.slice(11,16):t.slice(0,5)};
const pos=p=>/^g/i.test(p)?'GK':/^d/i.test(p)?'DEF':/^m/i.test(p)?'MID':'FWD';
const nz=v=>v??'-';
const empty=t=>`<p class="text-xs text-slate-400">${t}</p>`;
// Cap nhat dong "Last synced: ..." cua mot view (teams / players) bang gio hien tai, giong tab Tournament
const syncStamp=v=>{const el=[...$$('#view-'+v+' *')].find(e=>!e.children.length&&/^Last synced/.test(e.textContent.trim()));if(el)el.textContent='Last synced: '+new Date().toLocaleTimeString()};
const CARD='bg-white rounded-xl border border-slate-200 shadow-sm';
const state={view:'matches',stage:null,group:null,teams:[],teamId:null};


let lastMatchesHash = '';
async function loadMatches(){ guard(async()=>{
  const {matches,updatedAt}=await api('matches');
  $('#matches-last-updated').textContent='Last updated: '+new Date(updatedAt).toLocaleTimeString();
  const hash=JSON.stringify(matches);
  if(hash===lastMatchesHash) return;        // dữ liệu không đổi thì không vẽ lại
  lastMatchesHash=hash;
  const td=new Date().toLocaleDateString('sv');
  list($('#matches-today-list'),matches.filter(m=>iso(m.datee)===td));
  list($('#matches-past-list'),matches.filter(m=>iso(m.datee)<td));
  list($('#matches-upcoming-list'),matches.filter(m=>iso(m.datee)>td));
})}

const stageLabel=m=>m.stage_name==='Group Stage'&&m.groupp?'Group '+m.groupp:(m.stage_name||'');
function matchCard(m){const lb=stageLabel(m);return `<div class="match-card clickable ${CARD} px-8 py-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4" data-id="${m.match_id}">
 <div class="team-link group clickable justify-self-start flex items-center gap-4" data-team="${m.home_team_name}">${flag(m.home_team_name,'w-9 h-6')}<div><p class="text-base font-bold text-brand-navy group-hover:underline">${m.home_team_name}</p><p class="text-xs text-slate-400">${lb}</p></div></div>
 <div class="text-center"><p class="text-xs text-slate-400">${fmtD(m.datee)}</p><p class="text-3xl font-extrabold text-brand-navy tracking-wide">${nz(m.home_score)} – ${nz(m.away_score)}</p><span class="inline-block mt-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-200 text-slate-500 font-semibold">${m.statuss||''}</span></div>
 <div class="team-link group clickable justify-self-end flex items-center gap-4 justify-end text-right" data-team="${m.away_team_name}"><div><p class="text-base font-bold text-brand-navy group-hover:underline">${m.away_team_name}</p><p class="text-xs text-slate-400">${lb}</p></div>${flag(m.away_team_name,'w-9 h-6')}</div></div>`}
const list=(el,a)=>{el.innerHTML=a.length?a.map(matchCard).join(''):empty('There are no matches yet.')};

// ---------- Knockout card (theo mau: Match N, san, ngay, ti so, FT/PEN) ----------
const isFinished=m=>/complet|finish|full/i.test(m.statuss||'')||!!m.result_type;
const isShootout=m=>String(m.result_type||'').toUpperCase()==='PEN'||
  (isFinished(m)&&m.home_score!=null&&m.away_score!=null&&Number(m.home_score)===Number(m.away_score));
const resBadge=m=>{
  const r=String(m.result_type||'').trim().toUpperCase(),
        b=t=>`<span class="px-2 py-0.5 rounded-md bg-slate-200 text-slate-500 text-[11px] font-semibold">${t}</span>`;
  if(isShootout(m))return b('PEN')+'<span class="text-[11px] font-medium text-slate-400">Pens</span>';
  if(!r)return b(m.statuss||'');
  return b(r);
};
function knockoutCard(m,n,w){
  const ck='<span title="Winner" class="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-bold leading-none inline-flex items-center justify-center">✓</span>';
  const team=(name,right)=>`<div class="team-link group clickable flex items-center gap-2.5 min-w-0 ${right?'justify-self-end justify-end text-right':'justify-self-start'} ${w===name?'team-win':w?'team-lose':''}" data-team="${name}">${right?'':flag(name,'w-7 h-[21px]')}${right&&w===name?ck:''}<span class="text-[13px] ${w===name?'font-extrabold':'font-semibold'} text-brand-navy group-hover:underline">${name}</span>${!right&&w===name?ck:''}${right?flag(name,'w-7 h-[21px]'):''}</div>`;
  return `<div class="match-card clickable ${CARD} rounded-2xl px-[18px] pt-3.5 pb-4" data-id="${m.match_id}">
 <div class="flex items-center justify-between text-[11px] font-medium text-slate-400"><span>Match ${n}</span><span>${m.stadium_name||''}</span></div>
 <div class="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
  ${team(m.home_team_name,false)}
  <div class="flex flex-col items-center">
   <p class="text-base font-bold text-brand-navy leading-6">${fmtD(m.datee)}</p>
   <p class="inline-flex items-center gap-2.5 text-2xl font-extrabold text-brand-navy leading-8 tabular-nums slashed-zero"><span>${nz(m.home_score)}</span><span>–</span><span>${nz(m.away_score)}</span></p>
   <div class="mt-1.5 flex items-center gap-1.5">${resBadge(m)}</div>
   ${w&&isShootout(m)?`<p class="mt-1 text-[11px] font-semibold text-emerald-600">${w} win on pens</p>`:''}
  </div>
  ${team(m.away_team_name,true)}
 </div></div>`}




// ---------- Navigation ----------
function show(v){state.view=v;
  $$('.view-section').forEach(s=>s.classList.add('hidden'));$('#view-'+v).classList.remove('hidden');
  $$('.nav-btn').forEach(b=>{const on=b.dataset.view===(v==='player-detail'?'players':v);b.classList.toggle('active',on);b.classList.toggle('text-slate-600',!on)});
  $('#topbar-title').textContent={matches:'Match Results',tournament:'Tournament',teams:'Team Stats',players:'Player Stats','player-detail':'Player Stats',manage:'Create data',delete:'Delete data',update:'Update data'}[v];
  ({matches:loadMatches,tournament:loadTournament,teams:loadTeams,players:loadPlayers,manage:loadManage,delete:loadDelete,update:loadUpdate}[v==='player-detail'?'players':v])?.();
}
$$('.nav-btn').forEach(b=>b.onclick=()=>go(PATH[b.dataset.view]));
document.addEventListener('click',e=>{const t=e.target.closest('.team-link');if(t)return openTeamByName(t.dataset.team);const c=e.target.closest('.match-card');if(c)openMatch(c.dataset.id)});
async function openTeamByName(name){guard(async()=>{
  if(!state.teams.length)state.teams=await api('teams');
  const t=state.teams.find(x=>x.team_name===name);if(!t)throw new Error('Team not found: '+name);
  go('/teamstats/'+t.team_id)})}
$('#btn-close-modal').onclick=()=>$('#match-modal').classList.add('hidden');
$('#match-modal').onclick=e=>{if(e.target.id==='match-modal')e.target.classList.add('hidden')};
addEventListener('keydown',e=>{if(e.key==='Escape')$('#match-modal').classList.add('hidden')});
$('#btn-back-leaderboard').onclick=()=>go('/playerstats');
$('#btn-refresh-matches').onclick=loadMatches;
$('#topbar-date').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
const guard=async(fn)=>{try{await fn()}catch(e){alert('Failed to load data: '+e.message)}};

// ---------- Match Results ----------
async function loadMatches(){guard(async()=>{
  const {matches,updatedAt}=await api('matches'),td=new Date().toLocaleDateString('sv');
  $('#matches-last-updated').textContent='Last updated: '+new Date(updatedAt).toLocaleTimeString();
  list($('#matches-today-list'),matches.filter(m=>iso(m.datee)===td));
  list($('#matches-past-list'),matches.filter(m=>iso(m.datee)<td));
  list($('#matches-upcoming-list'),matches.filter(m=>iso(m.datee)>td));
})}
setInterval(()=>{if(state.view==='matches')loadMatches()},60000*60);

async function openMatch(id){guard(async()=>{
  const {match:m,events,stats}=await api('matches/'+id);
  $('#modal-match-stage').textContent=`${m.stage_name} · ${fmtD(m.datee)} ${fmtT(m.kickoff_time_utc)} UTC`;
  const st=n=>stats.find(s=>s.team_name===n)||{};const h=st(m.home_team_name),a=st(m.away_team_name);
  const bar=(l,x,y)=>{const t=(x||0)+(y||0)||1;return `<div><div class="flex justify-between text-xs font-semibold"><span>${nz(x)}</span><span class="text-slate-400">${l}</span><span>${nz(y)}</span></div><div class="relative h-1.5 rounded bg-slate-100 overflow-hidden mt-1"><i class="absolute left-0 inset-y-0 bg-brand-navy" data-w="${100*(x||0)/t}" style="width:0"></i><i class="absolute right-0 inset-y-0 bg-sky-300" data-w="${100*(y||0)/t}" style="width:0"></i></div></div>`};
  const icon=t=>/yellow/i.test(t)?'🟨':/red/i.test(t)?'🟥':/goal/i.test(t)?'⚽':/sub/i.test(t)?'🔁':'•';
  $('#modal-match-body').innerHTML=`<div class="grid grid-cols-3 items-center text-center"><div>${flag(m.home_team_name,'w-12 h-8 mx-auto')}<p class="font-bold mt-1">${m.home_team_name}</p></div>
   <div><p class="text-4xl font-extrabold text-brand-navy">${nz(m.home_score)} – ${nz(m.away_score)}</p><p class="text-[11px] text-slate-400">${m.statuss||''} ${m.result_type||''}</p></div>
   <div>${flag(m.away_team_name,'w-12 h-8 mx-auto')}<p class="font-bold mt-1">${m.away_team_name}</p></div></div>
   <p class="text-[11px] text-slate-400 text-center">${m.stadium_name}, ${m.city} · Referee: ${nz(m.referee_name)} · POM: ${nz(m.player_of_the_match_name)}</p>
   <div class="space-y-3">${bar('Possession %',h.possession_pct,a.possession_pct)}${bar('Shots',h.total_shots,a.total_shots)}${bar('On target',h.shots_on_target,a.shots_on_target)}${bar('Corners',h.corners,a.corners)}${bar('Fouls',h.fouls,a.fouls)}${bar('Offsides',h.offsides,a.offsides)}${bar('Saves',h.saves,a.saves)}${bar('xG',m.home_xg,m.away_xg)}</div>
   <div><h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">EVENTS</h4><div class="space-y-1 text-xs">${events.map(e=>`<div class="flex gap-2"><span class="w-8 text-slate-400">${e.minutee}'</span><span>${icon(e.event_type)}</span><span class="font-semibold">${e.player_name}</span><span class="text-slate-400">${e.team_name} · ${e.event_type}</span></div>`).join('')||empty('No events.')}</div></div>`;
  $('#match-modal').classList.remove('hidden');
})}

// ---------- Tournament ----------
async function loadTournament(){guard(async()=>{
  const stages=await api('stages');state.stage=state.stage||stages[0];
  const groups=await api('groups');state.group=state.group||groups[0];
  $('#tournament-sync-time').textContent='Last synced: '+new Date().toLocaleTimeString();
  $('#view-tournament .bg-blue-50').textContent=groups.length+' Groups';
  const pill=(on)=>on?'stage-pill active':'stage-pill bg-white border border-slate-200 text-slate-700 hover:bg-slate-50';
  $('#tournament-stage-tabs').innerHTML=stages.map(s=>`<button data-s="${s}" class="${pill(s===state.stage)} px-4 py-1.5 rounded-lg text-xs font-bold transition">${s==='Group Stage'?'Groups':s}</button>`).join('');
  $$('#tournament-stage-tabs button').forEach(b=>b.onclick=()=>{state.stage=b.dataset.s;loadTournament()});
  const isG=state.stage==='Group Stage';
  $('#tournament-group-tabs').style.display=isG?'flex':'none';
  $('#standings-card-wrapper').style.display=isG?'':'none';
  $('#tournament-matches-wrapper').className=isG?'lg:col-span-6 space-y-3':'lg:col-span-12 space-y-3';
  $('#tournament-matches-list').className=isG?'space-y-3':'grid grid-cols-1 lg:grid-cols-2 gap-4';
  $('#tournament-matches-title').parentElement.style.display=isG?'':'none';
  if(isG){
   $('#tournament-group-tabs').innerHTML=groups.map(g=>`<button data-g="${g}" class="px-4 py-1.5 rounded-lg text-xs font-bold ${g===state.group?'stage-pill active':'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}">Group ${g}</button>`).join('');
   $$('#tournament-group-tabs button').forEach(b=>b.onclick=()=>{state.group=b.dataset.g;loadTournament()});
   const d=await api('standings/'+encodeURIComponent(state.group));
   $('#standings-group-title').textContent=`Group ${state.group} — Standings`;
   $('#standings-tbody').innerHTML=d.standings.map((s,i)=>`<tr><td class="py-3 px-2"><span class="inline-flex w-6 h-6 rounded-full items-center justify-center text-[11px] ${i<2?'bg-emerald-100 text-emerald-700':i===3?'bg-red-50 text-red-600':'bg-slate-100 text-slate-500'}">${i+1}</span></td>
    <td class="py-3 px-2"><span class="inline-flex items-center gap-2"><span class="team-link group clickable inline-flex items-center gap-2" data-team="${s.team_name}">${flag(s.team_name)}<span class="group-hover:underline">${s.team_name}</span></span>${i<2?'<span class="text-[9px] px-1.5 rounded bg-emerald-50 text-emerald-600">ADV</span>':''}</span></td>
    <td class="text-center">${s.played}</td><td class="text-center">${s.wins}</td><td class="text-center">${s.draws}</td><td class="text-center">${s.loses}</td>
    <td class="text-center ${s.goal_difference<0?'text-red-500':'text-emerald-600'}">${s.goal_difference>0?'+':''}${s.goal_difference}</td><td class="text-center font-extrabold">${s.point}</td></tr>`).join('');
   $('#tournament-matches-title').textContent=`Group ${state.group} — Matches`;list($('#tournament-matches-list'),d.matches);
  } else {
   const ms=await api('stage?name='+encodeURIComponent(state.stage));
   $('#tournament-matches-title').textContent=state.stage+' — Matches';
   // Tran hoa phai da luan luu: doi thang = doi xuat hien o vong ke tiep
   let nextTeams=null;
   if(ms.some(isShootout)){
     const isThird=n=>/third/i.test(n||''),i=stages.indexOf(state.stage);
     let nxt=stages[i+1]; if(isThird(nxt))nxt=stages[i+2];
     if(nxt&&!isThird(state.stage)){
       try{nextTeams=new Set((await api('stage?name='+encodeURIComponent(nxt))).flatMap(x=>[x.home_team_name,x.away_team_name]).filter(Boolean))}catch(e){}
     }
   }
   // Doi thang: hon diem -> thang; hoa (luan luu) -> doi xuat hien o vong ke tiep
   const winnerOf=m=>{
     if(!isFinished(m)||m.home_score==null||m.away_score==null)return null;
     const h=Number(m.home_score),a=Number(m.away_score);
     if(h!==a)return h>a?m.home_team_name:m.away_team_name;
     if(!nextTeams)return null;
     return nextTeams.has(m.home_team_name)?m.home_team_name:nextTeams.has(m.away_team_name)?m.away_team_name:null;
   };
   // Thu tu tran: ngay -> gio da -> match_id; danh so Match 1..N trong tung vong
   const key=m=>iso(m.datee)+' '+fmtT(m.kickoff_time_utc)+' '+String(m.match_id).padStart(6,'0');
   const sorted=[...ms].sort((a,b)=>key(a).localeCompare(key(b)));
   $('#tournament-matches-list').innerHTML=sorted.length?sorted.map((m,i)=>knockoutCard(m,i+1,winnerOf(m))).reverse().join(''):empty('There are no matches yet.');
  }
})}

// ---------- Team Stats ----------
async function loadTeams(){guard(async()=>{
  if(!state.teams.length)state.teams=await api('teams');
  $('#teams-count-badge').textContent=state.teams.length+' teams';
  state.teamId=state.teamId||(state.teams.find(t=>t.team_name==='Brazil')||state.teams[0]).team_id;
  drawPicks($('#team-search-input').value.trim());
  await loadTeam(state.teamId);
})}
function drawPicks(q){const fav=['Brazil','France','Argentina','Spain','England'];
  let l=q?state.teams.filter(t=>t.team_name.toLowerCase().includes(q.toLowerCase())).slice(0,8):fav.map(n=>state.teams.find(t=>t.team_name===n)).filter(Boolean);
  $('#team-quick-picks').innerHTML=l.map(t=>`<button data-id="${t.team_id}" class="pick inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${t.team_id===state.teamId?'bg-brand-navy text-white border-brand-navy':'bg-white border-slate-200 text-slate-700'}">${flag(t.team_name,'w-5 h-3')}${t.team_name}</button>`).join('')+(q?'':`<span class="text-[11px] text-slate-400 ml-1">+ ${state.teams.length-l.length} more</span>`);
  $$('.pick').forEach(b=>b.onclick=()=>{state.teamId=+b.dataset.id;history.pushState(null,'','/teamstats/'+state.teamId);drawPicks(q);loadTeam(state.teamId)})}
$('#team-search-input').oninput=e=>drawPicks(e.target.value.trim());

async function loadTeam(id){guard(async()=>{
  const d=await api('teams/'+id),i=d.info,s=d.stats,res=r=>{const home=r.home_team_name===i.team_name,gf=home?r.home_score:r.away_score,ga=home?r.away_score:r.home_score;return gf>ga?'W':gf<ga?'L':'D'};
  // Recent form: tat ca tran da dau cua doi (lay tu api matches), moi nhat o tren
  const {matches:allM}=await api('matches'),tk=r=>iso(r.datee)+' '+fmtT(r.kickoff_time_utc);
  const played=allM.filter(r=>(r.home_team_name===i.team_name||r.away_team_name===i.team_name)&&isFinished(r)&&r.home_score!=null&&r.away_score!=null).sort((a,b)=>tk(b).localeCompare(tk(a)));
  const F=played.length?played:d.form;
  $('#team-hero-banner').innerHTML=`<div class="flex items-center gap-5">${flag(i.team_name,'w-24 h-[74px] border-[6px] border-white rounded-2xl')}<div><p class="text-[11px] tracking-wider text-blue-200">GROUP ${i.groupp} · ${i.confederation}</p><h2 class="text-4xl font-extrabold">${i.team_name}</h2><p class="text-xs text-blue-200">FIFA ranking ${nz(i.fifa_ranking_per_tournament)} · Elo ${nz(i.elo_rating)} · ${i.fifa_code_name}</p></div></div><div class="text-sm text-right">Coach: <b>${nz(i.coach_name)}</b></div>`;
  const gd=s.goal_difference;
  const wr=s.total_games_played?Math.round(100*s.wins/s.total_games_played):0;
  $('#team-kpi-grid').innerHTML=[
    ['PLAYED',s.total_games_played,'text-brand-navy'],
    ['WON',s.wins,'text-emerald-700',wr+'% win rate'],
    ['DRAWN',s.draws,'text-slate-600'],
    ['LOST',s.loses,'text-red-600'],
    ['GOAL DIFF',gd>0?'+'+gd:gd,gd>0?'text-emerald-700':gd<0?'text-red-600':'text-slate-600'],
    ['POINTS',s.point_in_group_stage,'text-brand-navy']
  ].map(([l,v,c,sub])=>`<div class="${CARD} p-4"><p class="text-[10px] font-bold tracking-wider text-slate-400">${l}</p><p class="text-3xl font-extrabold ${c}">${nz(v)}</p>${sub?`<p class="text-xs text-slate-400 mt-0.5">${sub}</p>`:''}</div>`).join('');
  const col={W:'bg-emerald-600',D:'bg-slate-500',L:'bg-red-600'};
  $('#team-form-badges').classList.add('flex-wrap');
  $('#team-form-badges').innerHTML=[...F].reverse().map(r=>`<span class="w-9 h-9 rounded-lg ${col[res(r)]} text-white font-bold text-sm inline-flex items-center justify-center">${res(r)}</span>`).join('')||empty('No matches');
  $('#team-form-details').innerHTML=F.map(r=>{
    const k=res(r),opp=r.home_team_name===i.team_name?r.away_team_name:r.home_team_name,
          w=k==='W'?i.team_name:k==='L'?opp:null,                       // hoa -> chua co doi thang
          t=n=>n===w?`<b class="text-brand-navy">${n}</b>`:n;
    return `<div class="flex items-center gap-2"><span class="w-5 h-5 shrink-0 rounded ${col[k]} text-white text-[10px] font-bold inline-flex items-center justify-center">${k}</span><span>${fmtD(r.datee)} · ${t(r.home_team_name)} ${nz(r.home_score)}–${nz(r.away_score)} ${t(r.away_team_name)}</span></div>`}).join('');
  const pb=(l,v,max,suf='',bg='bg-brand-navy',tx='text-brand-navy')=>`<div><div class="flex justify-between text-xs"><span>${l}</span><b class="${tx}">${nz(v)}${suf}</b></div><div class="h-1.5 bg-slate-100 rounded mt-1"><i class="block h-full rounded ${bg}" data-w="${Math.min(100,100*(v||0)/max)}" style="width:0"></i></div></div>`;
  $('#team-performance-bars').innerHTML=pb('Possession',s.avg_possession,100,'%','bg-brand-navy','text-brand-navy')+pb('Shots on target',s.total_shots?Math.round(100*s.shot_on_target/s.total_shots):0,100,'%','bg-emerald-600','text-emerald-700')+pb('Avg rating',d.rating,10,'','bg-amber-500','text-amber-600');
  const sq=d.squad.map(p=>({...p,shirt_number:p.shirt_number??SHIRTS[p.player_id]})),rated=sq.filter(p=>p.avg_rating!=null).sort((a,b)=>b.avg_rating-a.avg_rating)[0];
  const trb=$('#team-top-rated-banner');
  trb.className='bg-gradient-to-r from-amber-100/70 via-white to-white border border-amber-500/70 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4';
  const drawTop=(g,a)=>{const st=(l,v,c)=>`<div class="text-center"><p class="text-2xl font-extrabold leading-8 tabular-nums slashed-zero ${c}">${v}</p><p class="text-[11px] font-semibold tracking-wider text-slate-500">${l}</p></div>`;
    trb.innerHTML=`<div class="flex items-center gap-3 min-w-0">${medal('w-10 h-10')}<div class="min-w-0"><p class="text-[11px] font-bold tracking-wider text-slate-500">TEAM TOP RATED</p><p class="text-lg font-extrabold text-brand-navy">${shirt(rated)}${cleanName(rated.player_name)} <span class="text-slate-400 text-xs font-medium">${pos(rated.position)}</span></p></div></div>
    <div class="flex items-center gap-6 shrink-0">${st('GOALS',nz(g),'text-red-600')}${st('ASSISTS',nz(a),'text-brand-navy')}${st('RATING',isNaN(rated.avg_rating)?nz(rated.avg_rating):Number(rated.avg_rating).toFixed(1),'text-emerald-700')}</div>`};
  if(rated){
    drawTop(rated.goals,rated.assists);
    // squad rows may not carry goals/assists -> fetch the player's detail once
    if(rated.goals==null||rated.assists==null)api('players/'+rated.player_id).then(pd=>{if(String(state.teamId)===String(id))drawTop(pd.goals,pd.assists)}).catch(()=>{});
  }else trb.innerHTML='';
  // ---------- Squad: Starting XI + danh sach theo vi tri ----------
  $('#team-squad-title').innerHTML=`Squad <span class="text-sm font-medium text-slate-400">· ${sq.length} players</span>`;
  const cnt={GK:0,DEF:0,MID:0,FWD:0};sq.forEach(p=>cnt[pos(p.position)]++);
  $('#team-position-counts').innerHTML=Object.entries(cnt).map(([k,v])=>`<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-brand-navy"><i class="w-1.5 h-1.5 rounded-full ${PCOL[k]}"></i>${k} ${v}</span>`).join('');
  // doi hinh xuat phat: 1 GK + 10 cau thu (nhieu tran da chinh / phut nhat), gioi han so nguoi moi tuyen
  const rank=(a,b)=>(b.matches_started||0)-(a.matches_started||0)||(b.minutes_played||0)-(a.minutes_played||0);
  const gk1=sq.filter(x=>pos(x.position)==='GK').sort(rank)[0],lim={DEF:5,MID:5,FWD:3},used={DEF:0,MID:0,FWD:0},xi=[];
  sq.filter(x=>pos(x.position)!=='GK').sort(rank).forEach(x=>{const k=pos(x.position);if(xi.length<10&&used[k]<lim[k]){used[k]++;xi.push(x)}});
  const starters=new Set([gk1,...xi].filter(Boolean).map(x=>x.player_id));
  const fm=$('#team-formation');if(fm)fm.textContent=`${used.DEF}-${used.MID}-${used.FWD}`;   // index.html cu chua co id nay
  if(sq.length&&sq.every(x=>x.shirt_number==null))console.warn('[Squad] API teams/'+id+' chua tra shirt_number -> vong tron dang hien chu viet tat. Hay them cot shirt_number vao query squad o server.');
  const num=p=>p.shirt_number!=null?p.shirt_number:cleanName(p.player_name).split(' ').pop().slice(0,3).toUpperCase();
  const lab=new Map(),xiAll=[...xi,...(gk1?[gk1]:[])],cs={};
  xiAll.forEach(p=>{const k=surname(p.player_name);cs[k]=(cs[k]||0)+1});
  xiAll.forEach(p=>{const k=surname(p.player_name);lab.set(p.player_id,cs[k]>1?cleanName(p.player_name)[0]+'. '+k:k)});
  const row=l=>l.length?`<div class="flex justify-around">${l.map(p=>`<div class="group clickable relative hover:z-20 text-center w-[84px]" onclick="openPlayer(${p.player_id})"><div class="w-10 h-10 mx-auto rounded-full ${PCOL[pos(p.position)]} border-[3px] border-white text-white text-sm font-extrabold flex items-center justify-center shadow-md transition-transform duration-150 ease-out group-hover:scale-[1.2] group-hover:shadow-lg">${num(p)}</div><p class="text-xs font-bold leading-tight mt-1 text-white drop-shadow">${lab.get(p.player_id)}</p></div>`).join('')}</div>`:'';
  $('#team-pitch-lineup').innerHTML=['FWD','MID','DEF'].map(k=>row(xi.filter(x=>pos(x.position)===k))).join('')+row(gk1?[gk1]:[]);
  // danh sach theo vi tri
  const cell=(v,l,c)=>`<div class="text-center px-3"><p class="text-[17px] font-extrabold leading-5 tabular-nums slashed-zero ${c}">${v}</p><p class="text-[9px] font-semibold tracking-wide text-slate-400">${l}</p></div>`;
  const nv=v=>v==null?'–':v,age=p=>p.birth?ageOf(p.birth):null;
  const card=p=>{const k=pos(p.position),a=age(p)??AGE[p.player_id],r=Number(p.avg_rating||0).toFixed(1);
    return `<div class="clickable ${CARD} rounded-xl px-4 py-3 flex items-center gap-4" onclick="openPlayer(${p.player_id})">
      <div class="w-10 h-10 shrink-0 rounded-full ${PCOL[k]} text-white text-base font-extrabold flex items-center justify-center">${num(p)}</div>
      <div class="min-w-0 flex-1"><p class="text-sm font-extrabold leading-5 text-brand-navy break-words" title="${cleanName(p.player_name)}">${shortFull(p.player_name)}${starters.has(p.player_id)?'<span class="inline-block w-2 h-2 ml-1.5 rounded-full bg-emerald-700 align-middle" title="Starting XI"></span>':''}</p><p class="text-xs text-slate-400 mt-0.5" data-age="${p.player_id}">${a!=null?a+' yrs':''}</p></div>
      <div class="flex items-center divide-x divide-slate-100 shrink-0">${k==='GK'?cell('–','GK','text-amber-600'):cell(nv(p.goals),'G','text-red-600')+cell(nv(p.assists),'A','text-brand-navy')}${cell(r,'RTG','text-emerald-700')}</div></div>`};
  const gsort=(a,b)=>(starters.has(b.player_id)-starters.has(a.player_id))||rank(a,b);
  let grp=$('#team-squad-groups');     // index.html cu chua co khung nay -> tu tao ngay duoi san bong
  if(!grp){grp=document.createElement('div');grp.id='team-squad-groups';grp.className='space-y-5 pt-3';
    const host=$('#team-pitch-lineup').closest('.pitch-container')||$('#team-pitch-lineup').parentNode;host.parentNode.insertBefore(grp,host.nextSibling)}
  grp.innerHTML=['GK','DEF','MID','FWD'].map(k=>{const g=sq.filter(x=>pos(x.position)===k).sort(gsort);
    return g.length?`<div><div class="flex items-center gap-2 mb-2"><span class="w-1 h-4 rounded ${PCOL[k]}"></span><h4 class="text-xs font-bold text-brand-navy">${GNAME[k]}</h4><span class="text-[11px] text-slate-400">· ${g.length}</span></div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">${g.map(card).join('')}</div></div>`:''}).join('');
  // API squad khong tra birth -> lay tung cau thu (players/:id) mot lan roi dien tuoi vao dong "xx yrs"
  sq.filter(p=>!p.birth&&AGE[p.player_id]==null).forEach(p=>api('players/'+p.player_id).then(d=>{
    if(!d||!d.birth)return;AGE[p.player_id]=ageOf(d.birth);
    const el=document.querySelector(`[data-age="${p.player_id}"]`);if(el)el.textContent=AGE[p.player_id]+' yrs'}).catch(()=>{}));
  syncStamp('teams');
})}

// ---------- Players ----------

// Top 10 (Scorers / Assists / Rated): tu goi API, mo trong modal; bam 1 dong -> trang chi tiet cau thu
const TOPCFG=[['goals','text-red-600','Top 10 Scorers'],['assists','text-brand-navy','Top 10 Assists'],['avg_rating','text-emerald-700','Top 10 Rated']];
async function openTop(i){guard(async()=>{
  const [k,col,head]=TOPCFG[i],fmt=v=>k==='avg_rating'?Number(v).toFixed(2):v;
  const all=(await api('players?q=')).players||[];
  const top=all.filter(x=>x[k]!=null&&!isNaN(x[k])).sort((a,b)=>(b[k]-a[k])||((b.goals||0)-(a.goals||0))).slice(0,10);
  $('#modal-match-stage').textContent=head;
  $('#modal-match-body').innerHTML=top.length?`<div class="divide-y divide-slate-100">${top.map((x,j)=>`<div class="clickable flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50" data-pid="${x.player_id}"><span class="w-6 text-center text-sm font-bold text-slate-400">${j<3?['🥇','🥈','🥉'][j]:j+1}</span>${flag(x.team_name,'w-8 h-5')}<span class="flex-1 min-w-0"><b class="text-sm text-brand-navy">${x.player_name}</b> <span class="text-[10px] px-1.5 rounded bg-red-50 text-red-600 font-bold">${pos(x.position)}</span><br><span class="text-[11px] text-slate-400">${x.team_name}</span></span><span class="text-2xl font-extrabold tabular-nums ${col}">${fmt(x[k])}</span></div>`).join('')}</div>`:empty('No data.');
  $('#match-modal').classList.remove('hidden');
})}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-top]');if(t)return openTop(+t.dataset.top);
  const r=e.target.closest('[data-pid]');if(r){$('#match-modal').classList.add('hidden');openPlayer(+r.dataset.pid)}
});

let ptm;$('#player-search-input').oninput=()=>{clearTimeout(ptm);ptm=setTimeout(loadPlayers,250)};
async function loadPlayers(){guard(async()=>{
  const d=await api('players?q='+encodeURIComponent($('#player-search-input').value)),p=d.players;

  $('#players-subtitle').textContent=`Golden Boot leaderboard · Top ${p.length} of ${d.total} players`;
  $('#players-tbody').innerHTML=p.map((x,i)=>`<tr class="clickable hover:bg-slate-50" onclick="openPlayer(${x.player_id})"><td class="py-3 px-4 text-slate-400 font-bold">${i<3?['🥇','🥈','🥉'][i]:i+1}</td>
   <td class="py-3 px-4"><span class="inline-flex items-center gap-2.5">${flag(x.team_name,'w-8 h-5')}<span><b class="text-sm text-brand-navy">${x.player_name}</b> <span class="text-[10px] px-1.5 rounded bg-red-50 text-red-600 font-bold">${pos(x.position)}</span><br><span class="text-[11px] text-slate-400">${x.team_name}</span></span></span></td>
   <td class="text-center font-extrabold text-red-600 text-base">${x.goals}</td><td class="text-center font-bold text-brand-navy">${x.assists}</td><td class="text-center text-slate-500">${nz(x.shots)}</td>
   <td class="text-center text-slate-500">${x.goals?Math.round(x.minutes_played/x.goals)+"'":'-'}</td><td class="text-center font-bold text-emerald-600">${nz(x.avg_rating)}</td></tr>`).join('');
  const best=(k,l)=>[...p].sort((a,b)=>(b[k]||0)-(a[k]||0))[0];
  // $('#players-podium-grid').innerHTML=p.length?[['TOP SCORER','goals'],['TOP ASSISTS','assists'],['TOP RATED','avg_rating']].map(([l,k])=>{const x=best(k);return `<div class="${CARD} p-5 text-center clickable" onclick="openPlayer(${x.player_id})"><p class="text-[10px] font-bold tracking-wider text-slate-400">${l}</p><p class="text-sm font-bold mt-1">${x.player_name}</p><p class="text-[11px] text-slate-400">${x.team_name}</p><p class="text-3xl font-extrabold text-brand-navy mt-1">${x[k]}</p></div>`}).join(''):'';
  const stat3=x=>`<div class="flex items-end justify-center gap-6 mt-4 pt-4 border-t border-slate-100">${[['GOALS',x.goals,'text-red-600'],['ASSISTS',x.assists,'text-brand-navy'],['RATING',x.avg_rating==null||isNaN(x.avg_rating)?null:Number(x.avg_rating).toFixed(1),'text-emerald-700']].map(([l,v,c])=>`<div class="text-center"><p class="text-2xl font-extrabold font-mono tabular-nums leading-7 ${c}">${nz(v)}</p><p class="text-[11px] font-semibold tracking-wider text-slate-500">${l}</p></div>`).join('')}</div>`;
    $('#players-podium-grid').innerHTML=p.length?[['TOP SCORER','goals'],['TOP ASSISTS','assists'],['TOP RATED','avg_rating']].map(([l,k],i)=>{const x=best(k);return `<div class="${CARD} p-5 text-center clickable" data-top="${i}"><p class="text-[11px] font-bold tracking-wider text-slate-400">${l}</p><div class="mt-2">${medalN(i)}</div><div class="flex justify-center mt-2">${flag(x.team_name,'w-12 h-8','text-base')}</div><p class="text-base font-extrabold text-brand-navy mt-3">${x.player_name}</p><p class="text-xs text-slate-400">${x.team_name}</p>${stat3(x)}</div>`}).join(''):'';
  syncStamp('players');
})}

async function openPlayer(id,push=true){guard(async()=>{
  const p=await api('players/'+id);if(p.shirt_number==null)p.shirt_number=SHIRTS[id];if(push)history.pushState(null,'','/playerstats/'+id);show('player-detail');
  const age=p.birth?Math.floor((Date.now()-new Date(p.birth))/31557600000):null;
  $('#player-detail-hero').innerHTML=`<div class="flex items-center gap-5">${flag(p.team_name,'w-20 h-14 border-4 border-white rounded-lg')}<div><p class="text-[11px] tracking-wider text-blue-200">${pos(p.position)} · ${p.team_name}</p><h2 class="text-3xl font-extrabold">${shirt(p)}${p.player_name}</h2><p class="text-xs text-blue-200">${nz(p.club_team)}${age?' · '+age+' yrs':''}${p.height_cm?' · '+p.height_cm+' cm':''}</p></div></div><div class="text-sm text-right">Caps: <b>${nz(p.caps)}</b><br>Goals for country: <b>${nz(p.goals_for_country)}</b></div>`;
  $('#player-detail-kpis').innerHTML=[['GOALS',p.goals],['ASSISTS',p.assists],['MATCHES',p.matches_played],['MINUTES',p.minutes_played],['RATING',p.avg_rating]].map(([l,v])=>`<div class="${CARD} p-4"><p class="text-[10px] font-bold tracking-wider text-slate-400">${l}</p><p class="text-3xl font-extrabold text-brand-navy">${nz(v)}</p></div>`).join('');
  const b=(l,v,max,suf='')=>`<div><div class="flex justify-between text-xs"><span>${l}</span><b>${nz(v)}${suf}</b></div><div class="h-2 bg-slate-100 rounded mt-1"><i class="block h-full rounded bg-brand-navy" data-w="${Math.min(100,100*(v||0)/max)}" style="width:0"></i></div></div>`;
  $('#player-detail-bars').innerHTML=b('Shot accuracy',p.shots?Math.round(100*p.shots_on_target/p.shots):0,100,'%')+b('Starter rate',p.matches_played?Math.round(100*p.matches_started/p.matches_played):0,100,'%')+b('Goals per match',p.matches_played?+(p.goals/p.matches_played).toFixed(2):0,2)+b('Yellow / red cards',(p.yellow_cards||0)+(p.red_cards||0),10)+b('Avg rating',p.avg_rating,10);
  $('#player-detail-footer-id').textContent=`Player ID #${p.player_id} · Data from SQL Server`;
})}

// ---------- Manage Data: them doi / them cau thu ----------
const INP='w-full mt-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-600';
const fld=(id,l,type='text',ex='')=>`<label class="block"><span class="text-[11px] font-semibold text-slate-500">${l}</span><input id="${id}" type="${type}" ${ex} class="${INP}"></label>`;
const sel=(id,l,opts)=>`<label class="block"><span class="text-[11px] font-semibold text-slate-500">${l}</span><select id="${id}" class="${INP}">${opts}</select></label>`;
const opt=(a,ph)=>`<option value="">${ph}</option>`+a.map(x=>typeof x==='object'?`<option value="${x.v}">${x.l}</option>`:`<option>${x}</option>`).join('');
const btn=(label,msgId)=>`<div class="col-span-2 flex items-center gap-3 pt-1"><button class="px-5 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:opacity-90 transition">${label}</button><span id="${msgId}" class="text-xs"></span></div>`;
// ---- Thong bao thanh cong: toast co icon ve dan + vien sang quanh card. Loai theo chu cai dau cua id: m=Add, u=Update, d=Delete ----
const TOAST={
  a:{label:'Added successfully',c:'#059669',icon:'<path pathLength="1" d="M5 12.5l4.5 4.5L19 7.5"/>'},
  u:{label:'Updated successfully',c:'#1E40AF',icon:'<path pathLength="1" d="M20 11a8 8 0 0 0-14.5-3.5M4 4v4h4"/><path pathLength="1" d="M4 13a8 8 0 0 0 14.5 3.5M20 20v-4h-4"/>'},
  d:{label:'Deleted successfully',c:'#dc2626',icon:'<path pathLength="1" d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'}};
function toast(msg,kind){
  let box=$('#toast-box');if(!box){box=document.createElement('div');box.id='toast-box';document.body.appendChild(box)}
  const t=TOAST[kind]||TOAST.a,el=document.createElement('div');
  el.className='toast';el.style.setProperty('--tc',t.c);
  el.innerHTML=`<svg class="toast-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg><div class="min-w-0"><p class="toast-title">${t.label}</p><p class="toast-msg"></p></div><i class="toast-bar"></i>`;
  el.querySelector('.toast-msg').textContent=msg;
  box.appendChild(el);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),300)},3200);
}
const say=(id,msg,ok)=>{const el=$('#'+id);el.textContent=msg;el.className='text-xs font-semibold '+(ok?'text-emerald-600':'text-red-600');
  if(!ok)return;
  const k=({m:'a',u:'u',d:'d'})[id[0]]||'a';toast(msg,k);
  const card=el.closest('.rounded-xl');                       // card chop vien sang mau tuong ung
  if(card){card.style.setProperty('--tc',TOAST[k].c);card.classList.remove('card-success');void card.offsetWidth;card.classList.add('card-success')}};
const post=async(u,body)=>{const r=await fetch('/api/'+u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||r.status);return d};
const val=id=>$('#'+id).value.trim();
const note=t=>`<p class="col-span-2 text-[11px] text-slate-400">${t}</p>`;

const mbtn=(label,msgId)=>`<div class="mt-auto pt-5 flex items-center gap-3"><button class="px-5 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:opacity-90 transition">${label}</button><span id="${msgId}" class="text-xs"></span></div>`;
const GRID2='grid grid-cols-2 gap-x-4 gap-y-3', full=h=>`<div class="col-span-2">${h}</div>`;
const PLAYER_HINT='';

function loadManage(){return guard(async()=>{
  const [teams,groups,lk,nid]=await Promise.all([api('teams'),api('groups'),api('lookups'),api('next-ids')]);state.teams=teams;   // lam moi cache + ID ke tiep
  const idx=v=>`min="1" step="1" value="${v}"`;
  const teamOpts=opt(teams.map(t=>({v:t.team_id,l:`${t.team_name} (Group ${t.groupp})`})),'-- choose team --');

  // --- Add Team: ID|Code, Name, Group|Conf, Rank|Elo, Coach ---
  $('#form-add-team').innerHTML=`<div class="${GRID2}">`+
    fld('mt-id','Team ID *','number',idx(nid.team_id))+fld('mt-code','FIFA code *','text','maxlength="3" style="text-transform:uppercase"')+
    full(fld('mt-name','Team name *'))+
    sel('mt-group','Group *',opt(groups,'-- choose group --'))+sel('mt-conf','Confederation *',opt(['AFC','CAF','CONCACAF','CONMEBOL','OFC','UEFA'],'-- choose confederation --'))+
    fld('mt-rank','FIFA ranking','number','min="1"')+fld('mt-elo','Elo rating','number','step="0.1" min="0"')+
    full(fld('mt-coach','Coach'))+
    ``+`</div>`+mbtn('Add team','mt-msg');
  $('#form-add-team').onsubmit=async e=>{e.preventDefault();
    try{
      const t=await post('teams',{team_id:val('mt-id'),team_name:val('mt-name'),fifa_code_name:val('mt-code'),groupp:val('mt-group'),confederation:val('mt-conf'),
        fifa_ranking_per_tournament:val('mt-rank'),elo_rating:val('mt-elo'),coach_name:val('mt-coach')});
      await loadManage();say('mt-msg',`Added ${t.team_name} (ID ${t.team_id})`,true);
    }catch(err){say('mt-msg',err.message,false)}};

  // --- Add Player: Team|ID, Name, Pos|Shirt, Club|Birth, Height|Caps, Goals|Value ---
  $('#form-add-player').innerHTML=`<div class="${GRID2}">`+
    sel('mp-team','Team *',teamOpts)+fld('mp-id','Player ID *','number',idx(nid.player_id))+
    full(fld('mp-name','Player name *'))+
    sel('mp-pos','Position *',opt(['Goalkeeper','Defender','Midfielder','Forward'],'-- choose position --'))+fld('mp-shirt','Shirt number','number','min="1" max="99"')+
    fld('mp-club','Club')+fld('mp-birth','Birth date','date')+
    fld('mp-height','Height (cm)','number','min="0"')+fld('mp-caps','Caps','number','min="0"')+
    fld('mp-gfc','Goals for country','number','min="0"')+fld('mp-mv','Market value (EUR)','number','min="0"')+
    `<p id="mp-hint" class="col-span-2 text-[11px] text-slate-400 empty:hidden">${PLAYER_HINT}</p>`+`</div>`+mbtn('Add player','mp-msg');
  $('#mp-team').onchange=async()=>{const id=$('#mp-team').value,h=$('#mp-hint');
    if(!id){h.textContent=PLAYER_HINT;return}
    try{const d=await api('teams/'+id);h.textContent=`Squad currently has ${d.squad.length}/26 players`}catch(e){h.textContent=PLAYER_HINT}};
  $('#form-add-player').onsubmit=async e=>{e.preventDefault();const tid=val('mp-team');
    try{
      const p=await post('players',{player_id:val('mp-id'),team_id:tid,player_name:val('mp-name'),position:val('mp-pos'),shirt_number:val('mp-shirt'),club_team:val('mp-club'),
        birth:val('mp-birth'),height_cm:val('mp-height'),caps:val('mp-caps'),goals_for_country:val('mp-gfc'),market_eur:val('mp-mv')});
      await loadManage();$('#mp-team').value=tid;await $('#mp-team').onchange();     // giu nguyen doi dang chon de nhap tiep
      say('mp-msg',`Added ${p.player_name} to ${p.team_name} (ID ${p.player_id})`,true);
    }catch(err){say('mp-msg',err.message,false)}};

  // --- Add Match: day ngang, luoi 4 cot x 3 hang ---
  $('#form-add-match').innerHTML=`<div class="grid grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-3">`+
    fld('mm-id','Match ID *','number',idx(nid.match_id))+fld('mm-date','Date *','date')+fld('mm-time','Kickoff time (UTC) *','time')+
    sel('mm-status','Status *',opt(['Scheduled','Live','Completed'],'-- choose status --'))+
    sel('mm-stage','Stage *',opt(lk.stages.map(x=>({v:x.stage_id,l:x.stage_name})),'-- choose stage --'))+
    `<div class="col-span-2">${sel('mm-stadium','Stadium *',opt(lk.stadiums.map(x=>({v:x.stadium_id,l:`${x.stadium_name} – ${x.city}`})),'-- choose stadium --'))}</div>`+
    sel('mm-ref','Referee *',opt(lk.referees.map(x=>({v:x.referee_id,l:`${x.referee_name} (${x.country})`})),'-- choose referee --'))+
    sel('mm-home','Home team *',teamOpts)+sel('mm-away','Away team *',teamOpts)+
    fld('mm-hs','Home score','number','min="0"')+fld('mm-as','Away score','number','min="0"')+
    ``+`</div>`+mbtn('Add match','mm-msg');
  $('#mm-status').value='Scheduled';
  $('#form-add-match').onsubmit=async e=>{e.preventDefault();
    try{const m=await post('matches',{match_id:val('mm-id'),datee:val('mm-date'),kickoff_time_utc:val('mm-time'),stage_id:val('mm-stage'),stadium_id:val('mm-stadium'),
        home_team_id:val('mm-home'),away_team_id:val('mm-away'),referee_id:val('mm-ref'),statuss:val('mm-status'),home_score:val('mm-hs'),away_score:val('mm-as')});
      lastMatchesHash='';await loadManage();say('mm-msg',`Added match #${m.match_id}: ${m.home_team_name} vs ${m.away_team_name}`,true);
    }catch(err){say('mm-msg',err.message,false)}};
})}

// ---------- Delete Data: xoa doi (kem ca cau thu) / xoa cau thu ----------
const del=async u=>{const r=await fetch('/api/'+u,{method:'DELETE'});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||r.status);return d};
const chip=(l,v)=>`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">${l} <b class="text-brand-navy">${v}</b></span>`;
const forceBox=(id,text)=>`<label class="flex items-start gap-2 text-xs text-red-600 font-semibold"><input id="${id}" type="checkbox" class="mt-0.5"><span>${text}</span></label>`;

const dbtn2=(label,id,msgId)=>`<div class="mt-auto pt-5 flex items-center gap-3"><button id="${id}" disabled class="px-5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed">${label}</button><span id="${msgId}" class="text-xs"></span></div>`;
const infoBox=(id)=>`<div id="${id}-info" class="text-xs text-slate-500 space-y-1.5 mt-3"></div><div id="${id}-force-wrap" class="mt-3"></div>`;
const matchLabel=m=>`#${m.match_id} · ${fmtD(m.datee)} · ${m.home_team_name} vs ${m.away_team_name} · ${m.stage_name||''}${m.statuss?' · '+m.statuss:''}`;

function loadDelete(){return guard(async()=>{
  const [teams,{matches}]=await Promise.all([api('teams'),api('matches')]);state.teams=teams;
  const tOpts=opt(teams.map(t=>({v:t.team_id,l:`${t.team_name} (Group ${t.groupp})`})),'-- choose team --');
  const ms=[...matches].sort((a,b)=>(iso(a.datee)+fmtT(a.kickoff_time_utc)).localeCompare(iso(b.datee)+fmtT(b.kickoff_time_utc)));

  // --- 1) Xoa cau thu ---
  $('#form-delete-player').innerHTML=`<div class="${GRID2}">`+sel('dp-team','Team *',tOpts)+sel('dp-player','Player *',opt([],'-- choose team first --'))+`</div>`+infoBox('dp')+dbtn2('Delete player','dp-btn','dp-msg');
  $('#dp-team').onchange=async()=>{
    const id=$('#dp-team').value;$('#dp-info').innerHTML='';$('#dp-force-wrap').innerHTML='';$('#dp-msg').textContent='';$('#dp-btn').disabled=true;
    if(!id){$('#dp-player').innerHTML=opt([],'-- choose team first --');return}
    try{const d=await api('teams/'+id),ps=[...d.squad].sort((a,b)=>a.player_name.localeCompare(b.player_name));
      $('#dp-player').innerHTML=opt(ps.map(p=>({v:p.player_id,l:`${p.shirt_number!=null?'#'+p.shirt_number+' ':''}${cleanName(p.player_name)} (${p.position})`})),'-- choose player --');
    }catch(err){$('#dp-info').textContent=err.message}};
  $('#dp-player').onchange=async()=>{
    const id=$('#dp-player').value;$('#dp-info').innerHTML='';$('#dp-force-wrap').innerHTML='';$('#dp-msg').textContent='';$('#dp-btn').disabled=!id;
    if(!id)return;
    try{const d=await api(`players/${id}/impact`);
      $('#dp-info').innerHTML=`<p>Data that will be deleted with this player:</p><div class="flex flex-wrap gap-1.5">${chip('Events',d.events)}${chip('Lineups',d.lineups)}${chip('Man of the Match',d.pom)}</div>`;
      if(d.events||d.lineups||d.pom)$('#dp-force-wrap').innerHTML=forceBox('dp-force','This player already has match data. Also delete the related events, appearances and Man of the Match awards');
    }catch(err){$('#dp-info').textContent=err.message}};
  $('#form-delete-player').onsubmit=async e=>{e.preventDefault();
    const tid=val('dp-team'),id=val('dp-player');if(!id)return;
    const name=$('#dp-player').selectedOptions[0].textContent,force=$('#dp-force')?.checked;
    if(!confirm(`Delete player "${name}"?\nThis cannot be undone.`))return;
    try{const r=await del(`players/${id}`+(force?'?force=1':''));
      await loadDelete();$('#dp-team').value=tid;await $('#dp-team').onchange();     // giu doi dang chon de xoa tiep
      say('dp-msg',`Deleted ${cleanName(r.player_name)}`,true);
    }catch(err){say('dp-msg',err.message,false)}};

  // --- 2) Xoa doi (kem ca cau thu) ---
  $('#form-delete-team').innerHTML=sel('dt-team','Team *',tOpts)+infoBox('dt')+dbtn2('Delete team','dt-btn','dt-msg');
  $('#dt-team').onchange=async()=>{
    const id=$('#dt-team').value,info=$('#dt-info');$('#dt-force-wrap').innerHTML='';$('#dt-msg').textContent='';$('#dt-btn').disabled=!id;
    if(!id){info.innerHTML='';return}
    try{const d=await api(`teams/${id}/impact`);
      info.innerHTML=`<p>Data that will be deleted with this team:</p><div class="flex flex-wrap gap-1.5">${chip('Players',d.players)}${chip('Matches',d.matches)}${chip('Events',d.events)}${chip('Lineups',d.lineups)}${chip('Match stats',d.stats)}</div>`;
      if(d.matches||d.events||d.lineups||d.stats)$('#dt-force-wrap').innerHTML=forceBox('dt-force',`This team already has ${d.matches} matches. Also delete its matches and all related data (events, lineups, statistics)`);
    }catch(err){info.textContent=err.message}};
  $('#form-delete-team').onsubmit=async e=>{e.preventDefault();
    const id=val('dt-team');if(!id)return;
    const name=$('#dt-team').selectedOptions[0].textContent,force=$('#dt-force')?.checked;
    if(!confirm(`Delete team "${name}" and ALL of its players?\nThis cannot be undone.`))return;
    try{const r=await del(`teams/${id}`+(force?'?force=1':''));
      if(state.teamId===+id)state.teamId=null;lastMatchesHash='';
      await loadDelete();say('dt-msg',`Deleted ${r.team_name} and ${r.players} players`+(r.matches?` and ${r.matches} matches`:''),true);
    }catch(err){say('dt-msg',err.message,false)}};

  // --- 3) Xoa tran dau ---
  $('#form-delete-match').innerHTML=`<div class="grid grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-3"><div class="col-span-full">${sel('dm-match','Match *',opt(ms.map(m=>({v:m.match_id,l:matchLabel(m)})),'-- choose match --'))}</div></div>`+infoBox('dm')+dbtn2('Delete match','dm-btn','dm-msg');
  $('#dm-match').onchange=async()=>{
    const id=$('#dm-match').value,info=$('#dm-info');$('#dm-force-wrap').innerHTML='';$('#dm-msg').textContent='';$('#dm-btn').disabled=!id;
    if(!id){info.innerHTML='';return}
    try{const d=await api(`matches/${id}/impact`);
      info.innerHTML=`<p>Data that will be deleted with this match:</p><div class="flex flex-wrap gap-1.5">${chip('Events',d.events)}${chip('Lineups',d.lineups)}${chip('Team stats',d.stats)}</div>`;
      if(d.events||d.lineups||d.stats)$('#dm-force-wrap').innerHTML=forceBox('dm-force','This match already has events, lineups or statistics. Also delete all of that related data');
    }catch(err){info.textContent=err.message}};
  $('#form-delete-match').onsubmit=async e=>{e.preventDefault();
    const id=val('dm-match');if(!id)return;
    const name=$('#dm-match').selectedOptions[0].textContent,force=$('#dm-force')?.checked;
    if(!confirm(`Delete match "${name}"?\nThis cannot be undone.`))return;
    try{const r=await del(`matches/${id}`+(force?'?force=1':''));
      lastMatchesHash='';
      await loadDelete();say('dm-msg',`Deleted match #${r.match_id}: ${r.home_team_name} vs ${r.away_team_name}`,true);
    }catch(err){say('dm-msg',err.message,false)}};
})}

// ---------- Update Data: sua ket qua tran / doi / cau thu ----------
const put=async(u,body)=>{const r=await fetch('/api/'+u,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||r.status);return d};
const setVal=(id,v)=>{$('#'+id).value=v==null?'':v};
const setSelVal=(id,v)=>{const el=$('#'+id);v=v==null?'':String(v);if(v&&![...el.options].some(o=>o.value===v))el.add(new Option(v,v));el.value=v};  // gia tri cu khong co trong danh sach -> them vao

const ubtn2=(label,id,msgId)=>`<div class="mt-auto pt-5 flex items-center gap-3"><button id="${id}" disabled class="px-5 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed">${label}</button><span id="${msgId}" class="text-xs"></span></div>`;

function loadUpdate(){return guard(async()=>{
  const [teams,groups,{matches}]=await Promise.all([api('teams'),api('groups'),api('matches')]);state.teams=teams;
  const tOpts=opt(teams.map(t=>({v:t.team_id,l:`${t.team_name} (Group ${t.groupp})`})),'-- choose team --');
  const CONF=['AFC','CAF','CONCACAF','CONMEBOL','OFC','UEFA'];

  // --- 1) Cap nhat doi ---
  $('#form-update-team').innerHTML=`<div class="${GRID2}">`+full(sel('ut-team','Team *',tOpts))+
    sel('ut-group','Group *',opt(groups,'-- choose group --'))+sel('ut-conf','Confederation *',opt(CONF,'-- choose confederation --'))+
    fld('ut-rank','FIFA ranking','number','min="1"')+fld('ut-elo','Elo rating','number','step="0.1" min="0"')+
    full(fld('ut-coach','Coach'))+``+`</div>`+ubtn2('Save team','ut-btn','ut-msg');
  $('#ut-team').onchange=async()=>{
    const id=$('#ut-team').value;$('#ut-msg').textContent='';$('#ut-btn').disabled=!id;if(!id)return;
    try{const i=(await api('teams/'+id)).info;
      setSelVal('ut-group',i.groupp);setSelVal('ut-conf',i.confederation);setVal('ut-rank',i.fifa_ranking_per_tournament);setVal('ut-elo',i.elo_rating);setVal('ut-coach',i.coach_name);
    }catch(err){say('ut-msg',err.message,false)}};
  $('#form-update-team').onsubmit=async e=>{e.preventDefault();const id=val('ut-team');if(!id)return;
    try{const t=await put('teams/'+id,{groupp:val('ut-group'),confederation:val('ut-conf'),fifa_ranking_per_tournament:val('ut-rank'),elo_rating:val('ut-elo'),coach_name:val('ut-coach')});
      await loadUpdate();$('#ut-team').value=id;await $('#ut-team').onchange();say('ut-msg','Updated '+t.team_name,true);
    }catch(err){say('ut-msg',err.message,false)}};

  // --- 2) Cap nhat cau thu ---
  $('#form-update-player').innerHTML=`<div class="${GRID2}">`+sel('up-team','Team *',tOpts)+sel('up-player','Player *',opt([],'-- choose team first --'))+
    sel('up-pos','Position *',opt(['Goalkeeper','Defender','Midfielder','Forward'],'-- choose position --'))+fld('up-shirt','Shirt number','number','min="1" max="99"')+
    fld('up-club','Club')+fld('up-height','Height (cm)','number','min="0"')+
    fld('up-caps','Caps','number','min="0"')+fld('up-gfc','Goals for country','number','min="0"')+
    full(fld('up-mv','Market value (EUR)','number','min="0"'))+``+`</div>`+ubtn2('Save player','up-btn','up-msg');
  $('#up-team').onchange=async()=>{
    const id=$('#up-team').value;$('#up-msg').textContent='';$('#up-btn').disabled=true;
    if(!id){$('#up-player').innerHTML=opt([],'-- choose team first --');return}
    try{const d=await api('teams/'+id),ps=[...d.squad].sort((a,b)=>a.player_name.localeCompare(b.player_name));
      $('#up-player').innerHTML=opt(ps.map(p=>({v:p.player_id,l:`${p.shirt_number!=null?'#'+p.shirt_number+' ':''}${cleanName(p.player_name)} (${p.position})`})),'-- choose player --');
    }catch(err){say('up-msg',err.message,false)}};
  $('#up-player').onchange=async()=>{
    const id=$('#up-player').value;$('#up-msg').textContent='';$('#up-btn').disabled=!id;if(!id)return;
    try{const p=await api('players/'+id);
      setSelVal('up-pos',p.position);setVal('up-shirt',p.shirt_number);setVal('up-club',p.club_team);setVal('up-height',p.height_cm);
      setVal('up-caps',p.caps);setVal('up-gfc',p.goals_for_country);setVal('up-mv',p.market_eur);
    }catch(err){say('up-msg',err.message,false)}};
  $('#form-update-player').onsubmit=async e=>{e.preventDefault();const tid=val('up-team'),id=val('up-player');if(!id)return;
    try{const r=await put('players/'+id,{position:val('up-pos'),shirt_number:val('up-shirt'),club_team:val('up-club'),height_cm:val('up-height'),
        caps:val('up-caps'),goals_for_country:val('up-gfc'),market_eur:val('up-mv')});
      await loadUpdate();$('#up-team').value=tid;await $('#up-team').onchange();$('#up-player').value=id;await $('#up-player').onchange();
      say('up-msg','Updated '+cleanName(r.player_name),true);
    }catch(err){say('up-msg',err.message,false)}};

  // --- 3) Cap nhat ket qua tran (day ngang, luoi 4 cot) ---
  const key=m=>iso(m.datee)+' '+fmtT(m.kickoff_time_utc)+' '+String(m.match_id).padStart(6,'0');
  const ms=[...matches].sort((a,b)=>key(a).localeCompare(key(b)));
  const fillMatches=()=>{const only=$('#um-open').checked,cur=$('#um-match').value;
    $('#um-match').innerHTML=opt(ms.filter(m=>!only||!isFinished(m)).map(m=>({v:m.match_id,l:matchLabel(m)})),'-- choose match --');
    $('#um-match').value=cur};
  $('#form-update-match').innerHTML=`<div class="grid grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-3">`+
    `<label class="col-span-full flex items-center gap-2 text-xs text-slate-500"><input id="um-open" type="checkbox">Only show matches that are not completed yet</label>`+
    `<div class="col-span-full">${sel('um-match','Match *','')}<p id="um-title" class="text-xs font-bold text-brand-navy mt-1"></p></div>`+
    fld('um-hs','Home score','number','min="0"')+fld('um-as','Away score','number','min="0"')+
    sel('um-status','Status *',opt(['Scheduled','Live','Completed'],'-- choose status --'))+sel('um-rt','Result type',opt(['FT','AET','PEN'],'-- none --'))+
    fld('um-hxg','Home xG','number','step="0.01" min="0"')+fld('um-axg','Away xG','number','step="0.01" min="0"')+
    ``+`</div>`+ubtn2('Save match','um-btn','um-msg');
  fillMatches();$('#um-open').onchange=fillMatches;
  $('#um-match').onchange=async()=>{
    const id=$('#um-match').value;$('#um-msg').textContent='';$('#um-btn').disabled=!id;
    if(!id){$('#um-title').textContent='';return}
    try{const {match:m}=await api('matches/'+id);
      $('#um-title').textContent=`${m.home_team_name} vs ${m.away_team_name} · ${m.stage_name} · ${nz(m.stadium_name)}`;
      setVal('um-hs',m.home_score);setVal('um-as',m.away_score);setSelVal('um-status',m.statuss);setSelVal('um-rt',m.result_type);
      setVal('um-hxg',m.home_xg);setVal('um-axg',m.away_xg);
    }catch(err){say('um-msg',err.message,false)}};
  $('#form-update-match').onsubmit=async e=>{e.preventDefault();const id=val('um-match');if(!id)return;
    try{await put('matches/'+id,{home_score:val('um-hs'),away_score:val('um-as'),statuss:val('um-status'),result_type:val('um-rt'),home_xg:val('um-hxg'),away_xg:val('um-axg')});
      lastMatchesHash='';                                   // lan sau vao Match Results se ve lai
      await loadUpdate();$('#um-match').value=id;await $('#um-match').onchange();say('um-msg','Updated match #'+id,true);
    }catch(err){say('um-msg',err.message,false)}};
})}

// ---------- Router: moi trang mot duong dan rieng ----------
const PATH={matches:'/matches',tournament:'/standings',teams:'/teamstats',players:'/playerstats',manage:'/manage',delete:'/delete',update:'/update'};
const VIEW=Object.fromEntries(Object.entries(PATH).map(([v,u])=>[u.slice(1),v]));
function go(url,replace){history[replace?'replaceState':'pushState'](null,'',url);route()}
function route(){
  const [seg,id]=location.pathname.split('/').filter(Boolean),v=VIEW[seg];
  if(!v)return go('/matches',true);
  if(v==='players'&&id)return openPlayer(+id,false);
  if(v==='teams'&&id)state.teamId=+id;
  show(v);
}
addEventListener('popstate',route);
route();

// ---------- Thanh thong so: chay tu 0 -> gia tri khi vua hien ra ----------
new MutationObserver(()=>{
  const bars=document.querySelectorAll('[data-w]:not([data-done])');
  if(!bars.length)return;
  bars.forEach(el=>el.dataset.done='1');
  requestAnimationFrame(()=>requestAnimationFrame(()=>bars.forEach((el,i)=>{
    el.style.transitionDelay=Math.min(i,10)*40+'ms';   // le tung thanh
    el.style.width=el.dataset.w+'%';
  })));
}).observe(document.body,{childList:true,subtree:true});