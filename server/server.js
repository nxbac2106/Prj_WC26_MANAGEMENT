require('dotenv').config();
// JWT_SECRET bat buoc (toi thieu 32 ky tu) de token khong the doan — thieu thi thoat ngay
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('Loi cau hinh: JWT_SECRET thieu hoac ngan hon 32 ky tu. Them JWT_SECRET=<chuoi ngau nhien> vao server/.env');
  process.exit(1);
}
const express = require('express'), sql = require('mssql'), path = require('path'),
      jwt = require('jsonwebtoken'), bcrypt = require('bcryptjs'), cookieParser = require('cookie-parser');
const app = express(); app.set('trust proxy', 1);   // lay dung IP client khi server nam sau Nginx
// Bo cors(): frontend duoc phuc vu cung server nen khong can CORS; tat di de cookie dang nhap khong bi site khac loi dung
app.use(express.json()); app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

const cfg = { server: process.env.DB_SERVER, database: process.env.DB_NAME || 'WorldCup26_db',
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  options: { encrypt: false, trustServerCertificate: true } };
if (process.env.DB_PORT) cfg.port = +process.env.DB_PORT;
const pool = new sql.ConnectionPool(cfg);
const ready = pool.connect().then(() => console.log('Da ket noi SQL Server'))
  .catch(e => { console.error('Loi ket noi:', e.message); process.exit(1); });
const q = async (text, params = {}) => { await ready; const r = pool.request();
  for (const k in params) r.input(k, params[k]); return (await r.query(text)).recordset; };
// Goi stored procedure: params = { ten: gia_tri } hoac { ten: [sql.Type, gia_tri] }. Tra ve mang recordsets.
const exec = async (name, params = {}) => { await ready; const r = pool.request();
  for (const [k, v] of Object.entries(params)) Array.isArray(v) ? r.input(k, v[0], v[1]) : r.input(k, v);
  return (await r.execute(name)).recordsets; };
const sp = async (stage, group) => { await ready;
  const r = pool.request().input('stage_name', sql.NVarChar(50), stage);
  if (group) r.input('group', sql.NVarChar(50), group);
  return (await r.execute('sp_get_matches_stage')).recordset; };
// Loi nghiep vu tu procedure (THROW 50001) -> 400, "... not found" -> 404; cac loi khac -> 500
const spError = e => {
  if ((e.number || e.originalError?.info?.number) !== 50001) return e;
  const msg = e.message.replace(/(Run again with|Use) @force = 1[^.]*\.?/i, 'Tick the checkbox to also delete the related data.').trim();
  return Object.assign(new Error(msg), { status: /not found$/i.test(msg) ? 404 : 400 });
};
const wrap = fn => (req, res) => fn(req, res).catch(e => { e = spError(e); res.status(e.status || 500).json({ error: e.message }); });
const bad = m => Object.assign(new Error(m), { status: 400 });   // loi do nguoi dung nhap sai -> HTTP 400

// ---------- AUTH: JWT trong cookie httpOnly, chi admin moi duoc ghi du lieu ----------
const JWT_COOKIE = 'wc_token',
      COOKIE_OPTS = { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true',
        maxAge: (+(process.env.JWT_EXPIRES_HOURS || 8)) * 3600000 };
const jwtSign = u => jwt.sign({ id: u.user_id, username: u.username, role: u.role }, process.env.JWT_SECRET,
  { expiresIn: (+(process.env.JWT_EXPIRES_HOURS || 8)) + 'h' });
const jwtVerify = t => { try { return jwt.verify(t || '', process.env.JWT_SECRET); } catch { return null; } };

