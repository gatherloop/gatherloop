export interface Game {
  title: string;
  image: string;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  minPlayers: number;
  maxPlayers: number;
  minAge: number;
  tags: string[];
  shelfName: string;
}
