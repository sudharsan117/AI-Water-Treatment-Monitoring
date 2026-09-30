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

module.exports = {
  THRESHOLDS,
  checkReadingAnomaly,
  calculateWaterQualityScore
};
