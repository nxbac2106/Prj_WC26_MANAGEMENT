use WorldCup26_db
go

--delete matches_detailed where match_id > 104
--delete matches where match_id > 104
--delete player_tournament_statistics where player_id > 1248
--delete player_squads where player_id > 1248
--delete teams where team_id > 48


/* PROCEDURE1: TRA CUU LICH THI DAU - KET QUA TRAN DAU THEO VONG DAU */
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
    @stage_name = 'Group Stage', @group = 'A'
go
exec sp_get_matches_stage
    @stage_name = 'Final'
go


/* PROCEDURE2: THEM DU LIEU*/
/* 2.1: THEM DOI TUYEN*/
--drop procedure sp_add_team
--go
create procedure sp_add_team
    @team_id int = null,
    @team_name nvarchar(100),
    @fifa_code_name nvarchar(10),
    @groupp nvarchar(10),
    @confederation nvarchar(100),
    @fifa_ranking_per_tournament int = null,
    @elo_rating float = null,
    @coach_name nvarchar(100) = null
as
begin
    set nocount on 
    set xact_abort on

    set @team_name = LTRIM(RTRIM(@team_name))
    set @fifa_code_name = UPPER(LTRIM(rtrim(@fifa_code_name)))
    set @groupp = UPPER(LTRIM(rtrim(@groupp)))
    set @confederation = UPPER(LTRIM(rtrim(@confederation)))
    set @coach_name = nullif(LTRIM(RTRIM(@coach_name)), '')

    declare @mess nvarchar(200)

    if ISNULL(@team_name, '') = '' or ISNULL(@fifa_code_name, '') = '' or ISNULL(@groupp, '') = '' or ISNULL(@confederation, '') = ''
        throw 50001, 'Missing required: team name, FIFA code, group, confederation', 1
    if @fifa_code_name not like '[A-Z][A-Z][A-Z]' throw 50001, 'FIFA code must be 3 letters', 1
    begin try
        begin transaction
            if @team_id is not null and exists (select 1 from teams where team_id = @team_id)
            begin
                set @mess = concat('Team ID ', @team_id, 'already exists');
                throw 50001, @mess, 1
            end
            if @team_name is not null and exists (select 1 from teams where team_name = @team_name)
            begin
                set @mess = concat('Team name ', @team_id, 'already exists');
                throw 50001, @mess, 1
            end

            if @team_id is null select @team_id = isnull(max(team_id), 0) + 1 from teams with (updlock, holdlock)
        
            insert into teams (team_id, team_name, fifa_code_name, groupp, confederation, fifa_ranking_per_tournament, elo_rating, coach_name) values (@team_id, @team_name, @fifa_code_name, @groupp, @confederation, @fifa_ranking_per_tournament, @elo_rating, @coach_name)
        
        commit transaction
        select * from teams where team_id = @team_id
    end try

    begin catch
        if @@TRANCOUNT > 0 rollback transaction;
        throw
    end catch
end
go


/* 2.2: THEM CAU THU VAO DOI TUYEN */
--drop procedure sp_add_player
--go
create procedure sp_add_player
    @player_id int = null,
    --@team_id int,
    @team_name nvarchar(100),
    @player_name nvarchar(100),
    @position nvarchar(100),
    @club_team nvarchar(100) = null,
    @market_eur int = null,
    @caps int = null,
    @birth date = null,
    @height_cm int = null,
    @goals_for_country int = null,
    @shirt_number int = null

