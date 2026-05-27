import { Vector2D } from "./Interfaces";

export function setVec(v: Vector2D, x: number, y: number): Vector2D {
  v.x = x;
  v.y = y;
  return v;
}

export function copyVec(dest: Vector2D, src: Vector2D): Vector2D {
  dest.x = src.x;
  dest.y = src.y;
  return dest;
}

export function zeroVec(v: Vector2D): Vector2D {
  v.x = 0;
  v.y = 0;
  return v;
}

export function cloneVec(src: Vector2D): Vector2D {
  return { x: src.x, y: src.y };
}
