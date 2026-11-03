import { randomUUID } from 'node:crypto'
import multer from 'multer'
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENTS_DIR,
  MAX_DOCUMENT_BYTES,
} from '../lib/storage.js'

const EXTENSIONS = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, DOCUMENTS_DIR),
    filename: (req, file, cb) => {
      cb(null, `${randomUUID()}${EXTENSIONS[file.mimetype] || ''}`)
    },
  }),
  limits: {
    fileSize: MAX_DOCUMENT_BYTES,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.mimetype)) {
      req.invalidFileType = true
      return cb(null, false)
    }
    return cb(null, true)
  },
})

export function uploadDocument(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'El archivo supera el límite de 5 MB'
          : 'No se pudo procesar el archivo'
      return res.status(400).json({ error: message, code: error.code })
    }

    if (error) return next(error)

    if (req.invalidFileType) {
      return res.status(400).json({
        error: 'Formato no permitido. Sube un archivo PDF, JPG o PNG.',
        code: 'INVALID_FILE_TYPE',
      })
    }

    return next()
  })
}
