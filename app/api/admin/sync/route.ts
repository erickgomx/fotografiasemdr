import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { syncWeddingOrdersAndMessages } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isAuthenticated()) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 });
  }

  try {
    const result = await syncWeddingOrdersAndMessages(true);

    return NextResponse.json({
      success: true,
      message: `Sincronização limpa concluída com sucesso! Presentes do casamento e mensagens do mural atualizados em tempo real (${result.recoveredCount || 0} novos presentes resgatados, ${result.updatedCount || 0} atualizados).`,
      ...result,
    });
  } catch (error: any) {
    console.error("[Admin Sync All] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao sincronizar com Mercado Pago." },
      { status: 500 }
    );
  }
}
