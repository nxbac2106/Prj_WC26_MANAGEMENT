require('dotenv').config();
const express = require('express'), cors = require('cors'), sql = require('mssql'), path = require('path');
const app = express(); app.use(cors()); app.use(express.json());
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
const sp = async (stage, group) => { await ready;
  const r = pool.request().input('stage_name', sql.NVarChar(50), stage);
  if (group) r.input('group', sql.NVarChar(50), group);
  return (await r.execute('sp_get_matches_stage')).recordset; };
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(e.status || 500).json({ error: e.message }));
const bad = m => Object.assign(new Error(m), { status: 400 });   // loi do nguoi dung nhap sai -> HTTP 400

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
  res.json({ standings: await q(`SELECT *, wins+draws+loses AS played FROM vw_rank_group_stage WHERE groupp=@g
      ORDER BY point DESC, goal_difference DESC, goal_for DESC`, { g }), matches: await sp('Group Stage', g) }); }));

app.get('/api/teams', wrap(async (req, res) =>
  res.json(await q('SELECT team_id, team_name, groupp FROM teams ORDER BY team_name'))));

app.get('/api/teams/:id', wrap(async (req, res) => {
  const id = +req.params.id;
  const [info] = await q('SELECT * FROM teams WHERE team_id=@id', { id });
  if (!info) return res.status(404).json({ error: 'Not found' });
  const [stats] = await q('SELECT * FROM vw_tournament_team_stats WHERE team_id=@id', { id });
  const n = info.team_name;
  const form = await q(`SELECT TOP 5 datee, home_team_name, away_team_name, home_score, away_score FROM matches_detailed
    WHERE home_team_name=@n OR away_team_name=@n ORDER BY datee DESC, kickoff_time_utc DESC`, { n });
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
  const [p] = await q(`SELECT s.player_id, s.player_name, s.position, s.club_team, s.caps, s.birth, s.height_cm, s.goals_for_country, s.market_eur, st.shirt_number, tm.team_name,
    st.matches_played, st.matches_started, st.minutes_played, st.goals, st.assists, st.shots, st.shots_on_target, st.yellow_cards, st.red_cards, st.avg_rating
    FROM player_squads s JOIN teams tm ON tm.team_id=s.team_id LEFT JOIN player_tournament_statistics st ON st.player_id=s.player_id
    WHERE s.player_id=@id`, { id: +req.params.id });
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
}));

// GET /api/next-ids : ID ke tiep (MAX+1) de dien san vao form Create Data
app.get('/api/next-ids', wrap(async (req, res) => res.json((await q(`SELECT
  (SELECT ISNULL(MAX(team_id), 0) + 1 FROM teams) team_id,
  (SELECT ISNULL(MAX(player_id), 0) + 1 FROM player_squads) player_id,
  (SELECT ISNULL(MAX(match_id), 0) + 1 FROM matches) match_id`))[0])));

// Doc ID tuy chon: bo trong -> null (server tu cap MAX+1); sai -> 400
const optId = (v, label) => { const n = num(v); if (n != null && (!Number.isInteger(n) || n < 1)) throw bad(label + ' must be a positive integer'); return n; };

// ---------- UPDATE: them doi / them cau thu ----------
const num = v => (v === '' || v == null) ? null : Number(v);

// POST /api/teams : them doi tuyen moi (team_id khong phai IDENTITY -> tu cap MAX+1)
app.post('/api/teams', wrap(async (req, res) => {
  const b = req.body || {};
  const name = String(b.team_name || '').trim(), code = String(b.fifa_code_name || '').trim().toUpperCase(),
        grp = String(b.groupp || '').trim().toUpperCase(), conf = String(b.confederation || '').trim(),
        coach = String(b.coach_name || '').trim() || null,
        rank = num(b.fifa_ranking_per_tournament), elo = num(b.elo_rating), tid = optId(b.team_id, 'Team ID');
  if (!name || !code || !grp || !conf) throw bad('Missing required fields: team name, FIFA code, group, confederation');
  if (!/^[A-Z]{3}$/.test(code)) throw bad('FIFA code must be exactly 3 letters');
  if ([rank, elo].some(v => v != null && (isNaN(v) || v < 0))) throw bad('FIFA ranking / Elo must be non-negative numbers');
  if (tid != null && (await q('SELECT 1 x FROM teams WHERE team_id=@tid', { tid })).length) throw bad('Team ID ' + tid + ' already exists');
  const dup = await q('SELECT 1 x FROM teams WHERE LOWER(team_name)=LOWER(@name) OR fifa_code_name=@code', { name, code });
  if (dup.length) throw bad('Team name or FIFA code already exists');
  const [team] = await q(`INSERT INTO teams (team_id, team_name, fifa_code_name, groupp, confederation, fifa_ranking_per_tournament, elo_rating, coach_name)
    OUTPUT INSERTED.*
    SELECT ISNULL(CAST(@tid AS int), ISNULL(MAX(team_id), 0) + 1), @name, @code, @grp, @conf, @rank, @elo, @coach FROM teams WITH (UPDLOCK, HOLDLOCK)`,
    { name, code, grp, conf, rank, elo, coach, tid });
  res.status(201).json(team);
}));

