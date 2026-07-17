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

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Activity {
  title: string;
  description: string;
  image: string;
}
