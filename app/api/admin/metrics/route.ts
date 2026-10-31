import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isMockMode } from "@/lib/mercadopago";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado. Faça login primeiro." },
      { status: 401 }
    );
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        gift: true,
        guestMessage: true,
      },
    });

    const totalOrders = orders.length;
    const approvedOrders = orders.filter((o) => o.status === "APPROVED");
    const pendingOrders = orders.filter((o) => o.status === "PENDING");
    const rejectedOrders = orders.filter((o) => o.status === "REJECTED");

    const totalRaised = approvedOrders.reduce((acc, curr) => acc + curr.amount, 0);
    const averageContribution = approvedOrders.length > 0 ? totalRaised / approvedOrders.length : 0;

    const totalGiftsCount = await prisma.gift.count();

    return NextResponse.json({
      success: true,
      data: {
        isMockMode: isMockMode(),
        metrics: {
          totalRaised,
          approvedCount: approvedOrders.length,
          pendingCount: pendingOrders.length,
          rejectedCount: rejectedOrders.length,
          totalOrders,
          averageContribution,
          totalGiftsCount,
        },
        orders,
      },
    });
  } catch (error) {
    console.error("[API /api/admin/metrics] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao carregar métricas" },
      { status: 500 }
    );
  }
}
