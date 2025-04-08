import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

import { MultipartFile } from '@fastify/multipart';

export async function saveAvatarFile(part: MultipartFile, email: string): Promise<{ url: string }> {
    try {
        const uploadDir = path.join(process.cwd(), 'uploads');
        fs.mkdirSync(uploadDir, { recursive: true });

        console.log(uploadDir);
        const fileExt = path.extname(part.filename);
        const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '');
        const fileName = `avatar-${safeEmail}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);

        await pipeline(part.file, fs.createWriteStream(filePath));

        return { url: `/uploads/${fileName}` };
    } catch (error) {
        console.log(error);

    }

}
