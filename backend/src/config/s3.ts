import {
    S3Client,
    PutObjectCommand,
    ListBucketsCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import type { BucketType } from '~/types/s3';

const s3Props = {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_ACCESS_KEY || '',
    },
};
const s3 = new S3Client(s3Props);
console.log(s3Props, 'S3 PROPS');
export async function uploadFile(
    bucket: BucketType,
    key: string,
    file: Blob | Buffer | Uint8Array,
) {
    try {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file,
        });
        const result = await s3.send(command);
        console.log('File uploaded successfully:', result);
        return result;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

export async function listBuckets() {
    try {
        const command = new ListBucketsCommand({});
        const result = await s3.send(command);
        console.log('Buckets:', result.Buckets);
        return result.Buckets;
    } catch (error) {
        console.error('Error listing buckets:', error);
        throw error;
    }
}

export async function listFiles(bucket: BucketType, prefix: string) {
    try {
        const command = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix.endsWith('/') ? prefix : `${prefix}/`,
        });
        const result = await s3.send(command);
        console.log('Files:', result.Contents);
        return result.Contents?.map((item) => item.Key) || [];
    } catch (error) {
        console.error('Error listing files:', error);
        throw error;
    }
}

export async function createDirectory(bucket: BucketType, dirPath: string) {
    try {
        const key = dirPath.endsWith('/') ? dirPath : `${dirPath}/`;
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: '',
        });
        console.log(command, 'COMMAND', key, bucket);
        await s3.send(command);
        console.log('Directory created:', key);
        return key;
    } catch (error) {
        console.error('Error creating directory:', error);
        throw error;
    }
}

export async function createEmptyFile(bucket: string, key: string) {
    try {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: '', // Empty body creates a zero-byte file
        });

        await s3.send(command);
        console.log(`Empty file created: ${key}`);
        return { success: true, key };
    } catch (error) {
        console.error('Error creating empty file:', error);
        throw error;
    }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(bucket: BucketType, key: string) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        await s3.send(command);
        console.log('File deleted:', key);
        return key;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