// Gioi han dang nhap sai theo IP (bo dem trong bo nho): sai du 5 lan trong cua so 10 phut -> chan den het cua so
const FAIL_WINDOW = 10 * 60 * 1000, FAIL_MAX = 5, loginFails = new Map();
const loginBlocked = ip => { const f = loginFails.get(ip); return f && f.lockUntil > Date.now(); };
const noteFail = ip => { const now = Date.now(); let f = loginFails.get(ip);
  if (!f || now - f.t0 > FAIL_WINDOW) f = { n: 0, t0: now };
  if (++f.n >= FAIL_MAX) f.lockUntil = f.t0 + FAIL_WINDOW;
  loginFails.set(ip, f); };

// Chi admin duoc di qua; khong co/sai token -> 401, token hop le nhung khong phai admin -> 403
const requireAdmin = (req, res, next) => { const p = jwtVerify(req.cookies[JWT_COOKIE]);
  if (!p) return res.status(401).json({ error: 'Login required' });
  if (p.role !== 'admin') return res.status(403).json({ error: 'Admin role required' });
  req.user = p; next(); };

// Chan TAT CA method ghi (POST/PUT/PATCH/DELETE) duoi /api, tru /api/auth/* -> khong the sot route ghi nao
app.use('/api', (req, res, next) => (req.method !== 'GET' && req.method !== 'HEAD' && !req.path.startsWith('/auth/')
  ? requireAdmin(req, res, next) : next()));

// Hash gia de luon bcrypt.compare 1 lan ca khi khong tim thay user -> thoi gian phan hoi khong lo username co ton tai
const FAKE_HASH = bcrypt.hashSync('wc26-timing-equalizer', 12);

app.post('/api/auth/login', wrap(async (req, res) => {
  const ip = req.ip;
  if (loginBlocked(ip)) throw Object.assign(new Error('Too many attempts, try again later'), { status: 429 });
  const username = str(req.body && req.body.username), password = String((req.body || {}).password ?? '');
  if (!username || !password) throw bad('Username and password are required');
  const [user] = await q('SELECT user_id, username, password_hash, role FROM users WHERE username = @u', { u: username });
  const ok = await bcrypt.compare(password, user ? user.password_hash : FAKE_HASH);
  if (!user || !ok) { noteFail(ip); throw Object.assign(new Error('Invalid username or password'), { status: 401 }); }
  loginFails.delete(ip);
  res.cookie(JWT_COOKIE, jwtSign(user), COOKIE_OPTS);
  res.json({ username: user.username, role: user.role });
}));

app.post('/api/auth/logout', (req, res) => { res.clearCookie(JWT_COOKIE); res.json({ ok: true }); });

app.get('/api/auth/me', (req, res) => { const p = jwtVerify(req.cookies[JWT_COOKIE]);
  p ? res.json({ username: p.username, role: p.role }) : res.status(401).json({ error: 'Login required' }); });

app.get('/api/stages', wrap(async (req, res) =>
  res.json((await q('SELECT stage_name FROM tournament_stages ORDER BY stage_id')).map(r => r.stage_name))));

// vw_match_results (+ match_id lay tu matches_detailed de mo chi tiet tran)
app.get('/api/matches', wrap(async (req, res) => res.json({ updatedAt: new Date(), matches: await q(
  `SELECT d.match_id, v.* FROM vw_match_results v JOIN matches_detailed d ON d.datee=v.datee
   AND d.kickoff_time_utc=v.kickoff_time_utc AND d.home_team_name=v.home_team_name AND d.away_team_name=v.away_team_name
   ORDER BY v.datee DESC, v.kickoff_time_utc DESC`) })));

app.get('/api/matches/:id', wrap(async (req, res) => {
  const id = +req.params.id;
  const [match] = await q(`SELECT d.*, m.home_team_id, m.away_team_id FROM matches_detailed d JOIN matches m ON m.match_id=d.match_id WHERE d.match_id=@id`, { id });
  if (!match) return res.status(404).json({ error: 'Not found' });
  const events = await q(`SELECT e.minutee, e.event_type, t.team_name, p.player_name FROM match_events e
    JOIN teams t ON t.team_id=e.team_id JOIN player_squads p ON p.player_id=e.player_id WHERE e.match_id=@id ORDER BY e.minutee`, { id });
  const stats = await q(`SELECT t.team_name, s.* FROM match_team_statistics s JOIN teams t ON t.team_id=s.team_id WHERE s.match_id=@id`, { id });
  res.json({ match, events, stats });
}));

