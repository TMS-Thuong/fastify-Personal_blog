import { FastifySchema } from 'fastify';

export const getProfileSchema: FastifySchema = {
  summary: 'get profile',
  tags: ['User'],
};


export const getUserByIdSchema: FastifySchema = {
  summary: 'Xem thông tin user theo id',
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
};

export const updateAvatarSchema: FastifySchema = {
  summary: 'Cập nhật avatar người dùng',
  tags: ['User'],
  // consumes: ['multipart/form-data'],
  // body: {
  //   type: 'object',
  //   properties: {
  //     avatar: {
  //       type: 'string',
  //       format: 'binary',
  //     },
  //   },
  //   required: ['avatar'],
  // }
};


export const updateUserSchema = {
  summary: 'Cập nhật thông tin cá nhân của người dùng',
  tags: ['User'],
  body: {
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      birthDate: { type: 'string', format: 'date' },
      gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
      address: { type: 'string' },
    },
    required: [],
  },
};
export const updatePasswordSchema = {
  summary: 'Đổi mật khẩu',
  tags: ['User'],
  body: {
    type: 'object',
    properties: {
      currentPassword: { type: 'string' },
      newPassword: { type: 'string' },
    },
    required: ['currentPassword', 'newPassword'],
  },
};

