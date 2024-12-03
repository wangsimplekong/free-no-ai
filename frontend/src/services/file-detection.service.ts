import api from '../lib/api';
import type { 
  UploadSignatureResponse,
  ParseDocRequest,
  ParseDocResponse,
  FileDetectionRequest,
  FileDetectionResponse,
  QueryDetectionRequest,
  QueryDetectionResponse
} from '../types/file-detection.types';

class FileDetectionService {
  private readonly baseUrl = '/api/v1/detection/file';

  async getUploadSignature(): Promise<UploadSignatureResponse> {
    const response = await api.post(`${this.baseUrl}/signature`);
    return response.data;
  }

  async parseDocument(params: ParseDocRequest): Promise<ParseDocResponse> {
    const response = await api.post(`${this.baseUrl}/parse`, params);
    return response.data;
  }

  async submitDetection(params: FileDetectionRequest): Promise<FileDetectionResponse> {
    const response = await api.post(`${this.baseUrl}/submit`, params);
    return response.data;
  }

  async queryResults(params: QueryDetectionRequest): Promise<QueryDetectionResponse> {
    const response = await api.post(`${this.baseUrl}/query`, params);
    return response.data;
  }

  async uploadToObs(
    file: File,
    signature: UploadSignatureResponse
  ): Promise<boolean> {
    try {
      console.info(signature);
      debugger;
      const formData = new FormData();
      formData.append('ossid', signature.data.ossid);
      formData.append('ossaccesskeyid', signature.data.ossAccessKeyId);
      formData.append('policy', signature.data.policy);
      formData.append('signature', signature.data.signature);
      formData.append('key', signature.data.ossKey);
      formData.append('success_action_status', '201');
      formData.append('file', file);
      console.info(formData)
      const response = await fetch(signature.data.ossurl, {
        method: 'POST',
        body: formData
      });
      console.info(response)
      return response.status === 201;
    } catch (error) {
      console.error('Failed to upload file to OBS:', error);
      throw new Error('文件上传失败，请重试');
    }
  }
}

export const fileDetectionService = new FileDetectionService();
export default fileDetectionService;