as
begin
    set nocount on
    set xact_abort on 

    declare @mess nvarchar(100)
    declare @team_id int = 0
    select @team_id = team_id from teams where team_name = @team_name

    set @team_name = LTRIM(RTRIM(@team_name)) 
    set @player_name = LTRIM(RTRIM(@player_name))
    set @position = LTRIM(RTRIM(@position))
    set @position = case lower(LTRIM(RTRIM(@position))) 
                    when 'goalkeeper' then 'Goalkeeper' when 'defender' then 'Defender'
                    when 'midfielder' then 'Midfielder' when 'forward'  then 'Forward' end
    set @club_team = nullif(LTRIM(RTRIM(@club_team)), '')

    if @team_id = 0 throw 50001, 'Not found Teams (team_id)', 1;
    if @player_name is null throw 50001, 'Player name is not null ', 1
    if @position is null throw 50001, 'Position is not null, (Goalkeeper, Defender, Midfielder, Forward)', 1
    if @market_eur < 0 throw 50001, 'Market_eur > 0', 1
    if @height_cm < 0 throw 50001, 'height_cm > 0', 1
    if @goals_for_country < 0 throw 50001, 'goals_for_country > 0', 1
    if @shirt_number not between 1 and 99 throw 50001, ' 1 < shirt_number < 99', 1

    begin try
        begin transaction
            if @player_id is not null and exists (select 1 from player_squads where player_id = @player_id)
            begin
                set @mess = concat('Player ID ', @player_id, ' already exists');
                throw 50001, @mess, 1
            end
            if @player_id is null select @player_id = ISNULL(max(player_id), 0) +1 from player_squads with (updlock, holdlock)
            if @shirt_number is not null and exists (select 1 from player_tournament_statistics with (updlock, holdlock) where shirt_number = @shirt_number and team_id = @team_id)
            begin
                set @mess = concat('Shirt number ', @shirt_number, ' already exists');
                throw 50001, @mess, 1
            end

            if (select count(*) from player_squads with (updlock, holdlock) where team_id = @team_id ) >= 26 
            begin
                set @mess = concat(@team_name, ' already has 26 players');
                throw 50001, @mess, 1
            end

            insert into player_squads (player_id, team_id, player_name, position, club_team, market_eur, caps, birth, height_cm, goals_for_country) 
            values (@player_id, @team_id, @player_name, @position, @club_team, @market_eur, @caps, @birth, @height_cm, @goals_for_country)

            insert into player_tournament_statistics (player_id, player_name, team_id, position, shirt_number)
            values (@player_id, @player_name, @team_id, @position, @shirt_number)
        commit transaction

        select * from player_squads where player_id = @player_id
        select * from player_tournament_statistics where player_id = @player_id
    end try

    begin catch
        if @@TRANCOUNT > 0 rollback transaction;
        throw
    end catch
end
go

/* 2.3: THEM TRAN DAU */
--drop procedure sp_add_match
--go
create or alter procedure sp_add_match
    @match_id int = null,
    @datee date,
    @kickoff_time_utc time(0),
    @statuss nvarchar(100) = 'Scheduled',
    @stage_id int,
    @stadium_id int,
    @referee_id int,
    @home_team_id int,
    @away_team_id int,
    @home_score int = null,
    @away_score int = null