// POST /api/players : them cau thu vao doi (player_squads + dong thong ke rong trong player_tournament_statistics, 1 transaction)
app.post('/api/players', wrap(async (req, res) => {
  const b = req.body || {};
  const name = String(b.player_name || '').trim(), position = String(b.position || '').trim(), team_id = num(b.team_id),
        club = String(b.club_team || '').trim() || null,
        shirt = num(b.shirt_number), height = num(b.height_cm), caps = num(b.caps), gfc = num(b.goals_for_country), mv = num(b.market_eur),
        pid = optId(b.player_id, 'Player ID');
  if (!name || !position || !team_id) throw bad('Missing required fields: team, player name, position');
  if (!/^(goalkeeper|defender|midfielder|forward)$/i.test(position)) throw bad('Invalid position');
  if ([shirt, height, caps, gfc, mv].some(v => v != null && (isNaN(v) || v < 0))) throw bad('Numeric fields must be non-negative numbers');
  if (shirt != null && (shirt < 1 || shirt > 99)) throw bad('Shirt number must be between 1 and 99');
  const birth = b.birth ? new Date(b.birth + 'T00:00:00Z') : null;
  if (birth && isNaN(birth)) throw bad('Invalid birth date');

  await ready;
  const tx = new sql.Transaction(pool); await tx.begin();
  try {
    const R = () => new sql.Request(tx);                       // moi cau lenh dung 1 Request moi (tranh trung ten tham so)
    const [team] = (await R().input('t', team_id).query('SELECT team_name FROM teams WHERE team_id=@t')).recordset;
    if (!team) throw bad('Team does not exist');
    const [{ n }] = (await R().input('t', team_id).query('SELECT COUNT(*) n FROM player_squads WITH (UPDLOCK, HOLDLOCK) WHERE team_id=@t')).recordset;
    if (n >= 26) throw bad(team.team_name + ' already has 26 players');
    if (shirt != null && (await R().input('t', team_id).input('s', shirt)
        .query('SELECT 1 x FROM player_tournament_statistics WHERE team_id=@t AND shirt_number=@s')).recordset.length)
      throw bad('Shirt number ' + shirt + ' is already taken in this team');
    let id = pid;
    if (id != null) { if ((await R().input('i', id).query('SELECT 1 x FROM player_squads WHERE player_id=@i')).recordset.length) throw bad('Player ID ' + id + ' already exists'); }
    else id = (await R().query('SELECT ISNULL(MAX(player_id), 0) + 1 id FROM player_squads WITH (UPDLOCK, HOLDLOCK)')).recordset[0].id;
    await R().input('id', id).input('t', team_id).input('n', name).input('p', position).input('c', club).input('mv', mv)
      .input('caps', caps).input('b', sql.Date, birth).input('h', height).input('g', gfc)
      .query(`INSERT INTO player_squads (player_id, team_id, player_name, position, club_team, market_eur, caps, birth, height_cm, goals_for_country)
              VALUES (@id, @t, @n, @p, @c, @mv, @caps, @b, @h, @g)`);
    await R().input('id', id).input('t', team_id).input('n', name).input('p', position).input('s', shirt)
      .query(`INSERT INTO player_tournament_statistics (player_id, player_name, team_id, position, shirt_number)
              VALUES (@id, @n, @t, @p, @s)`);
    await tx.commit();
    res.status(201).json({ player_id: id, player_name: name, team_id, team_name: team.team_name });
  } catch (e) { await tx.rollback().catch(() => {}); throw e; }
}));

