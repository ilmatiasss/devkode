// Geometría de puntos compartida por los globos de la portada y de la sección Proyectos.

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

export type Cloud = { lon: Float32Array; y: Float32Array; r: Float32Array; count: number };

// Puntos repartidos parejo sobre la esfera (espiral de Fibonacci)
export function sphere(count: number): Cloud {
  const lon = new Float32Array(count);
  const y = new Float32Array(count);
  const r = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const yi = 1 - (2 * (i + 0.5)) / count;
    y[i] = yi;
    r[i] = Math.sqrt(1 - yi * yi);
    lon[i] = (i * GOLDEN) % (Math.PI * 2);
  }
  return { lon, y, r, count };
}

// Una hebra: puntos a lo largo de un meridiano, de polo a polo
export function strand(count: number, offset: number): Cloud {
  const lon = new Float32Array(count);
  const y = new Float32Array(count);
  const r = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const yi = 0.97 - (1.94 * i) / (count - 1);
    y[i] = yi;
    r[i] = Math.sqrt(1 - yi * yi);
    lon[i] = offset;
  }
  return { lon, y, r, count };
}
