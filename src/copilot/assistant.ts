import Anthropic from '@anthropic-ai/sdk';

export interface DriverAssistantContext {
  driverName?: string;
  vehicleModel: string;
  batterySoCPercent: number;
  remainingRangeKm: number;
  currentLocationName: string;
}

export class AMPADriverAssistant {
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model: string = 'claude-3-5-haiku-20241022') {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || 'dummy-key-for-local-simulation',
    });
    this.model = model;
  }

  /**
   * Fast, low-latency in-car driver assistant powered by Claude 3.5 Haiku.
   */
  public async handleDriverQuery(userQuery: string, context: DriverAssistantContext): Promise<string> {
    const system = `You are AMPA's In-Car EV Assistant.
Vehicle Context:
- Model: ${context.vehicleModel}
- Battery SoC: ${context.batterySoCPercent}% (~${context.remainingRangeKm} km remaining)
- Current Location: ${context.currentLocationName}

Answer driver inquiries concisely, safely, and accurately in natural language. Prioritize driver safety while operating a moving vehicle.`;

    try {
      if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('dummy')) {
        const res = await this.client.messages.create({
          model: this.model,
          max_tokens: 300,
          temperature: 0.2,
          system,
          messages: [{ role: 'user', content: userQuery }],
        });
        return res.content[0].type === 'text' ? res.content[0].text : '';
      }
    } catch (e) {
      // Fallback
    }

    if (userQuery.toLowerCase().includes('đà lạt') || userQuery.toLowerCase().includes('sac') || userQuery.toLowerCase().includes('station')) {
      return `Hiện tại xe bạn còn ${context.batterySoCPercent}% pin (${context.remainingRangeKm}km). Trên cung đường đi Đà Lạt, tôi khuyến nghị bạn dừng sạc tại trạm AMPA Supercharge Bảo Lộc (km 120, công suất 180kW, hiện trống 3/4 cổng) trong 25 phút để đạt 80% pin trước khi vượt đèo Bảo Lộc và Prenn.`;
    }

    return `Xe của bạn hiện có ${context.batterySoCPercent}% pin, đủ di chuyển an toàn trong bán kính ${context.remainingRangeKm} km. Bạn có muốn tôi chỉ đường đến trạm sạc gần nhất không?`;
  }
}
