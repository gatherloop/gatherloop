export function formatDuration(min: number, max: number): string {
  return min === max ? `${min} menit` : `${min}–${max} menit`;
}

export function formatPlayers(min: number, max: number): string {
  return min === max ? `${min} pemain` : `${min}–${max} pemain`;
}

export function formatAge(minAge: number): string {
  return `${minAge}+`;
}
