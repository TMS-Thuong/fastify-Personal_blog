import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

import { MultipartFile } from '@fastify/multipart';

export async function saveAvatarFile(part: MultipartFile, id: number): Promise<{ url: string }> {
    try {
        const uploadDir = path.join(process.cwd(), 'uploads');
        fs.mkdirSync(uploadDir, { recursive: true });

        console.log(uploadDir);
        const fileExt = path.extname(part.filename);
        const timestamp = Date.now();
        const fileName = `avatar-${timestamp}${fileExt}`;

        const filePath = path.join(uploadDir, fileName);

        await pipeline(part.file, fs.createWriteStream(filePath));

        return {
            url: `http://localhost:3000/images/uploads/${fileName}` };
    } catch (error) {
        console.log(error);
    }
}