app.get('/api/stage', wrap(async (req, res) => res.json(await sp(req.query.name))));
app.get('/api/groups', wrap(async (req, res) =>
  res.json((await q('SELECT DISTINCT groupp FROM teams WHERE groupp IS NOT NULL ORDER BY groupp')).map(r => r.groupp))));

app.get('/api/standings/:g', wrap(async (req, res) => { const g = req.params.g;
  res.json({ standings: await q(`SELECT *, wins+draws+loses AS played FROM dbo.fn_group_standings(@g) ORDER BY position, team_name`, { g }),
    matches: await sp('Group Stage', g) }); }));

app.get('/api/teams', wrap(async (req, res) =>
  res.json(await q('SELECT team_id, team_name, groupp FROM teams ORDER BY team_name'))));

app.get('/api/teams/:id', wrap(async (req, res) => {
  const id = +req.params.id;
  const [info] = await q('SELECT * FROM teams WHERE team_id=@id', { id });
  if (!info) return res.status(404).json({ error: 'Not found' });
  const [stats] = await q('SELECT * FROM vw_tournament_team_stats WHERE team_id=@id', { id });
  const n = info.team_name;
  const form = await q(`SELECT TOP 5 f.datee, f.outcome,
      CASE WHEN f.venue='Home' THEN @n ELSE f.opponent END home_team_name, CASE WHEN f.venue='Home' THEN f.opponent ELSE @n END away_team_name,
      CASE WHEN f.venue='Home' THEN f.goals_for ELSE f.goals_against END home_score, CASE WHEN f.venue='Home' THEN f.goals_against ELSE f.goals_for END away_score
    FROM dbo.fn_team_matches(@id) f ORDER BY f.datee DESC, f.kickoff_time_utc DESC`, { n, id });
  const squad = await q(`SELECT s.player_id, s.player_name, s.position, s.club_team, s.caps, t.shirt_number, t.matches_started, t.minutes_played, t.goals, t.assists, t.avg_rating
    FROM player_squads s LEFT JOIN player_tournament_statistics t ON t.player_id=s.player_id WHERE s.team_id=@id`, { id });
  const rated = squad.filter(p => p.avg_rating != null);
  res.json({ info, stats: stats || {}, form, squad, rating: rated.length ? +(rated.reduce((a, p) => a + p.avg_rating, 0) / rated.length).toFixed(2) : null });
}));

// Player Stats: vw_tournament_player_stats (+ shots tu bang goc)
app.get('/api/players', wrap(async (req, res) => {
  const s = '%' + (req.query.q || '') + '%';
  const players = await q(`SELECT TOP 20 v.*, st.shots FROM vw_tournament_player_stats v
    JOIN player_tournament_statistics st ON st.player_id=v.player_id
    WHERE v.player_name LIKE @s OR v.team_name LIKE @s ORDER BY v.goals DESC, v.assists DESC, v.avg_rating DESC`, { s });
  const [{ n }] = await q('SELECT COUNT(*) n FROM vw_tournament_player_stats');
  res.json({ total: n, players });
}));

app.get('/api/players/:id', wrap(async (req, res) => {
  const [p] = await q(`SELECT s.player_id, s.player_name, s.position, s.club_team, s.caps, s.birth, s.height_cm, s.goals_for_country, s.market_eur, dbo.fn_player_age(s.birth, GETDATE()) AS age, st.shirt_number, tm.team_name,
    st.matches_played, st.matches_started, st.minutes_played, st.goals, st.assists, st.shots, st.shots_on_target, st.yellow_cards, st.red_cards, st.avg_rating
    FROM player_squads s JOIN teams tm ON tm.team_id=s.team_id LEFT JOIN player_tournament_statistics st ON st.player_id=s.player_id
    WHERE s.player_id=@id`, { id: +req.params.id });
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
}));

