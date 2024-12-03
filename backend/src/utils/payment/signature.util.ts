import crypto from 'crypto';

export class SignatureUtil {
  static generate(params: Record<string, any>, secret: string): string {

    const sortedKeys = Object.keys(params).sort();

    const signStr = sortedKeys
        .map(key => `${key}=${params[key]}`)
        .join('&');

    const signStrWithSecret = signStr + '&key=' + secret;

    return crypto
        .createHash('md5')
        .update(signStrWithSecret)
        .digest('hex')
        .toUpperCase();
  }

  static verify(params: Record<string, any>, sign: string, secret: string): boolean {
    const { sign: _, ...rest } = params;
    const generatedSign = this.generate(rest, secret);
    return generatedSign === sign;
  }
}