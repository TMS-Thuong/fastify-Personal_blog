import { logger } from '@config/index';
import { Gender } from '@prisma/client';
import { checkEmail, createUser, saveEmailVerificationToken, sendEmail, verifyEmailToken } from '@services/index';
import { getVerificationEmail } from '@utils/index';
import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

export const registerUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password, firstName, lastName, birthDate, gender } = request.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      birthDate: string;
      gender: number;
    };

    logger.info('Info register', { email, firstName, lastName });

    if (password.length < 8) {
      return reply.status(400).send({
        message: 'Mật khẩu phải có ít nhất 8 ký tự.',
      });
    }

    if (password.length > 16) {
      return reply.status(400).send({
        message: 'Mật khẩu không được vượt quá 16 ký tự.',
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z@$!%*?&]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return reply.status(400).send({
        message: 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một ký tự đặc biệt.',
      });
    }

    const genderEnum: Gender = gender === 0 ? Gender.MALE : gender === 1 ? Gender.FEMALE : Gender.OTHER;

    if (await checkEmail(email)) {
      return reply.status(400).send({ message: 'Email đã được sử dụng.' });
    }

    const newUser = await createUser({
      email,
      password,
      firstName,
      lastName,
      birthDate: new Date(birthDate),
      gender: genderEnum,
    });

    const emailVerificationToken = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    const verificationTokenExpires = dayjs().add(24, 'hour').toDate();

    await saveEmailVerificationToken(newUser.id, emailVerificationToken, verificationTokenExpires);

    const { subject, text } = getVerificationEmail(newUser.firstName, emailVerificationToken);

    const emailResult = await sendEmail(newUser.email, subject, text);
    if (!emailResult.success) {
      return reply.status(500).send({ message: 'Không thể gửi email xác thực.' });
    }

    return reply.status(201).send({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isActive: newUser.isActive,
      },
    });
  } catch (error) {
    logger.error('Error', error);
    return reply.status(500).send({ message: 'Lỗi hệ thống, vui lòng thử lại sau.' });
  }
};

export const verifyEmailController = async (
  request: FastifyRequest<{ Querystring: { token: string } }>,
  reply: FastifyReply
) => {
  const { token } = request.query;
  const result = await verifyEmailToken(token);

  if (result.success) {
    return reply.status(200).send({ message: result.message });
  } else {
    return reply.status(400).send({ message: result.message });
  }
};
