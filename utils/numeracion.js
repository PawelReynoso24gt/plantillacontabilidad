// src/utils/numeracion.js
export const aplicarNumeracion = (rows, maxLevels = 4) => {
  const counters = Array(maxLevels).fill(0);

  return rows.map((row) => {
    if (!row.nivel) {
      return { ...row, cuenta: '' };
    }

    const level = row.nivel;
    counters[level - 1]++;

    for (let i = level; i < counters.length; i++) {
      counters[i] = 0;
    }

    const parts = counters.slice(0, level).filter((n) => n > 0);
    const cuentaStr = parts.join('.');

    // 👇 muy importante: se hace spread de `row`,
    // así NO se pierde `esCuenta`
    return {
      ...row,
      cuenta: cuentaStr
    };
  });
};
