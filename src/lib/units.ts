export function millilitresToLitres(millilitres: number) {
  return millilitres / 1000;
}

export function litresToIntegerMillilitres(litres: number) {
  return Math.round(litres * 1000);
}