as
begin
    set nocount on
    set xact_abort on

    set @statuss = LTRIM(RTRIM(ISNULL(@statuss, '')))

    declare @mess nvarchar(200)
    declare @stage_name nvarchar(100)
    declare @stadium_name nvarchar(100)
    declare @city nvarchar(100)
    declare @country nvarchar(100)
    declare @referee_name nvarchar(100)
    declare @home_name nvarchar(100)
    declare @home_code nvarchar(100)
    declare @home_group nvarchar(10)
    declare @away_name nvarchar(100)
    declare @away_code nvarchar(100)
    declare @away_group nvarchar(10)

    select @stage_name = stage_name from tournament_stages where stage_id = @stage_id
    select @stadium_name = stadium_name, @city = city, @country = country from stadiums where stadium_id = @stadium_id
    select @referee_name = referee_name from referees where referee_id = @referee_id
    select @home_name = team_name, @home_code = fifa_code_name, @home_group = groupp from teams where team_id = @home_team_id
    select @away_name = team_name, @away_code = fifa_code_name, @away_group = groupp from teams where team_id = @away_team_id

    if @datee is null or @kickoff_time_utc is null throw 50001, 'Date and kickoff time are required', 1
    
    if @statuss = '' throw 50001, 'Match status is required', 1
    if @stage_name is null throw 50001, 'Stage does not exist', 1
    if @stadium_name is null throw 50001, 'Stadium does not exist', 1
    if @referee_name is null throw 50001, 'Referee does not exist', 1

    if @home_name is null throw 50001, 'Home team does not exist', 1
    if @away_name is null throw 50001, 'Away team does not exist', 1

    if @home_team_id = @away_team_id throw 50001, 'Home and away team must be different', 1
    if @home_score < 0 or @away_score < 0 throw 50001, 'Scores >= 0', 1
    if (@home_score is null and @away_score is not null) or (@home_score is not null and @away_score is null) throw 50001, 'Enter both scores, or leave both empty', 1
    if @home_score is null and (@statuss like '%complet%' or @statuss like '%finish%' or @statuss like '%full%') throw 50001, 'A Completed match must have a score', 1
    if @stage_name = 'Group Stage' and @home_group <> @away_group throw 50001, 'Both teams must be in the same group (Group stage)', 1

    begin try
        begin transaction
            if exists (select 1 from matches with (updlock, holdlock) where datee = @datee and (home_team_id in (@home_team_id, @away_team_id) or away_team_id in (@home_team_id, @away_team_id)))
            begin
                set @mess = concat('One of these teams already has a match on ', @datee);
                throw 50001, @mess, 1
            end

            if @match_id is not null and exists (select 1 from matches where match_id = @match_id)
            begin
                set @mess = concat('Match ID ', @match_id, ' already exists');
                throw 50001, @mess, 1
            end
            if @match_id is null select @match_id = ISNULL(max(match_id), 0) + 1 from matches with (updlock, holdlock)

            insert into matches (match_id, datee, kickoff_time_utc, stage_id, stadium_id, home_team_id, away_team_id, home_score, away_score, statuss, referee_id)
            values (@match_id, @datee, @kickoff_time_utc, @stage_id, @stadium_id, @home_team_id, @away_team_id, @home_score, @away_score, @statuss, @referee_id)

            insert into matches_detailed (match_id, datee, kickoff_time_utc, stage_name, stadium_name, city, country, home_team_name, home_fifa_code, away_team_name, away_fifa_code, home_score, away_score, statuss, referee_name)
            values (@match_id, @datee, @kickoff_time_utc, @stage_name, @stadium_name, @city, @country, @home_name, @home_code, @away_name, @away_code, @home_score, @away_score, @statuss, @referee_name)
        commit transaction

        select * from matches where match_id = @match_id
        select * from matches_detailed where match_id = @match_id
    end try

    begin catch
        if @@TRANCOUNT > 0 rollback transaction;
        throw
    end catch
end
go


/* PROCEDURE3: CAP NHAT DU LIEU*/
/* 3.1: CAP NHAT TEAM */
create procedure sp_update_team
    @team_id int,
    @groupp nvarchar(10),
    @confederation nvarchar(100),
    @fifa_ranking_per_tournament int = null,
    @elo_rating float = null,
    @coach_name nvarchar(100) = null

as
begin
    set nocount on
    set xact_abort on

    set @groupp = UPPER(LTRIM(RTRIM(@groupp)))
    set @confederation = UPPER(LTRIM(RTRIM(@confederation)))
    set @coach_name = nullif(LTRIM(RTRIM(@coach_name)), '')

    if not exists (select 1 from teams where team_id = @team_id) throw 50001, 'Team not found', 1
    if ISNULL(@groupp, '') = ''  throw 50001, 'Group are required', 1
    if ISNULL(@confederation, '') = '' throw 50001, 'Confederation are required', 1
    if @fifa_ranking_per_tournament < 0 or @elo_rating < 0 throw 50001, 'FIFA ranking / Elo > 0', 1

    begin try
        begin transaction
            update teams set groupp = @groupp, confederation = @confederation, fifa_ranking_per_tournament = @fifa_ranking_per_tournament, elo_rating = @elo_rating, coach_name = @coach_name
            where team_id = @team_id
        commit transaction

        select * from teams where team_id = @team_id
    end try

    begin catch
        if @@TRANCOUNT > 0 rollback transaction;
        throw
    end catch
