import { Announcement } from "@prisma/client";

export type ExtendedAnnouncement = Announcement & {
  publishedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
};