import { createHmac, timingSafeEqual } from 'crypto';
import * as path from 'path';
import { registerDocument, resolveCardId } from './opensign-registry';

// Cliente da API pública do OpenSign v1.1.
// Referência: https://docs.opensignlabs.com/docs/API-docs/v1.1
// Autenticação: header `x-api-token` (NÃO `Authorization: Bearer`).
//
// Importante: a API v1.1 é um recurso do OpenSign cloud/enterprise. O
// self-host gratuito não expõe essas rotas — nesse caso o instalador reporta
// "blocked" e nenhuma credencial é inventada.

export interface Signer {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  company?: string;
  jobTitle?: string;
}

export interface SignRequestOptions {
  expiresInDays?: number;
  redirectUrl?: string;
  note?: string;
  description?: string;
  sendEmail?: boolean;
  sendInOrder?: boolean;
  enableOTP?: boolean;
  metadata?: Record<string, string>;
}

export interface SignUrl {
  email: string;
  url: string;
}

export interface CreateDocumentResult {
  objectId: string;
  signurl: SignUrl[];
  message?: string;
}

export interface DocumentDetails {
  objectId: string;
  file?: string;
  title?: string;
  note?: string;
  status?: string;
  signers?: Array<{ name?: string; email?: string; status?: string }>;
  [key: string]: unknown;
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

export type WebhookEvent =
  | 'document_completed'
  | 'recipient_signed'
  | 'document_expired'
  | 'document_declined'
  | 'document_viewed'
  | 'document_created'
  | 'unknown';

export interface WebhookPayload {
  event: WebhookEvent;
  rawEvent: string;
  documentId: string;
  documentTitle: string;
  metadata: {
    external_id: string; // cardId do Kanban (resolvido pelo registro local)
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
  certificateUrl?: string;
}

/** Payload documentado do webhook OpenSign v1.1 (campos variam por evento). */
export interface OpenSignWebhookBody {
  event?: string;
  type?: string;
  objectId?: string;
  file?: string;
  name?: string;
  note?: string;
  description?: string;
  signers?: Array<{ name?: string; email?: string; phone?: string; url?: string; status?: string }>;
  signer?: { name?: string; email?: string; phone?: string };
  viewedBy?: string;
  declinedBy?: string;
  viewedAt?: string;
  signedAt?: string;
  declinedAt?: string;
  completedAt?: string;
  createdAt?: string;
  certificate?: string;
  url?: string;
  // Compatibilidade com payloads legados do Kanban.
  documentId?: string;
  documentTitle?: string;
  metadata?: Record<string, string>;
}

export class OpenSignApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly body: string) {
    super(message);
    this.name = 'OpenSignApiError';
  }
}

export interface OpenSignClientOptions {
  baseUrl?: string;
  apiToken?: string;
  webhookSecret?: string;
  rootDir?: string;
  timeoutMs?: number;
}

const EVENT_MAP: Record<string, WebhookEvent> = {
  completed: 'document_completed',
  signed: 'recipient_signed',
  declined: 'document_declined',
  viewed: 'document_viewed',
  created: 'document_created',
  // Nomes já normalizados são aceitos para compatibilidade.
  document_completed: 'document_completed',
  recipient_signed: 'recipient_signed',
  document_declined: 'document_declined',
  document_viewed: 'document_viewed',
  document_created: 'document_created'
};

export function normalizeEvent(rawEvent: string | undefined): WebhookEvent {
  if (!rawEvent) return 'unknown';
  return EVENT_MAP[rawEvent] ?? 'unknown';
}

export function buildApiBaseUrl(opensignUrl: string, version = process.env.OPENSIGN_API_VERSION || 'v1.1'): string {
  const trimmed = opensignUrl.replace(/\/+$/, '');
  return `${trimmed}/api/${version}`;
}

export class OpenSignClient {
  private readonly baseUrl: string;
  private readonly apiToken: string;
  private readonly webhookSecret: string;
  private readonly rootDir: string;
  private readonly timeoutMs: number;

