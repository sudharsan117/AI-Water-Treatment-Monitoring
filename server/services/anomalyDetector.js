const THRESHOLDS = {
  pH: { min: 6.5, max: 8.5, warnMin: 6.8, warnMax: 8.2 },
  Turbidity: { max: 5.0, warnMax: 3.5 }, // NTU
  Chlorine: { min: 0.5, max: 3.0, warnMin: 1.0, warnMax: 2.5 }, // mg/L
  Flow: { min: 50, max: 200, warnMin: 70, warnMax: 180 }, // GPM
  Pressure: { min: 20, max: 80, warnMin: 30, warnMax: 70 }, // PSI
  Vibration: { max: 4.5, warnMax: 2.5 }, // mm/s
  Temperature: { max: 85, warnMax: 70 } // °C
};

const checkReadingAnomaly = (parameter, value) => {
  const cfg = THRESHOLDS[parameter];
  if (!cfg) return { status: 'NORMAL', severity: 'INFO', message: `${parameter} normal` };

  if (cfg.min !== undefined && value < cfg.min) {
    return {
      status: 'CRITICAL',
      severity: 'CRITICAL',
      message: `${parameter} level dropped to ${value.toFixed(2)} (Below critical minimum ${cfg.min})`
    };
  }
  if (cfg.max !== undefined && value > cfg.max) {
    return {
      status: 'CRITICAL',
      severity: 'CRITICAL',
      message: `${parameter} level exceeded ${value.toFixed(2)} (Above critical maximum ${cfg.max})`
    };
  }
  if (cfg.warnMin !== undefined && value < cfg.warnMin) {
    return {
      status: 'WARNING',
      severity: 'WARNING',
      message: `${parameter} is approaching lower warning boundary (${value.toFixed(2)})`
    };
  }
  if (cfg.warnMax !== undefined && value > cfg.warnMax) {
    return {
      status: 'WARNING',
      severity: 'WARNING',
      message: `${parameter} is approaching upper warning boundary (${value.toFixed(2)})`
    };
  }

  return { status: 'NORMAL', severity: 'INFO', message: `${parameter} is within optimal operating range` };
};

const calculateWaterQualityScore = (pH, turbidity, chlorine) => {
  let score = 100;
  // pH deviation penalty
  if (pH < 6.5 || pH > 8.5) score -= 30;
  else if (pH < 7.0 || pH > 8.0) score -= 10;

  // Turbidity penalty
  if (turbidity > 5.0) score -= 35;
  else if (turbidity > 2.5) score -= 15;
  else if (turbidity > 1.5) score -= 5;

  // Chlorine penalty
  if (chlorine < 0.5 || chlorine > 3.0) score -= 35;
  else if (chlorine < 1.0 || chlorine > 2.2) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Calculates equipment health score & status based on vibration & temperature telemetry.
 * Vibration threshold: warn > 2.5 mm/s, critical > 4.5 mm/s
 * Temperature threshold: warn > 70°C, critical > 85°C
 */
const calculateEquipmentHealth = (vibration, temperature) => {
  let score = 100;
  const vib = Number(vibration) || 0.5;
  const temp = Number(temperature) || 45.0;

  // Vibration Penalty
  if (vib > 4.5) {
    score -= 40 + (vib - 4.5) * 15;
  } else if (vib > 2.5) {
    score -= 15 + (vib - 2.5) * 10;
  }

  // Temperature Penalty
  if (temp > 85.0) {
    score -= 35 + (temp - 85.0) * 2;
  } else if (temp > 70.0) {
    score -= 15 + (temp - 70.0) * 1;
  }

  const finalScore = Math.max(15, Math.min(100, Math.round(score)));

  let status = 'OPERATIONAL';
  if (finalScore < 50 || vib > 4.5 || temp > 85.0) {
    status = 'CRITICAL';
  } else if (finalScore <= 80 || vib > 2.5 || temp > 70.0) {
    status = 'WARNING';
  }

  return { healthScore: finalScore, status };
};

module.exports = {
  THRESHOLDS,
  checkReadingAnomaly,
  calculateWaterQualityScore,
  calculateEquipmentHealth
};
