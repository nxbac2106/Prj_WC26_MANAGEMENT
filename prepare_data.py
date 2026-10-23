import pandas as pd

# PLAYERS_TOURNAMENT_STATISTICS
df = pd.read_csv(r"datasets\players_tournament_statistics.csv", encoding="utf-8")
df = df.drop(columns= ["goals_conceded","data_source", "last_verified"], errors= "ignore")
# print(df.head())
df.to_csv(r"datasets\players_tournament_statistics.csv", index= False, encoding="utf-8")

# STADIUMS:
df = pd.read_csv(r"datasets\stadiums.csv")
df = df.drop(columns= ["elevation_meters"], errors= "ignore")
df.to_csv(r"datasets\stadiums.csv", index= False, encoding= "utf-8")

# MATCHES_TEAM_STATISTICS:
df = pd.read_csv(r"datasets\match_team_statistics.csv")
df = df.drop(columns= ["home_goalkeeper", "away_goalkeeper","data_source", "last_updated"], errors= "ignore")
df.to_csv(r"datasets\match_team_statistics.csv", index= False, encoding = "utf-8")

# MATCHES
df = pd.read_csv(r"datasets\matches.csv")
df = df.drop(columns= ["home_penalty_score", "away_penalty_score"], errors= "ignore")
df.to_csv(r"datasets\matches.csv", index= False, encoding= "utf-8")

# MATCHES_DETAILED 
df = pd.read_csv(r"datasets\matches_detailed.csv")
df = df.drop(columns= ["home_penalty_score", "away_penalty_score", "home_goalkeeper", "away_goalkeeper"], errors= "ignore")
df.to_csv(r"datasets\matches_detailed.csv", index= False, encoding= "utf-8")
