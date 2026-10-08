import { BadGatewayException, BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  constructor(config: ConfigService) { cloudinary.config({ cloud_name: config.get('cloudinary.cloudName'), api_key: config.get('cloudinary.apiKey'), api_secret: config.get('cloudinary.apiSecret'), secure: true }); }
  async image(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn ảnh.');
    if (!['image/jpeg','image/png','image/webp'].includes(file.mimetype)) throw new BadRequestException('Chỉ nhận ảnh JPEG, PNG hoặc WEBP.');
    if (!cloudinary.config().cloud_name || !cloudinary.config().api_key || !cloudinary.config().api_secret) throw new ServiceUnavailableException('Cloudinary chưa được cấu hình.');
    if (!file.buffer?.length) throw new BadRequestException('Không đọc được nội dung ảnh.');
    try {
      const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => { const stream=cloudinary.uploader.upload_stream({ folder:'pks-course-portal', resource_type:'image', transformation:[{width:1200,height:800,crop:'limit',quality:'auto',fetch_format:'auto'}] },(error,value)=>error||!value?reject(error):resolve(value)); stream.end(file.buffer); });
      return { url: result.secure_url, publicId: result.public_id };
    } catch (error) {
      const details = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error;
      const message = error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : JSON.stringify(error);
      this.logger.error(`Cloudinary upload failed: ${JSON.stringify(details, null, 2)}`);
      throw new BadGatewayException(`Không thể tải ảnh lên Cloudinary: ${message}`);
    }
  }
}