// ---------- DELETE: xoa cau thu / xoa doi (cascade) ----------
const withTx = async fn => { await ready; const tx = new sql.Transaction(pool); await tx.begin();
  try { const out = await fn(() => new sql.Request(tx)); await tx.commit(); return out; }
  catch (e) { await tx.rollback().catch(() => {}); throw e; } };

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

// GET /api/teams/:id/impact : xem truoc se xoa bao nhieu du lieu
app.get('/api/teams/:id/impact', wrap(async (req, res) => {
  const id = +req.params.id;
  if (!(await q('SELECT 1 x FROM teams WHERE team_id=@id', { id })).length) return res.status(404).json({ error: 'Team not found' });
  res.json(await teamImpact(id));
}));

// DELETE /api/teams/:id[?force=1] : xoa doi + TAT CA cau thu cua doi.
// Neu doi da co tran dau thi chi xoa khi force=1 (xoa luon tran dau, events, lineups, thong ke lien quan).
app.delete('/api/teams/:id', wrap(async (req, res) => {
  const id = +req.params.id, force = req.query.force === '1';
  const [team] = await q('SELECT team_name FROM teams WHERE team_id=@id', { id });
  if (!team) return res.status(404).json({ error: 'Team not found' });
  const imp = await teamImpact(id);
  if (!force && (imp.matches || imp.events || imp.lineups || imp.stats))
    throw bad(`${team.team_name} already has ${imp.matches} matches and related data. Tick the checkbox to also delete the match data.`);
  await withTx(async R => {
    const run = s => R().input('id', id).query(s);
    await run(`UPDATE matches SET player_of_the_match_id=NULL WHERE player_of_the_match_id IN ${T_PLAYERS}`);
    if (force) {                                    // thu tu: bang con truoc, bang cha sau
      await run(`DELETE FROM match_events WHERE team_id=@id OR player_id IN ${T_PLAYERS} OR match_id IN ${T_MATCHES}`);
      await run(`DELETE FROM match_team_lineups WHERE team_id=@id OR player_id IN ${T_PLAYERS} OR match_id IN ${T_MATCHES}`);
      await run(`DELETE FROM match_team_statistics WHERE team_id=@id OR match_id IN ${T_MATCHES}`);
      await run(`DELETE FROM matches_detailed WHERE match_id IN ${T_MATCHES}`);
      await run('DELETE FROM matches WHERE home_team_id=@id OR away_team_id=@id');
    }
    await run(`DELETE FROM player_tournament_statistics WHERE team_id=@id OR player_id IN ${T_PLAYERS}`);
    await run('DELETE FROM player_squads WHERE team_id=@id');     // cascade: xoa het cau thu cua doi
    await run('DELETE FROM teams WHERE team_id=@id');
  });
  res.json({ team_name: team.team_name, players: imp.players, matches: force ? imp.matches : 0 });
}));

// GET /api/players/:id/impact
app.get('/api/players/:id/impact', wrap(async (req, res) => {
  const id = +req.params.id;
  if (!(await q('SELECT 1 x FROM player_squads WHERE player_id=@id', { id })).length) return res.status(404).json({ error: 'Player not found' });
  res.json(await playerImpact(id));
}));

// DELETE /api/players/:id[?force=1] : xoa 1 cau thu; neu da co su kien/doi hinh/POM thi can force=1
app.delete('/api/players/:id', wrap(async (req, res) => {
  const id = +req.params.id, force = req.query.force === '1';
  const [p] = await q('SELECT player_name FROM player_squads WHERE player_id=@id', { id });
  if (!p) return res.status(404).json({ error: 'Player not found' });
  const imp = await playerImpact(id);
  if (!force && (imp.events || imp.lineups || imp.pom))
    throw bad(`${p.player_name} already has ${imp.events} events, ${imp.lineups} appearances and ${imp.pom} Man of the Match awards. Tick the checkbox to also delete the related match data.`);
  await withTx(async R => {
    const run = s => R().input('id', id).input('n', p.player_name).query(s);
    await run('DELETE FROM match_events WHERE player_id=@id');
    await run('DELETE FROM match_team_lineups WHERE player_id=@id');
    await run('UPDATE matches_detailed SET player_of_the_match_name=NULL WHERE match_id IN (SELECT match_id FROM matches WHERE player_of_the_match_id=@id)');
    await run('UPDATE matches SET player_of_the_match_id=NULL WHERE player_of_the_match_id=@id');
    await run('DELETE FROM player_tournament_statistics WHERE player_id=@id');
    await run('DELETE FROM player_squads WHERE player_id=@id');
  });
  res.json({ player_id: id, player_name: p.player_name });
}));

