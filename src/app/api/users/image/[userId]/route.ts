
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/redis';
import clerk from '@/lib/clerk';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const userImage = await getCached<string>(`user:${userId}:image`);

    

    if (!userImage) {
      const clerkClient = await clerk;
      const user = await clerkClient.users.getUser(userId);
      await setCached(`user:${userId}:image`, user?.imageUrl, 60 * 30);

      return NextResponse.json({
        success: true,
        data: user?.imageUrl ?? ''
      });
    }

    return NextResponse.json({
      success: true,
      data: userImage
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        errors: { error }
      },
      { status: 500 }
    );
  }
}