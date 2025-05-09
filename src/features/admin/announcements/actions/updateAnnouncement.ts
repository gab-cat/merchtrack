'use server';

import { createLog } from "@/actions/logs.actions";
import prisma from "@/lib/prisma";
import { verifyPermission, processActionReturnData } from "@/utils";

export async function updateAnnouncement({
  userId,
  id,
  title,
  content,
  level
}: {
  userId: string;
  id: string;
  title: string;
  content: string;
  level: "INFO" | "WARNING" | "CRITICAL";
}) {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true, canUpdate: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to update announcements."
    };
  }

  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        level
      },
      include: {
        publishedBy: true
      }
    });

    await createLog({
      userId,
      createdById: userId,
      reason: "Announcement Updated",
      systemText: `Updated announcement: ${title}`,
      userText: `Announcement updated successfully`
    });

    return {
      success: true,
      data: processActionReturnData(announcement)
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update announcement"
    };
  }
}