// ---------- DELETE MATCH ----------
const matchImpact = async id => (await q(`SELECT
  (SELECT COUNT(*) FROM match_events WHERE match_id=@id) events,
  (SELECT COUNT(*) FROM match_team_lineups WHERE match_id=@id) lineups,
  (SELECT COUNT(*) FROM match_team_statistics WHERE match_id=@id) stats`, { id }))[0];

// GET /api/matches/:id/impact : xem truoc se xoa bao nhieu du lieu lien quan
app.get('/api/matches/:id/impact', wrap(async (req, res) => {
  const id = +req.params.id;
  if (!(await q('SELECT 1 x FROM matches WHERE match_id=@id', { id })).length) return res.status(404).json({ error: 'Match not found' });
  res.json(await matchImpact(id));
}));

// DELETE /api/matches/:id[?force=1] : xoa 1 tran. Neu da co events/lineups/thong ke thi can force=1.
// Thu tu theo khoa ngoai: bang con (events, lineups, team_statistics, matches_detailed) truoc, matches sau.
app.delete('/api/matches/:id', wrap(async (req, res) => {
  const id = +req.params.id, force = req.query.force === '1';
  const [m] = await q(`SELECT h.team_name home_team_name, a.team_name away_team_name FROM matches x
    JOIN teams h ON h.team_id=x.home_team_id JOIN teams a ON a.team_id=x.away_team_id WHERE x.match_id=@id`, { id });
  if (!m) return res.status(404).json({ error: 'Match not found' });
  const imp = await matchImpact(id);
  if (!force && (imp.events || imp.lineups || imp.stats))
    throw bad(`Match #${id} already has ${imp.events} events, ${imp.lineups} lineup rows and ${imp.stats} team statistics rows. Tick the checkbox to also delete them.`);
  await withTx(async R => {
    const run = s => R().input('id', id).query(s);
    await run('DELETE FROM match_events WHERE match_id=@id');
    await run('DELETE FROM match_team_lineups WHERE match_id=@id');
    await run('DELETE FROM match_team_statistics WHERE match_id=@id');
    await run('DELETE FROM matches_detailed WHERE match_id=@id');
    await run('DELETE FROM matches WHERE match_id=@id');
  });
  res.json({ match_id: id, ...m });
}));

// ---------- CREATE MATCH ----------
// GET /api/lookups : du lieu cho cac dropdown (stage, stadium, referee)
app.get('/api/lookups', wrap(async (req, res) => res.json({
  stages: await q('SELECT stage_id, stage_name FROM tournament_stages ORDER BY stage_id'),
  stadiums: await q('SELECT stadium_id, stadium_name, city FROM stadiums ORDER BY stadium_name'),
  referees: await q('SELECT referee_id, referee_name, country FROM referees ORDER BY referee_name') })));

