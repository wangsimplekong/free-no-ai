import crypto from 'crypto';

export class SignatureUtil {
  static generate(params: Record<string, any>, secret: string): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined)
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {});

    const sortedKeys = Object.keys(filteredParams).sort();

    const signStr = sortedKeys
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&') + `&key=${secret}`;

    return crypto
      .createHash('md5')
      .update(signStr)
      .digest('hex')
      .toUpperCase();
  }

  static verify(params: Record<string, any>, sign: string, secret: string): boolean {
    const { sign: _, ...rest } = params;
    const calculatedSign = this.generate(rest, secret);
    return calculatedSign === sign;
  }
}