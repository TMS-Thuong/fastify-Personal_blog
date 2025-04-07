export const getVerificationEmail = (firstName: string, token: string) => {
  return {
    subject: 'Xác thực email của bạn',
    text: `Xin chào ${firstName},

          Cảm ơn bạn đã đăng ký tài khoản trên blog cá nhân. Để hoàn tất quá trình đăng ký và kích hoạt tài khoản của bạn, vui lòng nhấp vào liên kết bên dưới:

          "https://2ed3-14-191-113-179.ngrok-free.app/api/docs#/default/post_api_auth_verify_email/${token}"

          Nếu bạn không thể nhấp vào liên kết, hãy sao chép và dán liên kết vào thanh địa chỉ của trình duyệt.

          Liên kết xác minh này sẽ hết hạn sau 24 giờ. Nếu liên kết hết hạn, bạn sẽ cần yêu cầu một liên kết xác minh mới.

          Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.

          Cảm ơn bạn!`,
  };
};

export const getResetPasswordEmail = (firstName: string, token: string) => {
  return {
    subject: 'Yêu cầu đặt lại mật khẩu',
    text: `Xin chào ${firstName},

        Bạn đã yêu cầu đặt lại mật khẩu. Nhấp vào liên kết dưới đây để tạo mật khẩu mới:

        https://dd0a-14-191-113-179.ngrok-free.app/api/docs#/default/post_api_auth_reset_password?token=${token}

        Liên kết này sẽ hết hạn trong 30 phút.

        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`,
  };
};
