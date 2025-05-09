'use server';
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils/permissions";
import { processActionReturnData } from "@/utils";
import { createLog } from "@/actions/logs.actions";


export async function deleteAnnouncement({
  userId,
  id
}: {
  userId: string;
  id: string;
}) {
  const isAuthorized = await verifyPermission({
    userId,
    permissions: {
      dashboard: { canRead: true, canDelete: true },
    }
  });

  if (!isAuthorized) {
    return {
      success: false,
      message: "You are not authorized to delete announcements."
    };
  }

  try {
    const announcement = await prisma.announcement.delete({
      where: { id }
    });

    await createLog({
      userId,
      createdById: userId,
      reason: "Announcement Deleted",
      systemText: `Deleted announcement: ${announcement.title}`,
      userText: `Announcement deleted successfully`
    });

    return {
      success: true,
      data: processActionReturnData(announcement)
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete announcement"
    };
  }
}