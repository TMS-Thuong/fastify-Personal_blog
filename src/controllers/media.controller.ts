import { MediaType } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';

import { logger } from '@app/config';
import { binding } from '@app/decorator/binding';

import { MediaService } from '../services/media.service';
import { saveMediaFile } from '../utils/file-upload';

class MediaController {
  @binding
  async uploadMedia(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: number }).id;
      const part = await request.file();

      const { postId } = request.query as { postId?: string };

      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!part || part.type !== 'file' || !allowedMimeTypes.includes(part.mimetype)) {
        return reply.badRequest('Định dạng file không hợp lệ. Chỉ chấp nhận PNG, JPG, JPEG');
      }

      logger.info(`File uploaded: ${part.filename}`);
      const { url: mediaUrl } = await saveMediaFile(part);

      const media = await MediaService.createMedia({
        url: mediaUrl,
        type: MediaType.IMAGE,
        description: part.filename,
        userId: userId,
        postId: postId ? parseInt(postId) : undefined,
      });

      logger.info('Upload media thành công', { mediaId: media.id });
      return reply.ok({ media });
    } catch (error) {
      logger.error('Lỗi khi upload media', { error: error.message });
      return reply.internalError(error.message);
    }
  }
}

export default new MediaController();
