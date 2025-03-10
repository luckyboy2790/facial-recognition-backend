import crypto from 'crypto';

const secretKey = crypto.scryptSync('your-secure-password', 'salt', 32);

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return JSON.stringify({
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  });
};

export const decrypt = (encryptedString) => {
  try {
    const encryption = JSON.parse(encryptedString);

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      secretKey,
      Buffer.from(encryption.iv, 'hex'),
    );

    let decrypted = decipher.update(encryption.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error decrypting PIN:', error);
    return null;
  }
};
