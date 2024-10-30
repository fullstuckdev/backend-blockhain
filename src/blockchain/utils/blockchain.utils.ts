import * as moment from 'moment';
import { TokenPrice, HourlyPrice } from '../types/priceAlert';
import { PrismaClient } from 'prisma';
import * as nodemailer from 'nodemailer';
import { PriceAlert } from '../types/priceAlert';

export function groupPricesByHour(prices: TokenPrice[]): HourlyPrice[] {
  const hourlyGroups = new Map<string, HourlyPrice>();

  prices.forEach((price) => {
    const hourKey = moment(price.timestamp).startOf('hour').toISOString();

    if (!hourlyGroups.has(hourKey)) {
      hourlyGroups.set(hourKey, {
        timestamp: moment(hourKey).toDate(),
        ethPrice: price.eth_price.toNumber(),
        maticPrice: price.matic_price.toNumber(),
        count: 1,
      });
    } else {
      const group = hourlyGroups.get(hourKey)!;
      group.ethPrice =
        (group.ethPrice * group.count + price.eth_price.toNumber()) /
        (group.count + 1);
      group.maticPrice =
        (group.maticPrice * group.count + price.matic_price.toNumber()) /
        (group.count + 1);
      group.count++;
    }
  });

  return Array.from(hourlyGroups.values());
}

export class BlockchainPriceMonitor {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly transporter: nodemailer.Transporter,
  ) {}

  // Feature 2: Check hourly price change and send email if > 3%
  public async checkHourlyPriceChange(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 3600000);

    const [currentPrices, oldPrices] = await Promise.all([
      this.prisma.tokenPrice.findFirst({
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.tokenPrice.findFirst({
        where: { timestamp: { lte: oneHourAgo } },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    if (!currentPrices || !oldPrices) return;

    const ethChange =
      ((Number(currentPrices.eth_price) - Number(oldPrices.eth_price)) /
        Number(oldPrices.eth_price)) *
      100;
    const maticChange =
      ((Number(currentPrices.matic_price) - Number(oldPrices.matic_price)) /
        Number(oldPrices.matic_price)) *
      100;

    if (ethChange > 3 || maticChange > 3) {
      await this.sendPriceChangeAlert(ethChange, maticChange);
    }
  }

  private async sendPriceChangeAlert(
    ethChange: number,
    maticChange: number,
  ): Promise<void> {
    const message = {
      from: process.env.SMTP_USER,
      to: process.env.PROD_REC,
      subject: '🚨 Crypto Price Alert - Significant Change Detected',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            Significant Price Change Alert
          </h2>
          
          <div style="margin: 20px 0;">
            <div style="padding: 15px; background: ${ethChange > 0 ? '#e6ffe6' : '#ffe6e6'}; border-radius: 5px; margin-bottom: 10px;">
              <strong>ETH:</strong> ${ethChange > 0 ? '↗️' : '↘️'} ${Math.abs(ethChange).toFixed(2)}%
            </div>
            
            <div style="padding: 15px; background: ${maticChange > 0 ? '#e6ffe6' : '#ffe6e6'}; border-radius: 5px;">
              <strong>MATIC:</strong> ${maticChange > 0 ? '↗️' : '↘️'} ${Math.abs(maticChange).toFixed(2)}%
            </div>
          </div>
          
          <div style="color: #666; font-size: 12px; margin-top: 20px;">
            Generated at: ${new Date().toLocaleString()}
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(message);
  }

  public async checkPriceAlerts(
    ethPrice: number,
    maticPrice: number,
  ): Promise<void> {
    // Add price validation
    if (ethPrice <= 0 || maticPrice <= 0) {
      throw new Error('Invalid price values');
    }

    // Get active alerts from database
    const activeAlerts = await this.prisma.priceAlert.findMany({
      where: { isTriggered: false },
    });

    for (const alert of activeAlerts) {
      const currentPrice = alert.chain === 'eth' ? ethPrice : maticPrice;

      // Use percentage threshold (e.g., within 1% of target)
      const threshold = Number(alert.target_pricing) * 0.01;
      if (Math.abs(currentPrice - Number(alert.target_pricing)) <= threshold) {
        await this.sendPriceAlert(
          {
            chain: alert.chain,
            targetPrice: Number(alert.target_pricing),
            email: alert.email,
          },
          currentPrice,
        );

        // Mark alert as triggered in database
        await this.prisma.priceAlert.update({
          where: { id: alert.id },
          data: { isTriggered: true },
        });
      }
    }
  }

  private async sendPriceAlert(
    alert: PriceAlert,
    currentPrice: number,
  ): Promise<void> {
    const message = {
      from: process.env.SMTP_USER,
      to: alert.email,
      subject: `Price Alert: ${alert.chain.toUpperCase()} has reached ${alert.targetPrice}`,
      text: `
        Your price alert has been triggered!
        ${alert.chain.toUpperCase()} has reached $${currentPrice}
      `,
    };

    await this.transporter.sendMail(message);
  }
}