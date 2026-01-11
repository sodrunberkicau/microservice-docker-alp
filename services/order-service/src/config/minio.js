const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const minioClient = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://minio:9000', // docker-compose service name
    credentials: {
        accessKeyId: 'minioadmin',
        secretAccessKey: 'minioadmin',
    },
    forcePathStyle: true, // wajib untuk MinIO
});

exports.getFile = async (bucket, key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });

        const response = await minioClient.send(command);

        // Convert stream ke buffer
        return new Promise((resolve, reject) => {
            const chunks = [];
            response.Body.on('data', chunk => chunks.push(chunk));
            response.Body.on('end', () => resolve(Buffer.concat(chunks)));
            response.Body.on('error', err => reject(err));
        });
    } catch (err) {
        console.error('Error getting file from MinIO', err);
        throw err;
    }
}

exports.uploadToMinio = async (bucket, key, base64Data) => {
    const buffer = Buffer.from(base64Data, 'base64');

    await minioClient.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
        })
    );

    return `${bucket}/${key}`; // atau URL sesuai kebutuhan
}