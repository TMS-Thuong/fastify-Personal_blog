import { PrismaClient } from '@prisma/client';

class CommentService {
  constructor(private prisma: PrismaClient) {}

  async getList(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    console.log('post:', post);
    if (!post) return [];

    const comments = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        postId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('comments:', comments);
    return comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    }));
  }

  async create(userId: number, postId: number, content: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.status !== 'PUBLIC') return null;

    const comment = await this.prisma.comment.create({
      data: {
        userId,
        postId,
        content,
      },
    });

    return comment;
  }

  async update(commentId: number, userId: number, content: string) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment || comment.userId !== userId) {
        return null;
      }

      const updatedComment = await this.prisma.comment.update({
        where: { id: commentId },
        data: { content },
      });

      return {
        ...updatedComment,
        createdAt: updatedComment.createdAt.toISOString(),
        updatedAt: updatedComment.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Lỗi khi cập nhật bình luận:', error);
      throw error;
    }
  }

  async delete(commentId: number, userId: number) {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment || comment.userId !== userId) {
        return false;
      }

      await this.prisma.comment.delete({
        where: { id: commentId },
      });

      return true;
    } catch (error) {
      console.error('Lỗi khi xóa bình luận:', error);
      throw error;
    }
  }
}

export default new CommentService(new PrismaClient());
