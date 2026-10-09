import { z } from 'zod';

export const ConnectorTypeSchema = z.enum([
  'CCS2',
  'CHAdeMO',
  'Type2',
  'GBT_DC',
  'GBT_AC',
  'Tesla_NACS'
]);

export type ConnectorType = z.infer<typeof ConnectorTypeSchema>;

export const VehicleTelemetrySchema = z.object({
  model: z.string(),
  batteryCapacityKWh: z.number().positive(),
  currentSoCPercent: z.number().min(0).max(100),
  efficiencyWhPerKm: z.number().positive(),
  supportedConnectors: z.array(ConnectorTypeSchema),
  maxChargingPowerKW: z.number().positive(),
  currentElevationM: z.number().default(0),
});

export type VehicleTelemetry = z.infer<typeof VehicleTelemetrySchema>;

export const ChargingStationSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  elevationM: z.number(),
  availableStalls: z.number().int().nonnegative(),
  totalStalls: z.number().int().positive(),
  maxPowerKW: z.number().positive(),
  connectorTypes: z.array(ConnectorTypeSchema),
  pricePerKWhVND: z.number().positive(),
  averageWaitTimeMin: z.number().default(0),
  status: z.enum(['OPERATIONAL', 'DEGRADED', 'OFFLINE']),
});

export type ChargingStation = z.infer<typeof ChargingStationSchema>;

export interface RouteOptimizationRequest {
  origin: { latitude: number; longitude: number; name: string };
  destination: { latitude: number; longitude: number; name: string };
  vehicle: VehicleTelemetry;
  availableStations: ChargingStation[];
  desiredArrivalSoCPercent?: number;
}

export interface ChargingStopRecommendation {
  station: ChargingStation;
  targetArrivalSoCPercent: number;
  recommendedChargeToPercent: number;
  estimatedChargingTimeMinutes: number;
  estimatedCostVND: number;
  rationale: string;
}

export interface OptimizedTripPlan {
  totalDistanceKm: number;
  totalDurationMinutes: number;
  drivingDurationMinutes: number;
  chargingDurationMinutes: number;
  recommendedStops: ChargingStopRecommendation[];
  arrivalSoCPercent: number;
  elevationEnergyPenaltyKWh: number;
  copilotInsight: string;
}

export interface MultimodalDiagnosticResult {
  connectorIdentified: ConnectorType | 'UNKNOWN';
  confidenceScore: number;
  physicalDamageDetected: boolean;
  screenErrorCode?: string;
  suggestedAction: string;
  isSessionSafeToStart: boolean;
  detailedAnalysis: string;
}
