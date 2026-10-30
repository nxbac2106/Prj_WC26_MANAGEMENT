use WorldCup26_db
go

-- FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY

/* 1. TRUY VẤN VỀ LỊCH THI ĐẤU VÀ SÂN VẬN ĐỘNG VÀ TRỌNG TÀI */

-- 1.1. Hiển thị lịch thi đấu của các trận đấu (ngày, giờ, SVĐ, Vòng đấu, Trọng tài, Đội 1, Đội 2, POM, trạng thái)
select matches_detailed.datee, matches_detailed.kickoff_time_utc, matches_detailed.stadium_name, stadiums.country, tournament_stages.stage_name, 
	case when tournament_stages.stage_name = 'Group Stage' then teams.groupp else null end as groupp, 
	matches_detailed.referee_name , matches_detailed.home_team_name, matches_detailed.home_score, matches_detailed.away_score, matches_detailed.away_team_name, 
	matches_detailed.player_of_the_match_name ,matches_detailed.statuss
from matches
join matches_detailed on matches_detailed.match_id = matches.match_id
join tournament_stages on matches.stage_id = tournament_stages.stage_id
join teams on matches.home_team_id = teams.team_id
join stadiums on matches.stadium_id = stadiums.stadium_id
order by matches.datee asc, matches_detailed.kickoff_time_utc asc;

-- 1.2. Thống kê các SVĐ ở USA (ID, tên, địa chỉ, sức chứa, số trận tổ chức thi đấu ở SVĐ đó)
select stadiums.stadium_id, stadiums.stadium_name, stadiums.city, stadiums.country, stadiums.capacity, count(matches.stadium_id) as organization_matches
from stadiums
join matches on stadiums.stadium_id = matches.stadium_id
where stadiums.country like 'USA'
group by stadiums.stadium_id, stadiums.stadium_name, stadiums.city, stadiums.country, stadiums.capacity
order by stadiums.capacity desc

-- 1.3. Số thẻ mà trọng tài rút
select referees.referee_name, referees.country, referees.avg_cards_per_match, 
	sum(case when match_events.event_type = 'Yellow Card' then 1 else 0 end) as total_Yellow_cards,
	sum(case when match_events.event_type = 'Red Card' then 1 else 0 end) as total_Red_cards
from matches
join referees on referees.referee_id = matches.referee_id
join match_events on matches.match_id = match_events.match_id
group by referees.referee_name, referees.country, referees.avg_cards_per_match
order by referees.avg_cards_per_match desc


/* 2. TRUY VẤN VỀ CÁC TRẬN ĐẤU  */

-- 2.1 Thống kê các trận có nhiều bàn thắng nhất
select matches_detailed.stage_name, matches_detailed.home_team_name, matches_detailed.away_team_name, matches_detailed.home_score, matches_detailed.away_score, max(matches_detailed.home_score + matches_detailed.away_score) as total_goals_match
from matches_detailed
group by matches_detailed.stage_name, matches_detailed.match_id, matches_detailed.home_team_name, matches_detailed.away_team_name, matches_detailed.home_score, matches_detailed.away_score
order by total_goals_match desc

-- 2.2 Thống kê các trận có nhiều thẻ vàng - thẻ đỏ nhất
select match_events.match_id, matches_detailed.home_team_name, matches_detailed.away_team_name, matches_detailed.stage_name , count(match_events.event_type) as total_yellow_cards
from match_events
join matches_detailed on match_events.match_id = matches_detailed.match_id
where match_events.event_type='Yellow Card'
group by match_events.match_id, matches_detailed.home_team_name, matches_detailed.away_team_name, matches_detailed.stage_name
order by total_yellow_cards desc

select match_events.match_id, matches_detailed.home_team_name, matches_detailed.away_team_name, matches_detailed.stage_name, count(match_events.event_type) as total_red_cards
from match_events
join matches_detailed on match_events.match_id = matches_detailed.match_id
where match_events.event_type='Red Card'
group by match_events.match_id, matches_detailed.home_team_name, matches_detailed.away_team_name, matches_detailed.stage_name
order by total_red_cards desc