  constructor(options: OpenSignClientOptions = {}) {
    this.baseUrl = (
      options.baseUrl ||
      process.env.OPENSIGN_API_BASE_URL ||
      buildApiBaseUrl(process.env.OPENSIGN_PUBLIC_URL || process.env.OPENSIGN_URL || 'http://localhost:3001')
    ).replace(/\/+$/, '');
    this.apiToken = options.apiToken ?? process.env.OPENSIGN_API_TOKEN ?? '';
    this.webhookSecret = options.webhookSecret ?? process.env.OPENSIGN_WEBHOOK_SECRET ?? '';
    this.rootDir = options.rootDir ?? process.env.KANBAN_ROOT ?? process.cwd();
    this.timeoutMs = options.timeoutMs ?? 20000;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  hasApiToken(): boolean {
    return Boolean(this.apiToken);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiToken) {
      throw new OpenSignApiError(
        'OPENSIGN_API_TOKEN não configurado (a API v1.1 exige x-api-token)',
        0,
        ''
      );
    }

    const url = `${this.baseUrl}${endpoint}`;
    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-api-token': this.apiToken,
          ...options.headers
        },
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (error) {
      throw new OpenSignApiError(
        `Falha de rede ao chamar ${endpoint}: ${(error as Error).message}`,
        0,
        ''
      );
    }

    const body = await response.text();
    if (!response.ok) {
      throw new OpenSignApiError(
        `OpenSign API ${endpoint} retornou HTTP ${response.status}`,
        response.status,
        body.slice(0, 500)
      );
    }