end
go


/* 3.2: CAP NHAT PLAYER */
create procedure sp_update_player
    @player_id int,
    @position nvarchar(100),
    @shirt_number int = null,
    @club_team nvarchar(100) = null,
    @height_cm int = null,
    @caps int = null,
    @goals_for_country int = null,
    @market_eur int = null

as
begin
    set nocount on
    set xact_abort on

    declare @mess nvarchar(200)
    declare @team_id int
    select @team_id = team_id from player_squads where player_id = @player_id

    set @club_team = nullif(LTRIM(RTRIM(@club_team)), '')
    set @position = case lower(LTRIM(RTRIM(ISNULL(@position, ''))))
                    when 'goalkeeper' then 'Goalkeeper' when 'defender' then 'Defender'
                    when 'midfielder' then 'Midfielder' when 'forward' then 'Forward' end

    if @team_id = 0 throw 50001, 'Not found Teams (team_id)', 1;
    if @position is null throw 50001, 'Position is not null, (Goalkeeper, Defender, Midfielder, Forward)', 1
    if @market_eur < 0 throw 50001, 'Market_eur > 0', 1
    if @height_cm < 0 throw 50001, 'height_cm > 0', 1
    if @goals_for_country < 0 throw 50001, 'goals_for_country > 0', 1
    if @shirt_number not between 1 and 99 throw 50001, ' 1 < shirt_number < 99', 1

    begin try
        begin transaction
            if @shirt_number is not null
               and exists (select 1 from player_tournament_statistics with (updlock, holdlock)
                           where team_id = @team_id and shirt_number = @shirt_number and player_id <> @player_id)
            begin
                set @mess = concat('Shirt number ', @shirt_number, ' is already taken in this team');
                throw 50001, @mess, 1
            end

            update player_squads set position = @position, club_team = @club_team, height_cm = @height_cm, caps = @caps, goals_for_country = @goals_for_country, market_eur = @market_eur
            where player_id = @player_id

            update player_tournament_statistics set position = @position, shirt_number = @shirt_number
            where player_id = @player_id
        commit transaction

        select * from player_squads where player_id = @player_id
        select * from player_tournament_statistics where player_id = @player_id
    end try
    begin catch
        if @@TRANCOUNT > 0 rollback transaction;
        throw
    end catch
end
go


/* 3.3: CAP NHAT MATCH */
create procedure sp_update_match
    @match_id int,
    @statuss nvarchar(100),
    @home_score int = null,
    @away_score int = null,
    @result_type nvarchar(100) = null,
    @home_xg float = null,
    @away_xg float = null

as
begin
    set nocount on
    set xact_abort on

    set @statuss = LTRIM(RTRIM(ISNULL(@statuss, '')))
    set @result_type = nullif(LTRIM(RTRIM(@result_type)), '')

    if not exists (select 1 from matches where match_id = @match_id) throw 50001, 'Match not found', 1
    if @statuss = '' throw 50001, 'Match status is required', 1
    if @home_score < 0 or @away_score < 0 throw 50001, 'Scores >= 0', 1
    if @home_xg < 0 or @away_xg < 0 throw 50001, 'xG >= 0', 1
    if (@home_score is null and @away_score is not null) or (@home_score is not null and @away_score is null) throw 50001, 'Enter both scores, or leave both empty', 1
    if @home_score is null and (@statuss like '%complet%' or @statuss like '%finish%' or @statuss like '%full%') throw 50001, 'A Completed match must have a score', 1
    if UPPER(@result_type) = 'PEN' and ISNULL(@home_score, -1) <> ISNULL(@away_score, -1) throw 50001, 'Result type PEN only applies when the score is level', 1

    begin try
        begin transaction
            update matches set home_score = @home_score, away_score = @away_score, statuss = @statuss, result_type = @result_type, home_xg = @home_xg, away_xg = @away_xg
            where match_id = @match_id

            update matches_detailed set home_score = @home_score, away_score = @away_score, statuss = @statuss, result_type = @result_type, home_xg = @home_xg, away_xg = @away_xg
            where match_id = @match_id
        commit transaction

        select * from matches where match_id = @match_id
        select * from matches_detailed where match_id = @match_id
    end try

    begin catch
        if @@TRANCOUNT > 0 rollback transaction;
        throw
    end catch
