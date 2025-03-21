import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculatePagination, processActionReturnData } from "@/utils";
import { QueryParams } from "@/types/common";

export async function POST(
  req: NextRequest,
): Promise<NextResponse> {
  try {
    const params: QueryParams = await req.json();
    const {  where, include, orderBy, limitFields } = params;
    const { take, skip, page } = calculatePagination(params);
    const orders = await prisma.order.findMany({
      take: take ? Number(take) : 10,
      skip: skip ? Number(skip) : 0,
      where,
      include,
      orderBy
    });

    const total = await prisma.order.count({ where });

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No orders found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: processActionReturnData(orders, limitFields),
      metadata: {
        total,
        page: page ?? 1,
        lastPage: Math.ceil(total / (params.limit ?? 10)),
        hasNextPage: (page ?? 1) < Math.ceil(total / (params.limit ?? 10)),
        hasPrevPage: (page ?? 1) > 1
      } 
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: (error as Error).message
    }, { status: 500 });
  }
}