    if (!body) return {} as T;
    try {
      return JSON.parse(body) as T;
    } catch {
      throw new OpenSignApiError(`Resposta não-JSON de ${endpoint}`, response.status, body.slice(0, 200));
    }
  }

  /** GET /getuser — valida o token e retorna os dados da conta. */
  async getUser(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/getuser', { method: 'GET' });
  }

  /** POST /createdocument — o campo `file` deve ser o PDF em base64. */
  async createDocument(input: {
    fileBase64: string;
    title: string;
    signers: Signer[];
    note?: string;
    description?: string;
    timeToCompleteDays?: number;
    redirectUrl?: string;
    sendEmail?: boolean;
    sendInOrder?: boolean;
    enableOTP?: boolean;
  }): Promise<CreateDocumentResult> {
    if (!input.fileBase64 || !input.title || !input.signers?.length) {
      throw new OpenSignApiError('createdocument exige file (base64), title e ao menos 1 signer', 0, '');
    }

    return this.request<CreateDocumentResult>('/createdocument', {
      method: 'POST',
      body: JSON.stringify({
        file: input.fileBase64,
        title: input.title,
        note: input.note,
        description: input.description,
        timeToCompleteDays: input.timeToCompleteDays ?? 30,
        redirect_url: input.redirectUrl,
        send_email: input.sendEmail ?? true,
        sendInOrder: input.sendInOrder ?? true,
        enableOTP: input.enableOTP ?? false,
        signers: input.signers.map((signer) => ({
          name: signer.name,
          email: signer.email,
          phone: signer.phone,
          role: signer.role ?? 'signer',
          company: signer.company,
          job_title: signer.jobTitle
        }))
      })
    });
  }

  /**
   * Cria o documento para um card e registra o vínculo documento→card,
   * necessário porque o webhook não devolve metadata customizada.
   */
  async createSignRequestForCard(
    cardId: string,
    pdfBase64: string,
    signers: Signer[],
    options: SignRequestOptions = {}
  ): Promise<SignRequestResult> {
    if (/^https?:\/\//i.test(pdfBase64)) {
      throw new OpenSignApiError(
        'A API v1.1 exige o PDF em base64 no campo "file" (URL não é aceita). Baixe o PDF e converta para base64.',
        0,
        ''
      );
    }

    const documentTitle = options.metadata?.title || `Card ${cardId}`;
    const created = await this.createDocument({
      fileBase64: pdfBase64,
      title: documentTitle,
      signers,
      note: options.note,
      description: options.description,
      timeToCompleteDays: options.expiresInDays ?? 30,
      redirectUrl: options.redirectUrl,
      sendEmail: options.sendEmail,
      sendInOrder: options.sendInOrder,
      enableOTP: options.enableOTP
    });

    registerDocument(this.rootDir, created.objectId, cardId);

    return {
      cardId,
      documentId: created.objectId,
      documentTitle,
      expiresAt: new Date(Date.now() + (options.expiresInDays ?? 30) * 86400000).toISOString(),
      signers: (created.signurl ?? []).map((entry) => {
        const match = signers.find((signer) => signer.email === entry.email);
        return {
          name: match?.name ?? entry.email,
          email: entry.email,
          signUrl: entry.url,
          status: 'pending' as const
        };
      })
    };
  }

  /** GET /signinglinks/{id} */
  async getSigningLinks(documentId: string): Promise<SignUrl[]> {
    const result = await this.request<{ objectId?: string; signurl?: SignUrl[] }>(
      `/signinglinks/${encodeURIComponent(documentId)}`,
      { method: 'GET' }
    );
    return result.signurl ?? [];
  }

  /** GET /document/{id} */
  async getDocumentStatus(documentId: string): Promise<DocumentDetails> {
    return this.request<DocumentDetails>(`/document/${encodeURIComponent(documentId)}`, { method: 'GET' });
  }

  /**
   * Baixa o PDF assinado: consulta /document/{id} e busca a URL em `file`.
   * A API v1.1 não documenta um endpoint dedicado de download.
   */
  async downloadSignedPdf(documentId: string): Promise<Buffer> {
    const document = await this.getDocumentStatus(documentId);
    const file = document.file;
    if (!file) {
      throw new OpenSignApiError(`Documento ${documentId} não possui campo "file"`, 0, '');
    }

    if (/^https?:\/\//i.test(file)) {
      const response = await fetch(file, { signal: AbortSignal.timeout(this.timeoutMs) });
      if (!response.ok) {
        throw new OpenSignApiError(`Falha ao baixar PDF (HTTP ${response.status})`, response.status, '');
      }
      return Buffer.from(await response.arrayBuffer());
    }

    return Buffer.from(file.replace(/^data:application\/pdf;base64,/, ''), 'base64');
  }

  /** Valida HMAC SHA-256 hex do corpo bruto (segredo compartilhado com o Kanban). */
  validateWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret || !signature) return false;
    try {
      const expected = createHmac('sha256', this.webhookSecret).update(payload).digest('hex');
      const sigBuf = Buffer.from(signature.trim());
      const expBuf = Buffer.from(expected);
      if (sigBuf.length !== expBuf.length) return false;
      return timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  /**
   * Normaliza o payload real do OpenSign para o formato interno do Kanban.
   * A assinatura (quando usada) é validada antes da normalização.
   */
  parseWebhook(rawBody: string, signature: string): WebhookPayload {
    if (!this.validateWebhookSignature(rawBody, signature)) {
      throw new Error('Assinatura de webhook inválida');
    }

    let body: OpenSignWebhookBody;
    try {
      body = JSON.parse(rawBody) as OpenSignWebhookBody;
    } catch {
      throw new Error('Payload de webhook não é JSON válido');
    }

    const event = normalizeEvent(body.event);
    const documentId = body.objectId || body.documentId || '';
    const cardId =
      body.metadata?.external_id ||
      resolveCardId(this.rootDir, documentId) ||
      '';
    const signedEmail = body.signer?.email;
    const declinedEmail = body.declinedBy;
    const rawSigners: Array<{ name?: string; email?: string; phone?: string; url?: string; status?: string }> =
      body.signers ?? (body.signer ? [body.signer] : []);
    const signers = rawSigners.map((signer, index) => {
      const isSigned =
        event === 'document_completed' ||
        signer.status === 'signed' ||
        (event === 'recipient_signed' && (!signedEmail || signer.email === signedEmail));
      const isDeclined =
        signer.status === 'declined' ||
        (event === 'document_declined' && (!declinedEmail || signer.email === declinedEmail));
      return {
        id: `${documentId || 'doc'}-${index}`,
        name: signer.name ?? '',
        email: signer.email ?? '',
        status: isDeclined ? 'declined' : isSigned ? 'signed' : 'pending',
        signedAt: body.signedAt
      };
    });

    return {
      event,
      rawEvent: body.event ?? '',
      documentId,
      documentTitle: body.name ?? body.documentTitle ?? '',
      metadata: {
        ...(body.metadata ?? {}),
        external_id: cardId
      },
      signers,
      pdfUrl: body.file,
      certificateUrl: body.certificate
    };
  }
}

let clientInstance: OpenSignClient | null = null;

export function getOpenSignClient(): OpenSignClient {
  if (!clientInstance) clientInstance = new OpenSignClient();
  return clientInstance;
}

/** Somente para testes: permite reinjetar configuração. */
export function resetOpenSignClient(): void {
  clientInstance = null;
}

export async function createSignRequest(
  cardId: string,
  pdfBase64: string,
  signers: Signer[],
  options?: SignRequestOptions
): Promise<SignRequestResult> {
  return getOpenSignClient().createSignRequestForCard(cardId, pdfBase64, signers, options);
}

export const OPENSIGN_REGISTRY_FILE = path.join('logs', 'opensign-documents.json');
