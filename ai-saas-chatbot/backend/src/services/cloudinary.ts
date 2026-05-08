import { v2 as cloudinary } from 'cloudinary';

const isConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

export const initCloudinary = (): void => {
  if (!isConfigured()) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

export const uploadReportBuffer = async (buffer: Buffer, filename: string) => {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  const folder = process.env.CLOUDINARY_FOLDER || 'ai-reports';
  const base64 = buffer.toString('base64');
  const dataUri = `data:application/octet-stream;base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'raw',
    public_id: filename.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '')
  });

  return {
    url: result.secure_url,
    publicId: result.public_id
  };
};

export const deleteReportFile = async (publicId?: string) => {
  if (!publicId || !isConfigured()) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};