// POST /api/matches : them tran dau moi. Ghi CA matches va matches_detailed trong 1 transaction.
app.post('/api/matches', wrap(async (req, res) => {
  const b = req.body || {};
  const [stage_id, stadium_id, home, away, referee_id] = ['stage_id', 'stadium_id', 'home_team_id', 'away_team_id', 'referee_id'].map(k => num(b[k]));
  const mid = optId(b.match_id, 'Match ID');
  const d = String(b.datee || '').trim(), t = String(b.kickoff_time_utc || '').trim().slice(0, 5),
        status = String(b.statuss || 'Scheduled').trim(), hs = num(b.home_score), aw = num(b.away_score);
  if (![stage_id, stadium_id, home, away, referee_id].every(Number.isInteger)) throw bad('Date, kickoff time, stage, stadium, both teams and referee are required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d))) throw bad('Invalid match date');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) throw bad('Invalid kickoff time (use HH:MM, UTC)');
  if (home === away) throw bad('Home and away team must be different');
  if (!status || status.length > 100) throw bad('Match status is required');
  if ([hs, aw].some(v => v != null && (!Number.isInteger(v) || v < 0))) throw bad('Scores must be non-negative integers');
  if ((hs == null) !== (aw == null)) throw bad('Enter both scores, or leave both empty');
  if (/complet|finish|full/i.test(status) && hs == null) throw bad('A Completed match must have a score');

  const out = await withTx(async R => {
    const one = async (sqlText, p = {}) => { let r = R(); for (const k in p) r = r.input(k, p[k]); return (await r.query(sqlText)).recordset?.[0]; };   // INSERT khong tra ve recordset -> dung ?. de khong bi loi
    const team = x => one('SELECT team_id, team_name, fifa_code_name, groupp FROM teams WHERE team_id=@x', { x });
    const [h, a] = [await team(home), await team(away)];
    if (!h || !a) throw bad('Team does not exist');
    const stage = await one('SELECT stage_name FROM tournament_stages WHERE stage_id=@x', { x: stage_id });
    const sd = await one('SELECT stadium_name, city, country FROM stadiums WHERE stadium_id=@x', { x: stadium_id });
    const rf = await one('SELECT referee_name FROM referees WHERE referee_id=@x', { x: referee_id });
    if (!stage) throw bad('Stage does not exist');
    if (!sd) throw bad('Stadium does not exist');
    if (!rf) throw bad('Referee does not exist');
    if (stage.stage_name === 'Group Stage' && h.groupp !== a.groupp) throw bad('Both teams must be in the same group for a Group Stage match');
    const clash = await one(`SELECT COUNT(*) n FROM matches WHERE datee=CAST(@d AS date) AND (home_team_id IN (@h,@a) OR away_team_id IN (@h,@a))`, { d, h: home, a: away });
    if (clash.n) throw bad('One of these teams already has a match on that date');
    let id = mid;
    if (id != null) { if (await one('SELECT 1 x FROM matches WHERE match_id=@x', { x: id })) throw bad('Match ID ' + id + ' already exists'); }
    else id = (await one('SELECT ISNULL(MAX(match_id), 0) + 1 id FROM matches WITH (UPDLOCK, HOLDLOCK)')).id;
    const P = { id, d, t: t + ':00', sg: stage_id, sd: stadium_id, h: home, a: away, hs, aw, st: status, rf: referee_id };
    await one(`INSERT INTO matches (match_id, datee, kickoff_time_utc, stage_id, stadium_id, home_team_id, away_team_id, home_score, away_score, statuss, referee_id)
      VALUES (@id, CAST(@d AS date), CAST(@t AS time(0)), @sg, @sd, @h, @a, @hs, @aw, @st, @rf)`, P);
    await one(`INSERT INTO matches_detailed (match_id, datee, kickoff_time_utc, stage_name, stadium_name, city, country, home_team_name, home_fifa_code,
        away_team_name, away_fifa_code, home_score, away_score, statuss, referee_name)
      VALUES (@id, CAST(@d AS date), CAST(@t AS time(0)), @sgn, @sdn, @city, @cty, @hn, @hc, @an, @ac, @hs, @aw, @st, @rn)`,
      { id, d, t: t + ':00', sgn: stage.stage_name, sdn: sd.stadium_name, city: sd.city, cty: sd.country, hn: h.team_name, hc: h.fifa_code_name,
        an: a.team_name, ac: a.fifa_code_name, hs, aw, st: status, rn: rf.referee_name });
    return { match_id: id, home_team_name: h.team_name, away_team_name: a.team_name };
  });
  res.status(201).json(out);
}));

// ---------- UPDATE: sua ket qua tran / thong tin doi / thong tin cau thu ----------
// PUT /api/matches/:id : cap nhat ti so, trang thai (statuss), result_type, xG.
// Du lieu tran nam o 2 bang (matches + matches_detailed) nen cap nhat CA HAI trong 1 transaction de khong lech nhau.
app.put('/api/matches/:id', wrap(async (req, res) => {
  const id = +req.params.id, b = req.body || {};
  const hs = num(b.home_score), aw = num(b.away_score), hx = num(b.home_xg), ax = num(b.away_xg),
        status = String(b.statuss || '').trim(), rt = String(b.result_type || '').trim() || null;
  if (!status || status.length > 100) throw bad('Match status is required');
  if ([hs, aw].some(v => v != null && (!Number.isInteger(v) || v < 0))) throw bad('Scores must be non-negative integers');
  if ([hx, ax].some(v => v != null && (isNaN(v) || v < 0))) throw bad('xG must be a non-negative number');
  if ((hs == null) !== (aw == null)) throw bad('Enter both scores, or leave both empty');
  if (/complet|finish|full/i.test(status) && hs == null) throw bad('A Completed match must have a score');
  if (rt && rt.toUpperCase() === 'PEN' && hs !== aw) throw bad('Result type PEN only applies when the score is level');
  if (!(await q('SELECT 1 x FROM matches WHERE match_id=@id', { id })).length) return res.status(404).json({ error: 'Match not found' });
  await withTx(async R => {
    const run = s => R().input('id', id).input('hs', hs).input('aw', aw).input('st', status).input('rt', rt).input('hx', hx).input('ax', ax).query(s);
    const SET = 'home_score=@hs, away_score=@aw, statuss=@st, result_type=@rt, home_xg=@hx, away_xg=@ax WHERE match_id=@id';
    await run('UPDATE matches SET ' + SET);
    await run('UPDATE matches_detailed SET ' + SET);
  });
  res.json({ match_id: id, statuss: status });
}));

// PUT /api/teams/:id : sua nhom, lien doan, ranking, Elo, HLV.
// KHONG cho sua team_name / fifa_code_name vi matches_detailed luu ten doi dang text (sua se lech du lieu).
app.put('/api/teams/:id', wrap(async (req, res) => {
  const id = +req.params.id, b = req.body || {};
  const grp = String(b.groupp || '').trim().toUpperCase(), conf = String(b.confederation || '').trim(),
        coach = String(b.coach_name || '').trim() || null, rank = num(b.fifa_ranking_per_tournament), elo = num(b.elo_rating);
  if (!grp || !conf) throw bad('Group and confederation are required');
  if ([rank, elo].some(v => v != null && (isNaN(v) || v < 0))) throw bad('FIFA ranking / Elo must be non-negative numbers');
  const r = await q(`UPDATE teams SET groupp=@grp, confederation=@conf, fifa_ranking_per_tournament=@rank, elo_rating=@elo, coach_name=@coach
    OUTPUT INSERTED.* WHERE team_id=@id`, { id, grp, conf, rank, elo, coach });
  if (!r.length) return res.status(404).json({ error: 'Team not found' });
  res.json(r[0]);
}));

// PUT /api/players/:id : sua vi tri, so ao, CLB, chieu cao, caps, ban thang, gia tri.
// KHONG cho sua player_name vi ten con nam o player_tournament_statistics / matches_detailed.
app.put('/api/players/:id', wrap(async (req, res) => {
  const id = +req.params.id, b = req.body || {};
  const position = String(b.position || '').trim(), club = String(b.club_team || '').trim() || null,
        shirt = num(b.shirt_number), height = num(b.height_cm), caps = num(b.caps), gfc = num(b.goals_for_country), mv = num(b.market_eur);
  if (!/^[gdmf]/i.test(position)) throw bad('Invalid position');
  if ([shirt, height, caps, gfc, mv].some(v => v != null && (isNaN(v) || v < 0))) throw bad('Numeric fields must be non-negative numbers');
  if (shirt != null && (shirt < 1 || shirt > 99)) throw bad('Shirt number must be between 1 and 99');
  const [p] = await q('SELECT team_id, player_name FROM player_squads WHERE player_id=@id', { id });
  if (!p) return res.status(404).json({ error: 'Player not found' });
  if (shirt != null && (await q('SELECT 1 x FROM player_tournament_statistics WHERE team_id=@t AND shirt_number=@s AND player_id<>@id',
      { t: p.team_id, s: shirt, id })).length) throw bad('Shirt number ' + shirt + ' is already taken in this team');
  await withTx(async R => {
    const run = s => R().input('id', id).input('p', position).input('c', club).input('s', shirt).input('h', height)
      .input('caps', caps).input('g', gfc).input('mv', mv).query(s);
    await run('UPDATE player_squads SET position=@p, club_team=@c, height_cm=@h, caps=@caps, goals_for_country=@g, market_eur=@mv WHERE player_id=@id');
    await run('UPDATE player_tournament_statistics SET position=@p, shirt_number=@s WHERE player_id=@id');
  });
  res.json({ player_id: id, player_name: p.player_name });
}));

// SPA: cac duong dan sach cung tra ve index.html (dat SAU cac route /api)
const PAGES=['matches','standings','teamstats','playerstats','manage','delete','update'];
app.get([...PAGES.map(p=>'/'+p),...PAGES.map(p=>`/${p}/:id`)],(req,res)=>res.sendFile(path.join(__dirname,'..','public','index.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Mo http://localhost:' + port));