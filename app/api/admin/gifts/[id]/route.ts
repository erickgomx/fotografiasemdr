import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { addExcludedGift } from "@/lib/exclusions";

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
    const gift = await prisma.gift.findUnique({
      where: { id },
    });

    if (!gift) {
      return NextResponse.json({
        success: true,
        message: "Presente já foi removido.",
      });
    }

    // Marca o presente na lista permanente de exclusões para nunca ser re-criado por auto-seeds
    addExcludedGift(gift.title);

    // Se houver pedidos associados, remove em cascata para garantir que o presente seja realmente deletado
    const orders = await prisma.order.findMany({
      where: { giftId: id },
      select: { id: true },
    });

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);

      await prisma.guestMessage.deleteMany({
        where: { orderId: { in: orderIds } },
      });

      await prisma.order.deleteMany({
        where: { id: { in: orderIds } },
      });
    }

    // Exclui o presente definitivamente
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
