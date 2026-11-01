import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { title, description, imageUrl, price, category, active } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl.trim();
    if (price !== undefined) dataToUpdate.price = Math.max(197, Number(price));
    if (category !== undefined) dataToUpdate.category = category.trim();
    if (active !== undefined) dataToUpdate.active = Boolean(active);

    const updatedGift = await prisma.gift.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      data: updatedGift,
      message: "Presente atualizado com sucesso!",
    });
  } catch (error: any) {
    console.error(`[API PATCH /api/admin/gifts/${id}] Erro:`, error);
    return NextResponse.json(
      { success: false, error: "Erro ao atualizar presente." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { success: false, error: "Acesso não autorizado." },
      { status: 401 }
    );
  }

  const { id } = params;

  try {
    // Verifica se possui pedidos associados
    const ordersCount = await prisma.order.count({
      where: { giftId: id },
    });

    if (ordersCount > 0) {
      // Se tem pedidos, desativa para não quebrar integridade referencial
      await prisma.gift.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        success: true,
        message: "O presente possui pedidos vinculados e foi desativado do catálogo público.",
      });
    }

    await prisma.gift.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Presente excluído com sucesso!",
    });
  } catch (error: any) {
    console.error(`[API DELETE /api/admin/gifts/${id}] Erro:`, error);
    return NextResponse.json(
      { success: false, error: "Erro ao remover presente." },
      { status: 500 }
    );
  }
}
