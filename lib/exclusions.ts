import fs from "fs";
import path from "path";

const EXCLUSIONS_FILE = path.join(process.cwd(), "lib", "excluded_payments.json");
const EXCLUDED_GIFTS_FILE = path.join(process.cwd(), "lib", "excluded_gifts.json");
const EXCLUDED_EMAILS_FILE = path.join(process.cwd(), "lib", "excluded_emails.json");

const TMP_EXCLUSIONS_FILE = path.join("/tmp", "excluded_payments.json");
const TMP_EXCLUDED_GIFTS_FILE = path.join("/tmp", "excluded_gifts.json");
const TMP_EXCLUDED_EMAILS_FILE = path.join("/tmp", "excluded_emails.json");

// Emails sempre excluídos (garantia estrita que persiste em qualquer ambiente ou deploy)
const HARDCODED_EXCLUDED_EMAILS = [
  "computadordoerick@gmail.com",
];

// Emails excluídos configurados dinamicamente via variável de ambiente EXCLUDED_EMAILS
const ENV_EXCLUDED_EMAILS: string[] = (process.env.EXCLUDED_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Cache em memória para pagamentos excluídos
let memoryPaymentExclusions = new Set<string>();
let isPaymentsLoaded = false;

// Cache em memória para presentes excluídos
let memoryGiftExclusions = new Set<string>();
let isGiftsLoaded = false;

// Cache em memória para emails excluídos
let memoryEmailExclusions = new Set<string>();
let isEmailsLoaded = false;

function safeReadJson(filePath: string): string[] {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const list = JSON.parse(content);
      if (Array.isArray(list)) {
        return list.map(String);
      }
    }
  } catch (e) {
    // Silencioso se não existir ou se for inacessível
  }
  return [];
}

function safeWriteJson(primaryPath: string, tmpPath: string, data: string[]): void {
  // Tenta salvar no caminho principal (local)
  try {
    fs.writeFileSync(primaryPath, JSON.stringify(data, null, 2), "utf-8");
    return;
  } catch (e) {
    // Se falhar (ex: sistema de arquivos somente leitura da Vercel /var/task), tenta salvar em /tmp
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (tmpErr) {
      console.warn("[Exclusions] Aviso ao salvar em /tmp:", tmpErr);
    }
  }
}

// --- Gestão de Pagamentos Excluídos (mpPaymentId) ---

function loadPaymentExclusions(): Set<string> {
  if (isPaymentsLoaded) return memoryPaymentExclusions;

  const listBundled = safeReadJson(EXCLUSIONS_FILE);
  const listTmp = safeReadJson(TMP_EXCLUSIONS_FILE);

  memoryPaymentExclusions = new Set([...listBundled, ...listTmp]);
  isPaymentsLoaded = true;
  return memoryPaymentExclusions;
}

function savePaymentExclusions(): void {
  const list = Array.from(memoryPaymentExclusions);
  safeWriteJson(EXCLUSIONS_FILE, TMP_EXCLUSIONS_FILE, list);
}

export function isPaymentExcluded(mpPaymentId?: string | null): boolean {
  if (!mpPaymentId) return false;
  const set = loadPaymentExclusions();
  return set.has(String(mpPaymentId).trim());
}

export function addExcludedPayment(mpPaymentId?: string | null): void {
  if (!mpPaymentId) return;
  const set = loadPaymentExclusions();
  set.add(String(mpPaymentId).trim());
  savePaymentExclusions();
}

export function getExcludedPaymentIds(): Set<string> {
  return loadPaymentExclusions();
}

// --- Gestão de Emails Excluídos ---

function loadEmailExclusions(): Set<string> {
  if (isEmailsLoaded) return memoryEmailExclusions;

  const listBundled = safeReadJson(EXCLUDED_EMAILS_FILE);
  const listTmp = safeReadJson(TMP_EXCLUDED_EMAILS_FILE);

  const merged = [
    ...HARDCODED_EXCLUDED_EMAILS,
    ...ENV_EXCLUDED_EMAILS,
    ...listBundled,
    ...listTmp,
  ].map((e) => e.trim().toLowerCase());

  memoryEmailExclusions = new Set(merged);
  isEmailsLoaded = true;
  return memoryEmailExclusions;
}

function saveEmailExclusions(): void {
  const list = Array.from(memoryEmailExclusions);
  safeWriteJson(EXCLUDED_EMAILS_FILE, TMP_EXCLUDED_EMAILS_FILE, list);
}

export function isEmailExcluded(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const set = loadEmailExclusions();
  return set.has(normalized);
}

export function addExcludedEmail(email?: string | null): void {
  if (!email) return;
  const normalized = email.trim().toLowerCase();
  const set = loadEmailExclusions();
  set.add(normalized);
  saveEmailExclusions();
}

export function getExcludedEmails(): Set<string> {
  return loadEmailExclusions();
}

// --- Gestão de Presentes Excluídos ---

function loadGiftExclusions(): Set<string> {
  if (isGiftsLoaded) return memoryGiftExclusions;

  const listBundled = safeReadJson(EXCLUDED_GIFTS_FILE);
  const listTmp = safeReadJson(TMP_EXCLUDED_GIFTS_FILE);

  memoryGiftExclusions = new Set(
    [...listBundled, ...listTmp].map((t) => t.trim().toLowerCase())
  );
  isGiftsLoaded = true;
  return memoryGiftExclusions;
}

function saveGiftExclusions(): void {
  const list = Array.from(memoryGiftExclusions);
  safeWriteJson(EXCLUDED_GIFTS_FILE, TMP_EXCLUDED_GIFTS_FILE, list);
}

export function isGiftExcluded(title: string): boolean {
  if (!title) return false;
  const set = loadGiftExclusions();
  return set.has(title.trim().toLowerCase());
}

export function addExcludedGift(title: string): void {
  if (!title) return;
  const set = loadGiftExclusions();
  set.add(title.trim().toLowerCase());
  saveGiftExclusions();
}