// GET /api/next-ids : ID ke tiep (MAX+1) de dien san vao form Create Data (chi admin)
app.get('/api/next-ids', requireAdmin, wrap(async (req, res) => res.json((await q(`SELECT
  (SELECT ISNULL(MAX(team_id), 0) + 1 FROM teams) team_id,
  (SELECT ISNULL(MAX(player_id), 0) + 1 FROM player_squads) player_id,
  (SELECT ISNULL(MAX(match_id), 0) + 1 FROM matches) match_id`))[0])));

// ---------- Doc & ep kieu du lieu tu request (LUAT NGHIEP VU nam trong stored procedure) ----------
const num = v => (v === '' || v == null) ? null : Number(v);
const int = (v, label) => { const n = num(v); if (n != null && !Number.isInteger(n)) throw bad(label + ' must be an integer'); return n; };
const real = (v, label) => { const n = num(v); if (n != null && isNaN(n)) throw bad(label + ' must be a number'); return n; };
const str = v => String(v == null ? '' : v).trim();
const strOrNull = v => str(v) || null;

// POST /api/teams -> sp_add_team (team_id bo trong -> procedure tu cap MAX+1)
app.post('/api/teams', wrap(async (req, res) => {
  const b = req.body || {};
  const [team] = (await exec('sp_add_team', {
    team_id: int(b.team_id, 'Team ID'), team_name: str(b.team_name), fifa_code_name: str(b.fifa_code_name), groupp: str(b.groupp),
    confederation: str(b.confederation), fifa_ranking_per_tournament: int(b.fifa_ranking_per_tournament, 'FIFA ranking'),
    elo_rating: real(b.elo_rating, 'Elo rating'), coach_name: strOrNull(b.coach_name) }))[0];
  res.status(201).json(team);
}));

// POST /api/players -> sp_add_player (procedure nhan TEN doi, form gui team_id nen tra ten truoc)
app.post('/api/players', wrap(async (req, res) => {
  const b = req.body || {}, team_id = int(b.team_id, 'Team');
  if (team_id == null) throw bad('Missing required fields: team, player name, position');
  const [team] = await q('SELECT team_name FROM teams WHERE team_id=@t', { t: team_id });
  if (!team) throw bad('Team does not exist');
  const birth = b.birth ? new Date(b.birth + 'T00:00:00Z') : null;
  if (birth && isNaN(birth)) throw bad('Invalid birth date');
  const [[player]] = await exec('sp_add_player', {
    player_id: int(b.player_id, 'Player ID'), team_name: team.team_name, player_name: str(b.player_name), position: str(b.position),
    club_team: strOrNull(b.club_team), market_eur: int(b.market_eur, 'Market value'), caps: int(b.caps, 'Caps'), birth: [sql.Date, birth],
    height_cm: int(b.height_cm, 'Height'), goals_for_country: int(b.goals_for_country, 'Goals for country'), shirt_number: int(b.shirt_number, 'Shirt number') });
  res.status(201).json({ player_id: player.player_id, player_name: player.player_name, team_id, team_name: team.team_name });
}));

// ---------- DELETE: xoa cau thu / xoa doi (cascade) ----------
const T_MATCHES = '(SELECT match_id FROM matches WHERE home_team_id=@id OR away_team_id=@id)',
      T_PLAYERS = '(SELECT player_id FROM player_squads WHERE team_id=@id)';

// Dem so dong se bi anh huong khi xoa 1 doi
const teamImpact = async id => (await q(`SELECT
  (SELECT COUNT(*) FROM player_squads WHERE team_id=@id) players,
  (SELECT COUNT(*) FROM matches WHERE home_team_id=@id OR away_team_id=@id) matches,
  (SELECT COUNT(*) FROM match_events WHERE team_id=@id OR player_id IN ${T_PLAYERS} OR match_id IN ${T_MATCHES}) events,
  (SELECT COUNT(*) FROM match_team_lineups WHERE team_id=@id OR player_id IN ${T_PLAYERS} OR match_id IN ${T_MATCHES}) lineups,
  (SELECT COUNT(*) FROM match_team_statistics WHERE team_id=@id OR match_id IN ${T_MATCHES}) stats`, { id }))[0];

