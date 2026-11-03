import { mkdirSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const STORAGE_ROOT = fileURLToPath(new URL('../../storage', import.meta.url))
export const DOCUMENTS_DIR = path.join(STORAGE_ROOT, 'advisor-documents')

export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024
export const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
])

mkdirSync(DOCUMENTS_DIR, { recursive: true })

export function toStorageRelative(absolutePath) {
  return path.relative(STORAGE_ROOT, absolutePath).split(path.sep).join('/')
}

export function resolveStoragePath(relativePath) {
  if (!relativePath) return null

  const normalized = relativePath.split('/').join(path.sep)
  const absolute = path.resolve(STORAGE_ROOT, normalized)
  const prefix = STORAGE_ROOT.endsWith(path.sep) ? STORAGE_ROOT : `${STORAGE_ROOT}${path.sep}`

  if (!absolute.startsWith(prefix)) return null
  return absolute
}

export async function removeStoredFile(relativePath) {
  const absolute = resolveStoragePath(relativePath)
  if (!absolute) return

  try {
    await unlink(absolute)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

export function serializeDocument(document) {
  return {
    id: document.id,
    type: document.type,
    originalName: document.originalName,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
    createdAt: document.createdAt,
  }
}
