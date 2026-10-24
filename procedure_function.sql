use WorldCup26_db
go

/* PROCEDURE1: TRA CUU LICH THI DAU - KET QUA TRAN DAU THEO VONG DAU*/
--drop procedure sp_get_matches_stage
--go
create procedure sp_get_matches_stage 
    @stage_name nvarchar(50), 
    @group nvarchar(50) = null
as
begin
    if @stage_name = 'Group Stage'
    begin
        select matches_detailed.match_id, matches_detailed.datee, matches_detailed.kickoff_time_utc, matches_detailed.stage_name,
            home.groupp, matches_detailed.home_team_name, matches_detailed.home_score, matches_detailed.away_score, matches_detailed.away_team_name,
            matches_detailed.stadium_name , matches_detailed.statuss
        from matches_detailed
        join teams as home on matches_detailed.home_team_name = home.team_name
        join teams as away on matches_detailed.away_team_name = away.team_name
        where matches_detailed.stage_name = @stage_name and (@group is null or home.groupp = @group)
        order by matches_detailed.datee desc, matches_detailed.kickoff_time_utc desc
    end

    else
    begin
        select matches_detailed.match_id, matches_detailed.datee, matches_detailed.kickoff_time_utc, matches_detailed.stage_name,
            matches_detailed.home_team_name, matches_detailed.home_score, matches_detailed.away_score, matches_detailed.away_team_name,
            matches_detailed.stadium_name , matches_detailed.statuss
        from matches_detailed
        join teams as home on matches_detailed.home_team_name = home.team_name
        join teams as away on matches_detailed.away_team_name = away.team_name
        where matches_detailed.stage_name = @stage_name
        order by matches_detailed.datee desc, matches_detailed.kickoff_time_utc desc
    end
end
go

exec sp_get_matches_stage
    @stage_name = 'Group Stage', @group = 'L'
go
exec sp_get_matches_stage
    @stage_name = 'Final'
go
