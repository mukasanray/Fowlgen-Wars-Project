import { createHmac, timingSafeEqual } from 'crypto';

// src/lib/opensign.ts - Cliente API tipado para OpenSign
// Uso: import { getOpenSignClient, type Signer } from '@/lib/opensign'

export interface Signer {
  name: string;
  email: string;
  phone?: string;
  authType: 'email' | 'whatsapp' | 'sms' | 'certificate';
}

export interface SignRequestOptions {
  expiresInDays?: number;
  redirectUrl?: string;
  metadata?: Record<string, string>;
}

export interface SignRequestResult {
  cardId: string;
  documentId: string;
  documentTitle: string;
  expiresAt: string;
  signers: Array<{
    name: string;
    email: string;
    signUrl: string;
    status: 'pending' | 'signed' | 'declined' | 'expired';
  }>;
}

export interface WebhookPayload {
  event: 'document_completed' | 'recipient_signed' | 'document_expired' | 'document_declined';
  documentId: string;
  documentTitle: string;
  metadata: {
    external_id: string; // cardId do Kanban
    [key: string]: string;
  };
  signers: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    signedAt?: string;
  }>;
  pdfUrl?: string;
}

class OpenSignClient {
  private baseUrl: string;
  private apiToken: string;
  private webhookSecret: string;

  constructor() {
    this.baseUrl = process.env.OPENSIGN_URL || 'http://localhost:3001';
    this.apiToken = process.env.OPENSIGN_API_TOKEN || '';
    this.webhookSecret = process.env.OPENSIGN_WEBHOOK_SECRET || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenSign API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // Cria solicitação de assinatura para um card do Kanban
  async createSignRequestForCard(
    cardId: string,
    pdfUrl: string,
    signers: Signer[],
    options: SignRequestOptions = {}
  ): Promise<SignRequestResult> {
    const documentTitle = `Card ${cardId} - ${new Date().toLocaleDateString('pt-BR')}`;

    const response = await this.request<any>('/documents', {
      method: 'POST',
      body: JSON.stringify({
        title: documentTitle,
        fileUrl: pdfUrl,
        signers: signers.map(s => ({
          name: s.name,
          email: s.email,
          phone: s.phone,
          auth_type: s.authType,
        })),
        expires_in_days: options.expiresInDays || 30,
        redirect_url: options.redirectUrl,
        metadata: {
          external_id: cardId,
          ...options.metadata,
        },
      }),
    });

    // Normaliza resposta da API OpenSign
    return {
      cardId,
      documentId: response.id || response.documentId,
      documentTitle: response.title || documentTitle,
      expiresAt: response.expires_at || response.expiresAt,
      signers: (response.signers || response.recipients || []).map((s: any) => ({
        name: s.name,
        email: s.email,
        signUrl: s.sign_url || s.signUrl || `${process.env.OPENSIGN_PUBLIC_URL}/sign/${s.id}`,
        status: s.status || 'pending',
      })),
    };
  }

  // Baixa PDF assinado
  async downloadSignedPdf(documentId: string): Promise<Buffer> {
    const response = await fetch(`${this.baseUrl}/api/v1/documents/${documentId}/download`, {
      headers: { 'Authorization': `Bearer ${this.apiToken}` },
    });

    if (!response.ok) {
      throw new Error(`Falha ao baixar PDF: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  // Busca status do documento
  async getDocumentStatus(documentId: string): Promise<any> {
    return this.request(`/documents/${documentId}`);
  }

  // Valida assinatura HMAC do webhook
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expected = createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expected);
      if (sigBuf.length !== expBuf.length) return false;
      return timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  // Parseia e valida webhook
  parseWebhook(rawBody: string, signature: string): WebhookPayload {
    if (!this.validateWebhookSignature(rawBody, signature)) {
      throw new Error('Assinatura de webhook inválida');
    }
    return JSON.parse(rawBody);
  }
}

// Singleton
let clientInstance: OpenSignClient | null = null;

export function getOpenSignClient(): OpenSignClient {
  if (!clientInstance) {
    clientInstance = new OpenSignClient();
  }
  return clientInstance;
}

// Helper para uso direto
export async function createSignRequest(
  cardId: string,
  pdfUrl: string,
  signers: Signer[],
  options?: SignRequestOptions
): Promise<SignRequestResult> {
  const client = getOpenSignClient();
  return client.createSignRequestForCard(cardId, pdfUrl, signers, options);
}