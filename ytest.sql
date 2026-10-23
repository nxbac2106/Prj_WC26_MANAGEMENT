use WorldCup26_db
go


-- 3.
SELECT TOP 10
    ps.player_name,
    t.team_name,
    pts.minutes_played,
    pts.goals
FROM player_tournament_statistics pts
INNER JOIN player_squads ps ON pts.player_id = ps.player_id
INNER JOIN teams t ON pts.team_id = t.team_id
WHERE pts.goals = 0
  AND pts.minutes_played > (
      SELECT AVG(minutes_played) 
      FROM player_tournament_statistics 
      WHERE minutes_played IS NOT NULL
  )
ORDER BY pts.minutes_played DESC;


-- Doi hinh xphat cua 1 tran cu the
SELECT 
    m.match_id,
    t.team_name,
    ps.player_name,
    mtl.tactical_position,
    mtl.minutes_played
FROM match_team_lineups mtl
INNER JOIN matches m ON mtl.match_id = m.match_id
INNER JOIN teams t ON mtl.team_id = t.team_id
INNER JOIN player_squads ps ON mtl.player_id = ps.player_id
WHERE mtl.is_starting = 1
  AND m.match_id = 1          -- thay bằng match_id cần xem
ORDER BY t.team_name, mtl.tactical_position;


-- union
-- Lấy người ghi bàn
SELECT player_id, 'Scored a goal' AS action FROM match_events WHERE event_type = 'Goal'
UNION
-- Lấy người nhận thẻ đỏ
SELECT player_id, 'Received Red Card' AS action FROM match_events WHERE event_type = 'Red Card';

--  intersect
-- Cầu thủ ghi bàn
SELECT player_id FROM match_events WHERE event_type = 'Goal'
INTERSECT
-- Cầu thủ nhận thẻ vàng
SELECT player_id FROM match_events WHERE event_type = 'Yellow Card';

-- cau thu vua ghi ban vua kien tao
-- Cầu thủ đã ghi bàn
SELECT DISTINCT player_id
FROM match_events
WHERE event_type = 'Goal'
INTERSECT
-- Cầu thủ đã kiến tạo
SELECT DISTINCT player_id
FROM match_events
WHERE event_type = 'Assist';

--lay ten
SELECT ps.player_name, t.team_name
FROM player_squads ps
INNER JOIN teams t ON ps.team_id = t.team_id
WHERE ps.player_id IN (
    SELECT player_id FROM match_events WHERE event_type = 'Goal'
    INTERSECT
    SELECT player_id FROM match_events WHERE event_type = 'Assist'
);

-- ca ghi ban ca kien tao
SELECT 
    ps.player_name,
    t.team_name,
    'Goal Scorer' AS role,
    COUNT(*) AS so_lan
FROM match_events me
INNER JOIN player_squads ps ON me.player_id = ps.player_id
INNER JOIN teams t ON me.team_id = t.team_id
WHERE me.event_type = 'Goal'
GROUP BY ps.player_name, t.team_name

UNION ALL

SELECT 
    ps.player_name,
    t.team_name,
    'Assister' AS role,
    COUNT(*) AS so_lan
FROM match_events me
INNER JOIN player_squads ps ON me.player_id = ps.player_id
INNER JOIN teams t ON me.team_id = t.team_id
WHERE me.event_type = 'Assist'
GROUP BY ps.player_name, t.team_name
ORDER BY role, so_lan DESC;


