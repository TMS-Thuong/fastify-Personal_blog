import { PrismaClient, MediaType } from '@prisma/client';

export class MediaService {
  private static prisma = new PrismaClient();

  static async createMedia(data: {
    url: string;
    type: MediaType;
    description?: string;
    userId: number;
    postId?: number;
  }) {
    return this.prisma.media.create({
      data: {
        url: data.url,
        type: data.type,
        description: data.description,
        userId: data.userId,
      },
    });
  }
}