const playerImpact = async id => (await q(`SELECT
  (SELECT COUNT(*) FROM match_events WHERE player_id=@id) events,
  (SELECT COUNT(*) FROM match_team_lineups WHERE player_id=@id) lineups,
  (SELECT COUNT(*) FROM matches WHERE player_of_the_match_id=@id) pom`, { id }))[0];

// GET /api/teams/:id/impact : xem truoc se xoa bao nhieu du lieu (chi admin)
app.get('/api/teams/:id/impact', requireAdmin, wrap(async (req, res) => {
  const id = +req.params.id;
  if (!(await q('SELECT 1 x FROM teams WHERE team_id=@id', { id })).length) return res.status(404).json({ error: 'Team not found' });
  res.json(await teamImpact(id));
}));

// DELETE /api/teams/:id[?force=1] -> sp_delete_team (xoa doi + TAT CA cau thu; da co tran dau thi can force=1)
app.delete('/api/teams/:id', wrap(async (req, res) => {
  const [[r]] = await exec('sp_delete_team', { team_id: +req.params.id, force: [sql.Bit, req.query.force === '1' ? 1 : 0] });
  res.json({ team_name: r.team_name, players: r.players_deleted, matches: r.matches_deleted });
}));

// GET /api/players/:id/impact (chi admin)
app.get('/api/players/:id/impact', requireAdmin, wrap(async (req, res) => {
  const id = +req.params.id;
  if (!(await q('SELECT 1 x FROM player_squads WHERE player_id=@id', { id })).length) return res.status(404).json({ error: 'Player not found' });
  res.json(await playerImpact(id));
}));

// DELETE /api/players/:id[?force=1] -> sp_delete_player
app.delete('/api/players/:id', wrap(async (req, res) => {
  const [[r]] = await exec('sp_delete_player', { player_id: +req.params.id, force: [sql.Bit, req.query.force === '1' ? 1 : 0] });
  res.json({ player_id: r.player_id, player_name: r.player_name });
}));

// ---------- DELETE MATCH ----------
const matchImpact = async id => (await q(`SELECT
  (SELECT COUNT(*) FROM match_events WHERE match_id=@id) events,
  (SELECT COUNT(*) FROM match_team_lineups WHERE match_id=@id) lineups,
  (SELECT COUNT(*) FROM match_team_statistics WHERE match_id=@id) stats`, { id }))[0];

// GET /api/matches/:id/impact : xem truoc se xoa bao nhieu du lieu lien quan (chi admin)
app.get('/api/matches/:id/impact', requireAdmin, wrap(async (req, res) => {
  const id = +req.params.id;
  if (!(await q('SELECT 1 x FROM matches WHERE match_id=@id', { id })).length) return res.status(404).json({ error: 'Match not found' });
  res.json(await matchImpact(id));
}));

// DELETE /api/matches/:id[?force=1] -> sp_delete_match
app.delete('/api/matches/:id', wrap(async (req, res) => {
  const [[r]] = await exec('sp_delete_match', { match_id: +req.params.id, force: [sql.Bit, req.query.force === '1' ? 1 : 0] });
  res.json(r);
}));

// ---------- CREATE MATCH ----------
// GET /api/lookups : du lieu cho cac dropdown (stage, stadium, referee) — chi admin
app.get('/api/lookups', requireAdmin, wrap(async (req, res) => res.json({
  stages: await q('SELECT stage_id, stage_name FROM tournament_stages ORDER BY stage_id'),
  stadiums: await q('SELECT stadium_id, stadium_name, city FROM stadiums ORDER BY stadium_name'),
  referees: await q('SELECT referee_id, referee_name, country FROM referees ORDER BY referee_name') })));

