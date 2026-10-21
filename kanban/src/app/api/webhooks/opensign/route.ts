// src/app/api/webhooks/opensign/route.ts - Handler de webhook OpenSign
// Para uso com servidor Express/Fastify customizado (não Next.js)

import { getOpenSignClient, type WebhookPayload } from '../../../../lib/opensign';

export interface WebhookRequest {
  body: string;
  headers: Record<string, string>;
}

export interface WebhookResponse {
  status: number;
  body: any;
}

/**
 * Processa webhook do OpenSign
 * Valida HMAC, roteia eventos, atualiza cards no Kanban
 */
export async function handleOpenSignWebhook(req: WebhookRequest): Promise<WebhookResponse> {
  try {
    const signature = req.headers['x-opensign-signature'] ||
                      req.headers['x-webhook-signature'] ||
                      req.headers['signature'];

    if (!signature) {
      return { status: 401, body: { error: 'Assinatura ausente' } };
    }

    const client = getOpenSignClient();
    let payload: WebhookPayload;

    try {
      payload = client.parseWebhook(req.body, signature);
    } catch (e) {
      return { status: 401, body: { error: 'Assinatura inválida' } };
    }

    const cardId = payload.metadata?.external_id;
    if (!cardId) {
      return { status: 400, body: { error: 'external_id (cardId) não encontrado no metadata' } };
    }

    console.log(`📥 [Webhook] ${payload.event} para card ${cardId}`);

    // Roteia evento
    switch (payload.event) {
      case 'recipient_signed':
        await handleRecipientSigned(cardId, payload);
        break;

      case 'document_completed':
        await handleDocumentCompleted(cardId, payload);
        break;

      case 'document_expired':
        await handleDocumentExpired(cardId);
        break;

      case 'document_declined':
        await handleDocumentDeclined(cardId, payload);
        break;

      default:
        console.log(`⚠️  Evento não tratado: ${payload.event}`);
    }

    return { status: 200, body: { received: true } };

  } catch (error: any) {
    console.error('❌ [Webhook] Erro:', error.message);
    return { status: 500, body: { error: error.message } };
  }
}

async function handleRecipientSigned(cardId: string, payload: WebhookPayload) {
  const signer = payload.signers.find(s => s.status === 'signed');
  console.log(`✍️  [${cardId}] ${signer?.name} (${signer?.email}) assinou`);

  // TODO: Integração real com Kanban
  // await updateCard(cardId, {
  //   lastSignedBy: signer?.name,
  //   signStatus: 'in_progress',
  //   signedAt: signer?.signedAt,
  // });
}

async function handleDocumentCompleted(cardId: string, payload: WebhookPayload) {
  console.log(`✅ [${cardId}] Documento completo - todos assinaram`);

  const client = getOpenSignClient();

  try {
    // Baixa PDF assinado
    const pdfBuffer = await client.downloadSignedPdf(payload.documentId);

    // TODO: Integração real com Kanban
    // await attachFile(cardId, pdfBuffer, `assinado-${payload.documentTitle}.pdf`);
    // await moveCard(cardId, 'Assinado');

    console.log(`📎 [${cardId}] PDF assinado baixado (${pdfBuffer.length} bytes)`);
  } catch (e: any) {
    console.error(`❌ [${cardId}] Falha ao baixar PDF:`, e.message);
  }
}

async function handleDocumentExpired(cardId: string) {
  console.log(`⏰ [${cardId}] Documento expirado`);
  // TODO: await moveCard(cardId, 'Expirado');
}

async function handleDocumentDeclined(cardId: string, payload: WebhookPayload) {
  const decliner = payload.signers.find(s => s.status === 'declined');
  console.log(`❌ [${cardId}] Recusado por ${decliner?.name} (${decliner?.email})`);
  // TODO: await moveCard(cardId, 'Recusado');
}

/**
 * Middleware Express/Fastify pronto para uso
 */
export function createWebhookMiddleware() {
  return async (req: any, res: any) => {
    // Captura raw body para validação HMAC
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await handleOpenSignWebhook({
      body: rawBody,
      headers: req.headers,
    });

    res.status(result.status).json(result.body);
  };
}