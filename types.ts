
export type Language = 'en' | 'es' | 'fr' | 'de' | 'nl' | 'it' | 'zh' | 'ja' | 'ko' | 'ar';

export enum Category {
  SPORTS = 'Sports',
  ARTISTS = 'Artists',
  VIDEO_GAMES = 'Video Games',
  STREAMERS = 'Streamers',
  CARS = 'Cars'
}

export enum SubSport {
  FOOTBALL = 'Football',
  TENNIS = 'Tennis',
  F1 = 'F1',
  BASKETBALL = 'Basketball',
  AM_FOOTBALL = 'NFL',
  PADEL = 'Padel'
}

export enum SubCategory {
  // Sports
  PREMIER_LEAGUE = 'Premier League',
  LA_LIGA = 'La Liga',
  BUNDESLIGA = 'Bundesliga',
  LEGENDS_FOOTBALL = 'Football Legends',
  ATP = 'ATP',
  WTA = 'WTA',
  LEGENDS_TENNIS = 'Tennis Legends',
  F1_DRIVERS = 'F1 Drivers',
  LEGENDS_F1 = 'F1 Legends',
  NBA_STARS = 'NBA Stars',
  LEGENDS_NBA = 'NBA Legends',
  NFL_STARS = 'NFL Stars',
  LEGENDS_NFL = 'NFL Legends',
  PADEL_PROS = 'Padel Pros',
  LEGENDS_PADEL = 'Padel Legends',
  
  // Artists
  POP = 'Pop & Global',
  ROCK = 'Rock Icons',
  RAP = 'Rap & Hip-Hop',
  KPOP = 'K-Pop',
  LATIN = 'Reggaeton & Latin',
  LEGENDS_ARTISTS = 'Artist Legends',
  
  // Games
  GAMES_SOCIAL = 'Social & Creative',
  GAMES_ACTION = 'Action & Adventure',
  GAMES_SHOOTER = 'Shooter & FPS',
  GAMES_RPG = 'RPG & Fantasy',
  LEGENDS_GAMES = 'GOTY Winners',
  
  // Streamers
  STREAM_EN = 'English Streamers',
  STREAM_ES = 'Spanish Streamers',
  STREAM_FR = 'French Streamers',
  LEGENDS_STREAMERS = 'Streamer Legends',
  
  // Cars
  CARS_NORMAL = 'Normal Cars',
  CARS_SUPERCARS = 'Supercars',
  CARS_LUXURY = 'Luxury Cars',
  LEGENDS_CARS = 'Legend Cars'
}

export type Year = 1990 | 2000 | 2010 | 2018 | 2020 | 2022 | 2025;

export interface GameState {
  players: string[];
  impostorCount: number;
  category: Category;
  selectedSport?: SubSport;
  subCategory: SubCategory;
  year: Year;
  status: 'SETUP' | 'REVEAL' | 'STARTING' | 'PLAYING';
  revealedCount: number;
  playerRoles: { name: string; role: 'CREWMATE' | 'IMPOSTOR'; secret: string }[];
  firstTurnPlayer: string;
  usedPlayers: Set<string>;
}

export interface Translation {
  title: string;
  start: string;
  addPlayer: string;
  impostors: string;
  category: string;
  year: string;
  revealRole: string;
  nextTurn: string;
  help: string;
  rate: string;
  feedback: string;
  impostorHint: string;
  crewmateHint: string;
  roleTooltip: string;
  topicTooltip: string;
  feedbackPlaceholder: string;
  submit: string;
}
