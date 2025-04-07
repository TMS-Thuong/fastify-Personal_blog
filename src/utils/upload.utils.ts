import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export async function saveAvatarFile(part: any): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    fs.mkdirSync(uploadDir, { recursive: true });

    const fileExt = path.extname(part.filename);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    await pipeline(part.file, fs.createWriteStream(filePath));

    return '/uploads/avatars/' + { fileName };
}
