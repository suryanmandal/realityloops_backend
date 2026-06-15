import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { logger } from "./logger";

// Initialize S3Client only if credentials are provided
const getR2Client = () => {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const accountId = process.env.R2_ACCOUNT_ID;

  if (!accessKeyId || !secretAccessKey || !accountId) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

/**
 * Uploads a local file to Cloudflare R2 Bucket
 * @param localFilePath - Path to the file on local disk
 * @param destinationKey - Destination path inside the bucket (e.g. 'uploads/products/image.jpg')
 * @param mimeType - File MIME type
 * @returns The public HTTPS URL of the uploaded asset, or null if configuration is missing
 */
export async function uploadToR2(
  localFilePath: string,
  destinationKey: string,
  mimeType: string
): Promise<string | null> {
  try {
    const s3Client = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!s3Client || !bucketName || !publicUrl) {
      logger.info("R2 Cloud Storage credentials not configured. Using local filesystem storage path instead.");
      return null;
    }

    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local file not found at path: ${localFilePath}`);
    }

    const fileContent = fs.readFileSync(localFilePath);
    
    // Clean key from leading slash if present
    const cleanKey = destinationKey.startsWith("/") ? destinationKey.substring(1) : destinationKey;

    logger.info("Uploading file to Cloudflare R2 object store...", {
      bucket: bucketName,
      key: cleanKey,
      size: fileContent.length,
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: cleanKey,
      Body: fileContent,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    const fullPublicUrl = `${publicUrl.endsWith("/") ? publicUrl : publicUrl + "/"}${cleanKey}`;
    logger.info("Successfully uploaded asset to Cloudflare R2!", { url: fullPublicUrl });

    return fullPublicUrl;
  } catch (error: any) {
    logger.error("Failed to upload file to Cloudflare R2 object storage:", {
      error: error.message,
      file: localFilePath,
    });
    return null;
  }
}
