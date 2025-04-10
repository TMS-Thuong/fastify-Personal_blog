import { PrismaClient, MediaType } from '@prisma/client';

export class MediaService {
    private static prisma = new PrismaClient();

    static async createMedia(data: { url: string; type: string; description?: string }) {
        return this.prisma.media.create({
            data: {
                url: data.url,
                type: data.type as MediaType,
                description: data.description
            }
        });
    }
}