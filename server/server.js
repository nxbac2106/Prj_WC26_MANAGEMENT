require('dotenv').config();
const express = require('express'), cors = require('cors'), sql = require('mssql'), path = require('path');
const app = express(); app.use(cors());
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
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(500).json({ error: e.message }));

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
  const squad = await q(`SELECT s.player_id, s.player_name, s.position, s.club_team, s.caps, t.matches_started, t.minutes_played, t.goals, t.assists, t.avg_rating
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
  const [p] = await q(`SELECT s.player_id, s.player_name, s.position, s.club_team, s.caps, s.birth, s.height_cm, s.goals_for_country, tm.team_name,
    st.matches_played, st.matches_started, st.minutes_played, st.goals, st.assists, st.shots, st.shots_on_target, st.yellow_cards, st.red_cards, st.avg_rating
    FROM player_squads s JOIN teams tm ON tm.team_id=s.team_id LEFT JOIN player_tournament_statistics st ON st.player_id=s.player_id
    WHERE s.player_id=@id`, { id: +req.params.id });
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
}));

// SPA: cac duong dan sach cung tra ve index.html (dat SAU cac route /api)
const PAGES=['matches','standings','teamstats','playerstats'];
app.get([...PAGES.map(p=>'/'+p),...PAGES.map(p=>`/${p}/:id`)],(req,res)=>res.sendFile(path.join(__dirname,'..','public','index.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Mo http://localhost:' + port));
