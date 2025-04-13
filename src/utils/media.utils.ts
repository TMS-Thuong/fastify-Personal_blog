import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

import { MultipartFile } from '@fastify/multipart';

import { BASE_URL } from '@app/config';

export async function saveMediaFile(part: MultipartFile): Promise<{ url: string }> {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'media');
    fs.mkdirSync(uploadDir, { recursive: true });

    const fileExt = path.extname(part.filename);
    const timestamp = Date.now();
    const uuid = crypto.randomUUID();
    const fileName = `media-${uuid}-${timestamp}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    await pipeline(part.file, fs.createWriteStream(filePath));

    return {
      url: `${BASE_URL}/images/uploads/media/${fileName}`,
    };
  } catch (error) {
    console.error('Error saving media file:', error);
    throw new Error('Không thể lưu file media');
  }
}
