import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export async function saveAvatarFile(part: any, email: string): Promise<{ url: string }> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    fs.mkdirSync(uploadDir, { recursive: true });

    const fileExt = path.extname(part.filename);
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '');
    const fileName = `avatar-${safeEmail}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    await pipeline(part.file, fs.createWriteStream(filePath));

    return { url: `/uploads/avatars/avatar-${safeEmail}${fileExt}` };
}
