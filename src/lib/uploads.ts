import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { STORAGE_BUCKET } from './storage-assets';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOW_LOCAL_UPLOADS = process.env.ALLOW_LOCAL_UPLOADS === 'true';
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const ALLOWED_FOLDERS = new Set(['products', 'categories', 'general']);

let bucketReadyPromise: Promise<void> | null = null;

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const sanitizeFolder = (folder: string) =>
  ALLOWED_FOLDERS.has(folder) ? folder : 'general';

const getFileExtension = (file: File) => {
  const fromMime = MIME_EXTENSION_MAP[file.type];
  if (fromMime) return fromMime;

  const ext = path.extname(file.name || '').replace('.', '').toLowerCase();
  return ext || 'bin';
};

const validateImageFile = (file: File) => {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG, WEBP, and GIF images are allowed.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image size must be 5 MB or smaller.');
  }
};

async function ensureStorageBucket() {
  if (!isSupabaseConfigured()) return;

  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);

      if (error) {
        const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: MAX_IMAGE_SIZE,
          allowedMimeTypes: Array.from(ALLOWED_IMAGE_TYPES),
        });

        if (createError && !createError.message.toLowerCase().includes('already')) {
          throw createError;
        }

        return;
      }

      if (data && !data.public) {
        const { error: updateError } = await supabase.storage.updateBucket(STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: MAX_IMAGE_SIZE,
          allowedMimeTypes: Array.from(ALLOWED_IMAGE_TYPES),
        });

        if (updateError) {
          throw updateError;
        }
      }
    })();
  }

  await bucketReadyPromise;
}

async function uploadToSupabase(file: File, folder: string, fileName: string, buffer: Buffer) {
  await ensureStorageBucket();

  const supabase = getSupabaseAdmin();
  const objectPath = `${folder}/${fileName}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

async function uploadToLocal(buffer: Buffer, folder: string, fileName: string) {
  const targetDir = path.join(process.cwd(), 'public', 'uploads', folder);
  await mkdir(targetDir, { recursive: true });
  const filePath = path.join(targetDir, fileName);

  await writeFile(filePath, buffer);

  return `/uploads/${folder}/${fileName}`;
}

export async function storeUploadedImage(file: File, folderInput: string) {
  validateImageFile(file);

  const folder = sanitizeFolder(folderInput);
  const extension = getFileExtension(file);
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileHash = createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const fileName = `${fileHash}.${extension}`;

  if (isSupabaseConfigured()) {
    return uploadToSupabase(file, folder, fileName, buffer);
  }

  if (ALLOW_LOCAL_UPLOADS) {
    return uploadToLocal(buffer, folder, fileName);
  }

  throw new Error(
    'Image uploads require configured Supabase Storage. Local filesystem fallback is disabled by default.',
  );
}
