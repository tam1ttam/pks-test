import { Controller, ParseFilePipeBuilder, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';
@Controller('uploads') @UseGuards(JwtAuthGuard)
export class UploadsController { constructor(private readonly uploads: UploadsService) {} @Post('image') @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } })) image(@UploadedFile(new ParseFilePipeBuilder().addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 }).build({ fileIsRequired: true })) file: Express.Multer.File) { return this.uploads.image(file); } }
