export type Polygon = Array<[number, number]>;

export function isValidPolygon(polygon: Polygon): boolean {
  if (!Array.isArray(polygon) || polygon.length < 3) return false;
  return polygon.every(
    (point) =>
      Array.isArray(point) &&
      point.length === 2 &&
      typeof point[0] === "number" &&
      typeof point[1] === "number" &&
      point[0] >= -90 &&
      point[0] <= 90 &&
      point[1] >= -180 &&
      point[1] <= 180
  );
}

export function pointInPolygon(polygon: Polygon, lat: number, lng: number): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const current = polygon[i];
    const previous = polygon[j];
    if (!current || !previous) continue;

    const [latI, lngI] = current;
    const [latJ, lngJ] = previous;

    const intersects =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;

    if (intersects) inside = !inside;
  }
  return inside;
}
