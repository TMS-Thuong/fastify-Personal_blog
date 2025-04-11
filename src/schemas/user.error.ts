export enum UserErrorMessages {
  ID_REQUIRED = 'ID không được để trống',

  CURRENT_PASSWORD_REQUIRED = 'Mật khẩu hiện tại là bắt buộc',
  PASSWORD_MIN_LENGTH = 'Mật khẩu mới phải có ít nhất 8 ký tự',
  PASSWORD_MAX_LENGTH = 'Mật khẩu mới không được vượt quá 16 ký tự',
  PASSWORD_PATTERN = 'Mật khẩu mới phải chứa ít nhất một chữ hoa, một chữ thường và một ký tự đặc biệt',

  FIRST_NAME_REQUIRED = 'Họ không được để trống',
  LAST_NAME_REQUIRED = 'Tên không được để trống',

  BIRTH_DATE_REQUIRED = 'Ngày sinh không được để trống',
  BIRTH_DATE_INVALID = 'Ngày sinh không hợp lệ',

  GENDER_INVALID = 'Giới tính không hợp lệ',

  USER_NOT_FOUND = 'Không tìm thấy người dùng',
  UNAUTHORIZED = 'Không có quyền truy cập',
  INVALID_PASSWORD = 'Mật khẩu hiện tại không chính xác',
  FILE_UPLOAD_ERROR = 'Có lỗi khi tải lên tệp',
  INVALID_FILE_TYPE = 'Loại tệp không hợp lệ',
  FILE_TOO_LARGE = 'Kích thước tệp quá lớn',
}
