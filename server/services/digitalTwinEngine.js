const { calculateWaterQualityScore } = require('./anomalyDetector');

/**
 * Prototype Digital Twin Simulation Engine
 * Predicts water quality outcomes based on what-if chemical dose changes.
 */
const runDigitalTwinSimulation = ({ pH, turbidity, chlorine, flow, pressure, chemicalDose }) => {
  const currentPH = Number(pH) || 7.2;
  const currentTurbidity = Number(turbidity) || 2.1;
  const currentChlorine = Number(chlorine) || 1.2;
  const doseInput = Number(chemicalDose) || 1.5;

  // Mathematical prototype simulation of chemical impact
  // Adding chlorine increases disinfectant residual and reduces active turbidity over time
  const predictedChlorine = parseFloat(Math.min(4.0, Math.max(0.1, currentChlorine + (doseInput * 0.45))).toFixed(2));
  
  // High chlorine dose slightly improves clarity / coagulant efficacy
  const turbidityReduction = doseInput * 0.3;
  const predictedTurbidity = parseFloat(Math.max(0.4, currentTurbidity - turbidityReduction).toFixed(2));
  
  // Chlorine addition slightly lowers pH (acidic effect)
  const predictedPH = parseFloat(Math.max(6.0, Math.min(9.0, currentPH - (doseInput * 0.05))).toFixed(2));

  const initialScore = calculateWaterQualityScore(currentPH, currentTurbidity, currentChlorine);
  const predictedScore = calculateWaterQualityScore(predictedPH, predictedTurbidity, predictedChlorine);

  let recommendation = '';
  if (predictedScore > initialScore) {
    recommendation = `Optimal Dose: Predicted water quality score improves from ${initialScore}/100 to ${predictedScore}/100. Disinfection efficiency is optimized.`;
  } else if (predictedScore === initialScore) {
    recommendation = `Neutral Dose: Water quality score remains steady at ${predictedScore}/100. Parameters are within acceptable baseline bounds.`;
  } else {
    recommendation = `Overdosing Warning: Added chemical dose causes excess residual or pH shift, decreasing quality score to ${predictedScore}/100. Reduce dosage.`;
  }

  return {
    inputParameters: { pH: currentPH, turbidity: currentTurbidity, chlorine: currentChlorine, flow, pressure },
    chemicalDose: doseInput,
    predictedOutput: {
      predictedTurbidity,
      predictedChlorine,
      predictedPH,
      waterQualityScore: predictedScore,
      feedback: recommendation
    },
    waterQualityScore: predictedScore,
    recommendation,
    simulationMode: 'Prototype Digital Twin Mathematical Engine',
    timestamp: new Date()
  };
};

module.exports = { runDigitalTwinSimulation };
