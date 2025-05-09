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