'use server';
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { processActionReturnData } from "@/utils";
import { createLog } from "@/actions/logs.actions";

export async function createAnnouncement({
  userId,
  title,
  content,
  type,
  level
}: {
  userId: string;
  title: string;
  content: string;
  type: "NORMAL" | "SYSTEM";
  level: "INFO" | "WARNING" | "CRITICAL";
}) {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true, canCreate: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to create announcements."
    };
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type,
        level,
        publishedById: userId
      },
      include: {
        publishedBy: true
      }
    });

    await createLog({
      userId,
      createdById: userId,
      reason: "Announcement Created",
      systemText: `Created new ${type} announcement: ${title}`,
      userText: `New announcement created successfully`
    });

    return {
      success: true,
      data: processActionReturnData(announcement)
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create announcement"
    };
  }
}