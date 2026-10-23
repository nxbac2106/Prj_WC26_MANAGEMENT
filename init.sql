create database WorldCup26_db
go

use WorldCup26_db

-- 
create table referees (
	referee_id int primary key,
	referee_name nvarchar(100) not null,
	country nvarchar(100) not null,
	avg_cards_per_match float
)

create table stadiums (
	stadium_id int primary key,
	stadium_name nvarchar(100) not null,
	city nvarchar(100) not null,
	country nvarchar(100) not null,
	capacity int,
	latitude float,
	longitude float
)

create table tournament_stages (
	stage_id int primary key,
	stage_name nvarchar(100) not null,
	is_knockout int
)

create table teams (
	team_id int primary key,
	team_name nvarchar(100) not null,
	fifa_code_name nvarchar(100) not null,
	groupp nvarchar(10) not null,
	confederation nvarchar(100) not null,
	fifa_ranking_per_tournament int,
	elo_rating float,
	coach_name nvarchar(100)
)

create table player_squads (
	player_id int primary key,
	team_id int not null,
	player_name nvarchar(100) not null,
	position nvarchar(100) not null,
	club_team nvarchar(100),
	market_eur int,
	caps int,
	birth date,
	height_cm int,
	goals_for_country int,

	foreign key (team_id) references teams(team_id)
)

create table player_tournament_statistics (
    player_id int primary key,
    player_name nvarchar(100) not null,
    team_id int not null,
    position nvarchar(100),
    matches_played int default 0,
    matches_started int default 0,
    minutes_played int default 0,
    goals int default 0,
    assists int default 0,
    shots int default 0,
    shots_on_target int default 0,
    yellow_cards int default 0,
    red_cards int default 0,
    penalty_goals int default 0,
    own_goals int default 0,
    clean_sheets float default 0,
    saves float default 0.0,
    avg_rating float,

    foreign key (player_id) references player_squads(player_id),
    foreign key (team_id) references teams(team_id)
);

create table matches (
    match_id int primary key,
    datee date,
    kickoff_time_utc time(0),
    stage_id int not null,
    stadium_id int not null,
    home_team_id int not null,
    away_team_id int not null,
    home_score int,
    away_score int,
    statuss nvarchar(100),
    result_type nvarchar(100),
    home_xg float,
    away_xg float,
    referee_id int not null,
    player_of_the_match_id int,

    foreign key (stage_id) references tournament_stages(stage_id),
    foreign key (stadium_id) references stadiums(stadium_id),
    foreign key (home_team_id) references teams(team_id),
    foreign key (away_team_id) references teams(team_id),
    foreign key (referee_id) references referees(referee_id),
    foreign key (player_of_the_match_id) references player_squads(player_id)
);

create table matches_detailed (
    match_id int primary key,
    datee date,
    kickoff_time_utc time(0),
    stage_name nvarchar(100),
    stadium_name nvarchar(100),
    city nvarchar(100),
    country nvarchar(100),
    home_team_name nvarchar(100),
    home_fifa_code nvarchar(10),
    away_team_name nvarchar(100),
    away_fifa_code nvarchar(10),
    home_score int default 0,
    away_score int default 0,
    statuss nvarchar(100),
    result_type nvarchar(100),
    home_xg float,
    away_xg float,
    player_of_the_match_name nvarchar(100),
    referee_name nvarchar(100),

    foreign key (match_id) references matches(match_id)
);

create table match_events (
    event_id int primary key,
    match_id int not null,
    minutee int not null,
    event_type nvarchar(100) not null,
    team_id int not null,
    player_id int not null,

    foreign key (match_id) references matches(match_id),
    foreign key (team_id) references teams(team_id),
    foreign key (player_id) references player_squads(player_id)
);

create table match_team_lineups (
    lineup_id int primary key,
    match_id int not null,
    player_id int not null,
    team_id int not null,
    is_starting int default 0,
    tactical_position nvarchar(100),
    minutes_played int default 0,

    foreign key (match_id) references matches(match_id),
    foreign key (player_id) references player_squads(player_id),
    foreign key (team_id) references teams(team_id)
);

create table match_team_statistics (
    match_id int not null,
    team_id int not null,
    possession_pct int,
    total_shots int default 0,
    shows_on_target int default 0,
    corners int default 0,
    fouls int default 0,
    offsides int default 0,
    saves int default 0,
    player_of_the_match nvarchar(100),

    primary key (match_id, team_id),
    foreign key (match_id) references matches(match_id),
    foreign key (team_id) references teams(team_id)
);


-- INSERT DU LIEU
bulk insert referees
from 'D:\btl_hqt\datasets\referees.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

bulk insert stadiums
from 'D:\btl_hqt\datasets\stadiums.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

bulk insert tournament_stages
from 'D:\btl_hqt\datasets\tournament_stages.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

bulk insert teams
from 'D:\btl_hqt\datasets\teams.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

bulk insert player_squads
from 'D:\btl_hqt\datasets\player_squads.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

bulk insert player_tournament_statistics
from 'D:\btl_hqt\datasets\player_tournament_statistics.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n', 
    codepage = '65001'
);

bulk insert matches
from 'D:\btl_hqt\datasets\matches.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

bulk insert matches_detailed
from 'D:\btl_hqt\datasets\matches_detailed.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

bulk insert match_events
from 'D:\btl_hqt\datasets\match_events.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

bulk insert match_team_lineups
from 'D:\btl_hqt\datasets\match_team_lineups.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

bulk insert match_team_statistics
from 'D:\btl_hqt\datasets\match_team_statistics.csv' 
with (
    format = 'CSV',
    firstrow = 2,           
    fieldterminator = ',',  
    rowterminator = '\n',   
    codepage = '65001'
);

select * from referees
select * from stadiums
select * from tournament_stages
select * from teams
select * from player_squads
select * from player_tournament_statistics
select * from matches
select * from matches_detailed
select * from match_events
select * from match_team_lineups
select * from match_team_statistics

--drop table referees
--drop table stadiums
--drop table tournament_stages
--drop table teams
--drop table player_squads
--drop table player_tournament_statistics
--drop table matches_detailed
--drop table match_events
--drop table match_team_lineups
--drop table match_team_statistics
--drop table matches

--delete referees
--delete stadiums
--delete tournament_stages
--delete teams
--delete player_squads
--delete player_tournament_statistics
--delete matches_detailed
--delete match_events
--delete match_team_lineups
--delete match_team_statistics
--delete matches
