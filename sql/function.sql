use WorldCup26_db
go

/* FUNCTION1: Tinh diem so sau 1 tran dau: */
--drop function dbo.fn_get_points
--go
create function dbo.fn_get_points (@goals_for int, @goals_against int)
returns int as
begin
    return case when @goals_for is null or @goals_against is null then null
                when @goals_for > @goals_against then 3
                when @goals_for = @goals_against then 1
                else 0 end
end
go


/* FUNCTION2: Ket qua cua 1 tran dau: */
--drop function dbo.fn_match_outcome
--go
create function dbo.fn_match_outcome (@goals_for int, @goals_against int)
returns char(1) as
begin
    return case when @goals_for is null or @goals_against is null then null
                when @goals_for > @goals_against then 'W'
                when @goals_for = @goals_against then 'D'
                else 'L' end
end
go


/* FUNCTION3: Tinh tuoi cua cau thu */
--drop function dbo.fn_player_age
--go
create function dbo.fn_player_age (@birth date, @on_date date)
returns int as
begin
    if @birth is null return null
    return datediff(year, @birth, @on_date) - case when dateadd(year, datediff(year, @birth, @on_date), @birth) > @on_date then 1 else 0 end
end
go


/* FUNCTION4: Tat ca tran dau cua 1 doi*/
--drop function dbo.fn_team_matches
--go
create function dbo.fn_team_matches (@team_id int)
returns table as
return
(
    select m.match_id, m.datee, m.kickoff_time_utc, ts.stage_name, m.statuss,
           case when m.home_team_id = @team_id then 'Home' else 'Away' end as venue,
           case when m.home_team_id = @team_id then a.team_name else h.team_name end as opponent,
           case when m.home_team_id = @team_id then m.home_score else m.away_score end as goals_for,
           case when m.home_team_id = @team_id then m.away_score else m.home_score end as goals_against,
           dbo.fn_match_outcome(
               case when m.home_team_id = @team_id then m.home_score else m.away_score end,
               case when m.home_team_id = @team_id then m.away_score else m.home_score end) as outcome
    from matches m
    join teams h on h.team_id = m.home_team_id
    join teams a on a.team_id = m.away_team_id
    join tournament_stages ts on ts.stage_id = m.stage_id
    where m.home_team_id = @team_id or m.away_team_id = @team_id
)
go


/* FUNCTION5: BXH cua 1 bang dau*/
--drop function dbo.fn_group_standings
--go
create function dbo.fn_group_standings (@groupp nvarchar(10))
returns table as
return
(
    select rank() over (order by point desc, goal_difference desc, goal_for desc) as position, team_id, team_name, wins, draws, loses, goal_for, goal_against, goal_difference, point
    from vw_rank_group_stage
    where groupp = upper(@groupp)
)
go


select match_id, home_score, away_score, dbo.fn_get_points(home_score, away_score) as home_points
from matches;
select match_id, home_score, away_score, dbo.fn_match_outcome(home_score, away_score) as home_outcome
from matches;

select player_squads.player_name, player_squads.birth, teams.team_name, dbo.fn_player_age(birth, GETDATE()) as age from player_squads
join teams on player_squads.team_id = teams.team_id 
order by age desc;

select * from dbo.fn_team_matches(1)
order by datee;

select * from dbo.fn_group_standings('L') order by position;