import restaurantsJson from '../public/data/restaurants.json';

export const activeSeason = restaurantsJson.activeSeason || 'holi';
export const isHoli = activeSeason === 'holi';
export const seasonName = isHoli ? 'Holi' : 'Diwali';

export const heroBgColor = isHoli
  ? 'linear-gradient(to right, hsla(245, 40%, 51%, 1), hsla(245, 60%, 44%, 1), hsla(245, 40%, 51%, 1))'
  : 'hsla(0, 37%, 17%, 1)';

export const heroPatternColor = isHoli
  ? 'hsla(29, 27%, 59%, 0.2)'
  : 'hsla(1, 44%, 27%, .45)';
