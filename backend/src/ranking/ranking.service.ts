import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function getIsoWeekAndYear(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { year: d.getUTCFullYear(), week };
}

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  async getWeeklyRanking(limit: number = 10) {
    const { year, week } = getIsoWeekAndYear(new Date());

    const scores = await this.prisma.weeklyScore.findMany({
      where: { year, week },
      orderBy: { xp: 'desc' },
      take: limit,
      include: {
        user: {
          select: { tag: true, name: true },
        },
      },
    });

    return scores.map((s, i) => ({
      pos: i + 1,
      tag: s.user.tag,
      name: s.user.name,
      xp: s.xp,
    }));
  }
}