// POST /api/matches -> sp_add_match (ghi CA matches va matches_detailed trong 1 transaction)
app.post('/api/matches', wrap(async (req, res) => {
  const b = req.body || {}, d = str(b.datee), t = str(b.kickoff_time_utc).slice(0, 5);
  if (!d || !t) throw bad('Date and kickoff time are required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d))) throw bad('Invalid match date');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) throw bad('Invalid kickoff time (use HH:MM, UTC)');
  const [, [m]] = await exec('sp_add_match', {
    match_id: int(b.match_id, 'Match ID'), datee: d, kickoff_time_utc: t + ':00', statuss: str(b.statuss) || 'Scheduled',
    stage_id: int(b.stage_id, 'Stage'), stadium_id: int(b.stadium_id, 'Stadium'), referee_id: int(b.referee_id, 'Referee'),
    home_team_id: int(b.home_team_id, 'Home team'), away_team_id: int(b.away_team_id, 'Away team'),
    home_score: int(b.home_score, 'Home score'), away_score: int(b.away_score, 'Away score') });
  res.status(201).json({ match_id: m.match_id, home_team_name: m.home_team_name, away_team_name: m.away_team_name });
}));

// ---------- UPDATE: sua ket qua tran / thong tin doi / thong tin cau thu ----------
// PUT /api/matches/:id -> sp_update_match (cap nhat CA matches va matches_detailed)
app.put('/api/matches/:id', wrap(async (req, res) => {
  const b = req.body || {}, id = +req.params.id;
  await exec('sp_update_match', { match_id: id, statuss: str(b.statuss), home_score: int(b.home_score, 'Home score'), away_score: int(b.away_score, 'Away score'),
    result_type: strOrNull(b.result_type), home_xg: real(b.home_xg, 'Home xG'), away_xg: real(b.away_xg, 'Away xG') });
  res.json({ match_id: id, statuss: str(b.statuss) });
}));

// PUT /api/teams/:id -> sp_update_team (khong sua ten/ma doi vi matches_detailed luu ten dang text)
app.put('/api/teams/:id', wrap(async (req, res) => {
  const b = req.body || {};
  const [team] = (await exec('sp_update_team', { team_id: +req.params.id, groupp: str(b.groupp), confederation: str(b.confederation),
    fifa_ranking_per_tournament: int(b.fifa_ranking_per_tournament, 'FIFA ranking'), elo_rating: real(b.elo_rating, 'Elo rating'), coach_name: strOrNull(b.coach_name) }))[0];
  res.json(team);
}));

// PUT /api/players/:id -> sp_update_player (khong sua ten cau thu vi ten con nam o bang thong ke / matches_detailed)
app.put('/api/players/:id', wrap(async (req, res) => {
  const b = req.body || {};
  const [[p]] = await exec('sp_update_player', { player_id: +req.params.id, position: str(b.position), shirt_number: int(b.shirt_number, 'Shirt number'),
    club_team: strOrNull(b.club_team), height_cm: int(b.height_cm, 'Height'), caps: int(b.caps, 'Caps'),
    goals_for_country: int(b.goals_for_country, 'Goals for country'), market_eur: int(b.market_eur, 'Market value') });
  if (!p) throw Object.assign(new Error('Player not found'), { status: 404 });   // phong truoc khi procedure cu chua bat `@team_id is null`
  res.json({ player_id: p.player_id, player_name: p.player_name });
}));

// SPA: cac duong dan sach cung tra ve index.html (dat SAU cac route /api); 'login' la trang dang nhap
const PAGES=['login','matches','standings','teamstats','playerstats','manage','delete','update'];
app.get([...PAGES.map(p=>'/'+p),...PAGES.map(p=>`/${p}/:id`)],(req,res)=>res.sendFile(path.join(__dirname,'..','public','index.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Mo http://localhost:' + port));