end
go


/* PROCEDURE4: XOA DU LIEU*/
/* 4.1: XOA PLAYER */
-- drop procedure sp_delete_player
-- go
create procedure sp_delete_player
    @player_id int,
    @force bit = 0

as
begin
    set nocount on
    set xact_abort on

    declare @mess nvarchar(400)
    declare @player_name nvarchar(100)
    declare @events int
    declare @lineups int
    declare @pom int

    select @player_name = player_name from player_squads where player_id = @player_id

    if @player_name is null throw 50001, 'Player not found', 1

    select @events = count(*) from match_events where player_id = @player_id
    select @lineups = count(*) from match_team_lineups where player_id = @player_id
    select @pom = count(*) from matches where player_of_the_match_id = @player_id

    if @force = 0 and (@events > 0 or @lineups > 0 or @pom > 0)
    begin
        set @mess = concat(@player_name, ' already has ', @events, ' events, ', @lineups, ' appearances and ', @pom, ' Man of the Match awards. Use @force = 1 to also delete the related match data');
        throw 50001, @mess, 1
    end

    begin try
        begin transaction
            delete from match_events where player_id = @player_id
            delete from match_team_lineups where player_id = @player_id

            update matches_detailed set player_of_the_match_name = null where match_id in (select match_id from matches where player_of_the_match_id = @player_id)
            update matches set player_of_the_match_id = null where player_of_the_match_id = @player_id

            delete from player_tournament_statistics where player_id = @player_id
            delete from player_squads where player_id = @player_id

        commit transaction

        select @player_id as player_id, @player_name as player_name
    end try

    begin catch
        if @@TRANCOUNT > 0 rollback transaction;
        throw
    end catch
end
go


/* 4.2: XOA TEAM (xoa ca cac Player trong Team) */
--drop procedure sp_delete_team
--go
create procedure sp_delete_team
    @team_id int,
    @force bit = 0

as
begin
    set nocount on
    set xact_abort on

    declare @mess nvarchar(400)
    declare @team_name nvarchar(100)
    declare @players int
    declare @matches int
    declare @related int

    select @team_name = team_name from teams where team_id = @team_id
    if @team_name is null throw 50001, 'Team not found', 1

    select @players = count(*) from player_squads where team_id = @team_id
    select @matches = count(*) from matches where home_team_id = @team_id or away_team_id = @team_id

    select @related =
        (select count(*) from match_events where team_id = @team_id or player_id in (select player_id from player_squads where team_id = @team_id)
            or match_id in (select match_id from matches where home_team_id = @team_id or away_team_id = @team_id))
      + (select count(*) from match_team_lineups where team_id = @team_id or player_id in (select player_id from player_squads where team_id = @team_id)
            or match_id in (select match_id from matches where home_team_id = @team_id or away_team_id = @team_id))
      + (select count(*) from match_team_statistics where team_id = @team_id or match_id in (select match_id from matches where home_team_id = @team_id or away_team_id = @team_id))

    if @force = 0 and (@matches > 0 or @related > 0)
    begin
        set @mess = concat(@team_name, ' already has ', @matches, ' matches and related data. Use @force = 1 to also delete the match data');
        throw 50001, @mess, 1
    end

    begin try
        begin transaction
            -- POM la cau thu cua doi nay -> bo gan
            update matches_detailed set player_of_the_match_name = null 
            where match_id in (select match_id from matches where player_of_the_match_id in (select player_id from player_squads where team_id = @team_id))
            
            update matches set player_of_the_match_id = null
            where player_of_the_match_id in (select player_id from player_squads where team_id = @team_id)

            if @force = 1
            begin
                delete from match_events
                where team_id = @team_id or player_id in (select player_id from player_squads where team_id = @team_id) or match_id in (select match_id from matches where home_team_id = @team_id or away_team_id = @team_id)

                delete from match_team_lineups 
                where team_id = @team_id or player_id in (select player_id from player_squads where team_id = @team_id) or match_id in (select match_id from matches where home_team_id = @team_id or away_team_id = @team_id)

                delete from match_team_statistics
                where team_id = @team_id or match_id in (select match_id from matches where home_team_id = @team_id or away_team_id = @team_id)

                delete from matches_detailed
                where match_id in (select match_id from matches where home_team_id = @team_id or away_team_id = @team_id)

                delete from matches where home_team_id = @team_id or away_team_id = @team_id
            end

            delete from player_tournament_statistics
            where team_id = @team_id or player_id in (select player_id from player_squads where team_id = @team_id)

            delete from player_squads where team_id = @team_id
            delete from teams where team_id = @team_id
        commit transaction

        select @team_name as team_name, @players as players_deleted, case when @force = 1 then @matches else 0 end as matches_deleted
    end try

    begin catch
        if @@TRANCOUNT > 0 rollback transaction;
        throw
    end catch
