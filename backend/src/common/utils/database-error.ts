import { ConflictException } from '@nestjs/common';

export function rethrowDatabaseError(error: unknown): never {
  const code = (error as { driverError?: { code?: string }; code?: string }).driverError?.code
    ?? (error as { code?: string }).code;
  if (code === '23505') throw new ConflictException('Dữ liệu đã tồn tại (email hoặc ghi danh trùng).');
  if (code === '23503') throw new ConflictException('Bản ghi đang được sử dụng hoặc dữ liệu liên quan không còn tồn tại.');
  if (code === '23514') throw new ConflictException('Dữ liệu vi phạm ràng buộc sĩ số hoặc trạng thái.');
  throw error;
}
