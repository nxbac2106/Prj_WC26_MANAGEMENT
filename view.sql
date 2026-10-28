use WorldCup26_db
go


/* VIEW1: THỐNG KÊ KẾT QUẢ CÁC TRẬN ĐẤU: */
--drop view vw_match_results
--go
create view vw_match_results as
select matches_detailed.datee, matches_detailed.kickoff_time_utc, matches_detailed.stadium_name, stadiums.country, tournament_stages.stage_name, 
	case when tournament_stages.stage_name = 'Group Stage' then teams.groupp else null end as groupp, 
	matches_detailed.referee_name , matches_detailed.home_team_name, matches_detailed.home_score, matches_detailed.away_score, matches_detailed.away_team_name, 
	matches_detailed.player_of_the_match_name ,matches_detailed.statuss
from matches
join matches_detailed on matches_detailed.match_id = matches.match_id
join tournament_stages on matches.stage_id = tournament_stages.stage_id
join teams on matches.home_team_id = teams.team_id
join stadiums on matches.stadium_id = stadiums.stadium_id
go

select * from vw_match_results
go


/* VIEW2: BẢNG XẾP HẠNG CÁC ĐỘI Ở VÒNG BẢNG */
--drop view vw_rank_group_stage
--go
create view vw_rank_group_stage as
with teams_goals_point as
(
    select matches.home_team_id as team_id, matches.home_score as goal_for, matches.away_score as goal_against,
        case when matches.home_score > matches.away_score then 3
            when matches.home_score = matches.away_score then 1
            else 0 end as point,
        case when matches.home_score > matches.away_score then 1 else 0 end as wins,
        case when matches.home_score = matches.away_score then 1 else 0 end as draws,
        case when matches.home_score < matches.away_score then 1 else 0 end as loses
    from matches join tournament_stages on matches.stage_id = tournament_stages.stage_id
    where tournament_stages.stage_name like 'Group Stage'

    union all
    
    select matches.away_team_id as team_id, matches.away_score as goal_for, matches.home_score as goal_against,
        case when matches.away_score > matches.home_score then 3
            when matches.away_score = matches.home_score then 1
            else 0 end as point,
        case when matches.away_score > matches.home_score then 1 else 0 end as wins,
        case when matches.away_score = matches.home_score then 1 else 0 end as draws,
        case when matches.away_score < matches.home_score then 1 else 0 end as loses
    from matches join tournament_stages on matches.stage_id = tournament_stages.stage_id
    where tournament_stages.stage_name like 'Group Stage'
)

select teams.team_id,  teams.team_name, teams.groupp, sum(teams_goals_point.wins) as wins, sum(teams_goals_point.loses) as loses, sum(teams_goals_point.draws) as draws, sum(teams_goals_point.goal_for) as goal_for, sum(teams_goals_point.goal_against) as goal_against, 
    sum(teams_goals_point.goal_for) - sum(teams_goals_point.goal_against) as goal_difference, sum(teams_goals_point.point) as point
from teams join teams_goals_point on teams.team_id = teams_goals_point.team_id
group by teams.team_id,  teams.team_name, teams.groupp
go

select * from vw_rank_group_stage
order by vw_rank_group_stage.groupp, vw_rank_group_stage.point desc
go


/* VIEW3: TỔNG HỢP THỐNG KÊ CỦA TỪNG ĐỘI TRÊN TOÀN GIẢI */
--drop view vw_tournament_team_stats
--go
create view vw_tournament_team_stats as
with teams_goals_point as
(
    select matches.home_team_id as team_id, matches.home_score as goal_for, matches.away_score as goal_against,
        case when matches.home_score > matches.away_score and tournament_stages.stage_name like 'Group Stage' then 3
            when matches.home_score = matches.away_score and tournament_stages.stage_name like 'Group Stage' then 1
            else 0 end as point,
        case when matches.home_score > matches.away_score then 1 else 0 end as wins,
        case when matches.home_score = matches.away_score then 1 else 0 end as draws,
        case when matches.home_score < matches.away_score then 1 else 0 end as loses
    from matches join tournament_stages on matches.stage_id = tournament_stages.stage_id
    
    union all
    
    select matches.away_team_id as team_id, matches.away_score as goal_for, matches.home_score as goal_against,
        case when matches.away_score > matches.home_score and tournament_stages.stage_name like 'Group Stage' then 3
            when matches.away_score = matches.home_score and tournament_stages.stage_name like 'Group Stage' then 1
            else 0 end as point,
        case when matches.away_score > matches.home_score then 1 else 0 end as wins,
        case when matches.away_score = matches.home_score then 1 else 0 end as draws,
        case when matches.away_score < matches.home_score then 1 else 0 end as loses
    from matches join tournament_stages on matches.stage_id = tournament_stages.stage_id
),
team_statistic as (
    select teams.team_id, teams.team_name, cast(avg(match_team_statistics.possession_pct) as decimal(4,2)) as avg_possession, 
        sum(match_team_statistics.total_shots) as total_shots, sum(match_team_statistics.shots_on_target) as shot_on_target, sum(match_team_statistics.corners) as corners,
        sum(match_team_statistics.fouls) as fouls, sum(match_team_statistics.offsides) as offsides 
    from teams join match_team_statistics on teams.team_id = match_team_statistics.team_id
    group by teams.team_id, teams.team_name
)

select teams.team_id, teams.team_name, teams.groupp, sum(teams_goals_point.point) as point_in_group_stage, count(teams_goals_point.team_id) as total_games_played, sum(teams_goals_point.wins) as wins, sum(teams_goals_point.draws) as draws, sum(teams_goals_point.loses) as loses,  
    team_statistic.avg_possession, sum(teams_goals_point.goal_for) as goal_for,  sum(teams_goals_point.goal_against) as goal_against, sum(teams_goals_point.goal_for) - sum(teams_goals_point.goal_against) as goal_difference,
    team_statistic.total_shots, team_statistic.shot_on_target, team_statistic.corners, team_statistic.fouls, team_statistic.offsides
from teams 
join teams_goals_point on teams.team_id = teams_goals_point.team_id
join team_statistic on teams.team_id = team_statistic.team_id
group by teams.team_id, teams.team_name, teams.groupp, team_statistic.total_shots, team_statistic.shot_on_target, team_statistic.corners, team_statistic.fouls, team_statistic.offsides, team_statistic.avg_possession
go

select * from vw_tournament_team_stats
order by groupp, point_in_group_stage desc, total_games_played desc
go


/* VIEW4: THỐNG KÊ CỦA TỪNG CẦU THỦ */
--drop view vw_tournament_player_stats
--go
create view vw_tournament_player_stats as
select player_id, player_name, team_name, groupp, position, matches_played, matches_started, minutes_played, goals, assists, avg_rating
from player_tournament_statistics 
join teams on player_tournament_statistics.team_id = teams.team_id;
go

select * from vw_tournament_player_stats
order by avg_rating desc
go