/* 3. TRUY VẤN VỀ THÔNG SỐ CÁC ĐỘI  */

-- 3.1. Tổng số bàn thắng, số kiến tạo mà đội ghi được 
select teams.team_name, sum(player_tournament_statistics.goals) as total_goals, sum(player_tournament_statistics.assists) as total_assists
from teams
join player_tournament_statistics on teams.team_id = player_tournament_statistics.team_id
group by team_name
order by total_goals desc, total_assists desc;

-- 3.2. Tổng số thẻ vàng, thẻ đỏ của đội
select teams.team_name, sum(player_tournament_statistics.yellow_cards) as total_yellow_cards, sum(player_tournament_statistics.red_cards) as total_red_cards
from teams
join player_tournament_statistics on teams.team_id = player_tournament_statistics.team_id
group by team_name
having sum(player_tournament_statistics.yellow_cards) > 0 or sum(player_tournament_statistics.red_cards) >0
order by total_yellow_cards desc, total_red_cards desc

-- hoặc
SELECT 
    t.team_name,
    SUM(CASE WHEN me.event_type = 'Yellow Card' THEN 1 ELSE 0 END) AS yellow_cards,
    SUM(CASE WHEN me.event_type = 'Red Card' THEN 1 ELSE 0 END) AS red_cards
FROM teams t
JOIN match_events me ON t.team_id = me.team_id
GROUP BY t.team_name
ORDER BY yellow_cards DESC;

-- 3.3 Tỉ lệ kiểm soát bóng
select teams.team_id, teams.team_name, count(match_team_statistics.match_id) as matches_played, 
	cast(avg(match_team_statistics.possession_pct) as decimal(5,2)) as avg_possession
from teams
join match_team_statistics on teams.team_id = match_team_statistics.team_id
group by teams.team_id, teams.team_name
order by avg_possession desc


/* 4. TRUY VẤN VỀ CẦU THỦ  */
-- 4.1 BXH Vua phá lưới (ghi nhiều bàn thắng nhất, tiêu chí phụ là số kiến tạo)
select player_tournament_statistics.player_id, player_tournament_statistics.player_name, teams.team_name, 
	player_tournament_statistics.position, player_tournament_statistics.goals, player_tournament_statistics.assists  
from player_tournament_statistics
join teams on player_tournament_statistics.team_id = teams.team_id
order by player_tournament_statistics.goals desc, player_tournament_statistics.assists desc

-- 4.2 Cầu thủ đạt nhiều POM nhất
select player_tournament_statistics.player_id, player_tournament_statistics.player_name, teams.team_name, player_tournament_statistics.position, player_tournament_statistics.shirt_number, count(matches.player_of_the_match_id) as total_POMs
from player_tournament_statistics
join matches on player_tournament_statistics.player_id = matches.player_of_the_match_id
join teams on player_tournament_statistics.team_id = teams.team_id
group by player_tournament_statistics.player_id, player_tournament_statistics.player_name, teams.team_name, player_tournament_statistics.position, player_tournament_statistics.shirt_number
order by total_POMs desc

-- 4.3 Cầu thủ có số phút thi đấu lớn nhất
select player_tournament_statistics.player_name, teams.team_name, player_tournament_statistics.position, player_tournament_statistics.matches_played, player_tournament_statistics.matches_started, player_tournament_statistics.minutes_played, player_tournament_statistics.goals, player_tournament_statistics.assists 
from player_tournament_statistics
join teams on player_tournament_statistics.team_id = teams.team_id
order by minutes_played desc

-- 4.4 Cầu thủ ghi bàn bằng pen nhiều nhất
select player_squads.player_name, teams.team_name, player_squads.position, count(match_events.event_type) as total_pen_goals
from player_squads
join teams on player_squads.team_id = teams.team_id
join match_events on player_squads.player_id = match_events.player_id
where match_events.event_type = 'Penalty Shootout Goal'
group by player_squads.player_name, teams.team_name, player_squads.position
order by total_pen_goals desc
go

