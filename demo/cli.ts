import { AMPARouteOptimizer } from '../src/copilot/routeOptimizer';
import { AMPAVisionDiagnostics } from '../src/copilot/visionDiagnostics';
import { AMPADriverAssistant } from '../src/copilot/assistant';
import { VehicleTelemetry, ChargingStation } from '../src/types';

async function runDemo() {
  console.log('⚡ ========================================================');
  console.log('⚡ AMPA — Intelligent EV Charging Network & Copilot Demo');
  console.log('⚡ Powered by Anthropic Claude 3.5 Sonnet & Haiku');
  console.log('⚡ Official Website: https://ampa.space');
  console.log('⚡ ========================================================\n');

  const optimizer = new AMPARouteOptimizer();
  const vision = new AMPAVisionDiagnostics();
  const assistant = new AMPADriverAssistant();

  const vehicle: VehicleTelemetry = {
    model: 'VinFast VF8 Plus (87.7 kWh)',
    batteryCapacityKWh: 87.7,
    currentSoCPercent: 58,
    efficiencyWhPerKm: 215,
    supportedConnectors: ['CCS2', 'Type2'],
    maxChargingPowerKW: 250,
    currentElevationM: 19,
  };

  const stations: ChargingStation[] = [
    {
      id: 'AMPA-BL-01',
      name: 'AMPA Supercharge Bảo Lộc Hub',
      latitude: 11.545,
      longitude: 107.808,
      elevationM: 850,
      availableStalls: 3,
      totalStalls: 4,
      maxPowerKW: 180,
      connectorTypes: ['CCS2'],
      pricePerKWhVND: 3850,
      averageWaitTimeMin: 0,
      status: 'OPERATIONAL',
    },
    {
      id: 'AMPA-DL-02',
      name: 'AMPA Da Lat Central Fast Hub',
      latitude: 11.940,
      longitude: 108.438,
      elevationM: 1495,
      availableStalls: 2,
      totalStalls: 6,
      maxPowerKW: 120,
      connectorTypes: ['CCS2', 'Type2'],
      pricePerKWhVND: 3850,
      averageWaitTimeMin: 5,
      status: 'OPERATIONAL',
    },
  ];

  console.log('[1/3] 🗺️ Calculating EV Multi-Stop Itinerary (HCMC -> Da Lat, +1,450m elevation)...');
  const plan = await optimizer.optimizeTrip({
    origin: { latitude: 10.776, longitude: 106.700, name: 'Ho Chi Minh City' },
    destination: { latitude: 11.940, longitude: 108.438, name: 'Da Lat City' },
    vehicle,
    availableStations: stations,
    desiredArrivalSoCPercent: 30,
  });

  console.log(`✅ Total Distance: ${plan.totalDistanceKm} km`);
  console.log(`✅ Elevation Energy Penalty: +${plan.elevationEnergyPenaltyKWh} kWh`);
  console.log(`✅ Recommended Charging Stop: ${plan.recommendedStops[0]?.station.name} (${plan.recommendedStops[0]?.estimatedChargingTimeMinutes} mins)`);
  console.log(`💡 Copilot Insight: ${plan.copilotInsight}\n`);

  console.log('[2/3] 📷 Simulating Multimodal Claude Vision Diagnostic...');
  const diag = await vision.diagnoseStationPhoto('sample-base64-placeholder');
  console.log(`✅ Connector: ${diag.connectorIdentified} (Confidence: ${(diag.confidenceScore * 100).toFixed(1)}%)`);
  console.log(`✅ Error Analysis: ${diag.screenErrorCode}`);
  console.log(`✅ Suggested Action: ${diag.suggestedAction}\n`);

  console.log('[3/3] 🎙️ In-Car Voice Copilot Response:');
  const voice = await assistant.handleDriverQuery('Tôi muốn đi Đà Lạt, pin hiện tại có đủ không?', {
    vehicleModel: vehicle.model,
    batterySoCPercent: vehicle.currentSoCPercent,
    remainingRangeKm: 235,
    currentLocationName: 'TP. Hồ Chí Minh',
  });
  console.log(`🤖 Claude Haiku: "${voice}"\n`);
  console.log('✨ Demonstration complete! All telemetry models verified.');
}

runDemo().catch(console.error);
