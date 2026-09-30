/**
 * Rule-Based AI Chemical Dose Recommendation Engine
 * Calculates recommended chlorine dosing based on current water parameters.
 * Note: Clearly labeled as academic prototype / simulation logic.
 */
const getDoseRecommendation = ({ pH, turbidity, chlorine, flow, pressure }) => {
  const currentChlorine = chlorine || 1.2;
  const currentTurbidity = turbidity || 2.0;
  const currentFlow = flow || 120;
  const targetChlorine = 2.0; // Target optimal chlorine residual mg/L

  let recommendedDose = targetChlorine;
  let reasons = [];
  let confidence = 94; // Base confidence percentage

  // Chlorine deficiency check
  if (currentChlorine < targetChlorine) {
    const deficit = targetChlorine - currentChlorine;
    recommendedDose = currentChlorine + (deficit * 1.15);
    reasons.push(`Chlorine level (${currentChlorine.toFixed(2)} mg/L) is below target (${targetChlorine} mg/L)`);
  } else if (currentChlorine > targetChlorine + 0.5) {
    recommendedDose = currentChlorine - 0.4;
    reasons.push(`Chlorine level (${currentChlorine.toFixed(2)} mg/L) is above optimal range`);
  } else {
    reasons.push(`Chlorine level (${currentChlorine.toFixed(2)} mg/L) is near target boundary`);
  }

  // Turbidity compensation (Higher turbidity requires higher chlorine demand)
  if (currentTurbidity > 2.5) {
    const turbidityMultiplier = 1 + (currentTurbidity - 2.5) * 0.08;
    recommendedDose *= turbidityMultiplier;
    reasons.push(`Elevated turbidity (${currentTurbidity.toFixed(2)} NTU) increases disinfectant demand`);
  }

  // Flow rate scaling (Higher flow rates dilute chemicals faster)
  if (currentFlow > 140) {
    recommendedDose += 0.2;
    reasons.push(`High plant flow rate (${currentFlow.toFixed(0)} GPM) requires slight dosage elevation`);
    confidence -= 2;
  }

  // pH influence (High pH reduces chlorine effectiveness)
  if (pH > 7.8) {
    recommendedDose += 0.15;
    reasons.push(`High pH (${pH.toFixed(2)}) reduces chlorine disinfection efficiency`);
  }

  // Clamp recommended dose between 0.5 and 4.0 mg/L
  recommendedDose = Math.max(0.5, Math.min(4.0, parseFloat(recommendedDose.toFixed(2))));

  const explanation = reasons.length > 0 
    ? reasons.join('. ') + '.'
    : 'Water parameters are optimal. Maintain standard baseline dosing.';

  return {
    chemical: 'Chlorine',
    currentValue: currentChlorine,
    recommendedDose,
    confidence: Math.min(99, Math.max(75, confidence)),
    reason: explanation,
    timestamp: new Date()
  };
};

module.exports = { getDoseRecommendation };
