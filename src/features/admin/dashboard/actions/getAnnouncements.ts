import prisma from '@/lib/db';
import { ExtendedAnnouncement } from '@/types/announcement';
import { processActionReturnData } from '@/utils';

export default async function getAnnouncements(limit?: number): ActionsReturnType<ExtendedAnnouncement[]> {
  try {
    const announcements = await prisma.announcement.findMany({
      take: limit,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        publishedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return {
      success: true,
      data: processActionReturnData(announcements) as ExtendedAnnouncement[]
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch announcements"
    };
  }
}