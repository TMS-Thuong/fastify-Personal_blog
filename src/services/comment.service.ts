import { PrismaClient } from '@prisma/client';

class CommentService {
  constructor(private prisma: PrismaClient) {}

  async addComment(userId: number, postId: number, content: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || !post.isPublic) return null;

    const comment = await this.prisma.comment.create({
      data: {
        userId,
        postId,
        content,
      },
    });

    return comment;
  }
}

export default new CommentService(new PrismaClient());