end
go


/* 4.3: XOA MATCH */
--drop procedure sp_delete_match
--go
create procedure sp_delete_match
    @match_id int,
    @force bit = 0

as
begin
    set nocount on
    set xact_abort on

    declare @mess nvarchar(400)
    declare @home nvarchar(100)
    declare @away nvarchar(100)
    declare @events int
    declare @lineups int
    declare @stats int

    select @home = home.team_name, @away = away.team_name
    from matches
    join teams as home on home.team_id = matches.home_team_id
    join teams as away on away.team_id = matches.away_team_id
    where matches.match_id = @match_id

    if @home is null throw 50001, 'Match not found', 1

    select @events = count(*) from match_events where match_id = @match_id
    select @lineups = count(*) from match_team_lineups where match_id = @match_id
    select @stats = count(*) from match_team_statistics where match_id = @match_id

    if @force = 0 and (@events > 0 or @lineups > 0 or @stats > 0)
    begin
        set @mess = concat('Match #', @match_id, ' already has ', @events, ' events, ', @lineups, ' lineup rows and ', @stats, ' team statistics rows. Use @force = 1 to also delete them');
        throw 50001, @mess, 1
    end

    begin try
        begin transaction
            delete from match_events where match_id = @match_id
            delete from match_team_lineups where match_id = @match_id
            delete from match_team_statistics where match_id = @match_id
            delete from matches_detailed where match_id = @match_id
            delete from matches where match_id = @match_id
        commit transaction

        select @match_id as match_id, @home as home_team_name, @away as away_team_name
    end try

    begin catch
        if @@TRANCOUNT > 0 rollback transaction;
        throw
    end catch
end
go


-- TEST --
exec sp_add_team  @team_name = N'Việt Nam', @fifa_code_name = 'VIE', @groupp = 'A', @confederation = 'AFC'
exec sp_add_team  @team_name = N'Thailand', @fifa_code_name = 'THA', @groupp = 'A', @confederation = 'AFC'
exec sp_add_player @team_name = N'Việt Nam', @player_name = N'Nguyễn Quang Hải', @position = 'Goalkeeper', @shirt_number = 19
exec sp_add_match @datee = '2026-11-11', @kickoff_time_utc = '18:00', @stage_id = 1, @stadium_id = 1, @referee_id = 1, @home_team_id = 51, @away_team_id = 50
go

exec sp_update_match @match_id = 105, @statuss = 'Completed', @home_score = 2, @away_score = 1, @result_type = 'FT'
go

exec sp_delete_player @player_id = 1249, @force = 1   
exec sp_delete_team   @team_id = 51, @force = 1
exec sp_delete_match  @match_id = 105, @force = 1
go
