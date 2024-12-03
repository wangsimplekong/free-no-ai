import api from '../lib/api';
import type {
  UploadSignatureResponse,
  ParseDocRequest,
  ParseDocResponse,
  FileReductionRequest,
  FileReductionResponse,
  QueryReductionRequest,
  QueryReductionResponse,
  DetectionRequest,
  DetectionResponse,
} from '../types/file-reduction.types';

class FileReductionService {
  private readonly baseUrl = '/api/v1/reduction';

  async getUploadSignature(): Promise<UploadSignatureResponse> {
    const response = await api.post(`/api/v1/detection/file/signature`);
    return response.data;
  }

  async parseDocument(params: ParseDocRequest): Promise<ParseDocResponse> {
    const response = await api.post(`/api/v1/detection/file/parse`, params);
    return response.data;
  }

  async submitDetection(params: DetectionRequest): Promise<DetectionResponse> {
    const response = await api.post(`/api/v1/detection/file/submit`, params);
    return response.data;
  }

  async submitReduction(
    params: FileReductionRequest
  ): Promise<FileReductionResponse> {
    const response = await api.post(`${this.baseUrl}/submit`, params);
    return response.data;
  }

  async queryResults(
    params: QueryReductionRequest
  ): Promise<QueryReductionResponse> {
    const response = await api.post(`${this.baseUrl}/query`, params);
    return response.data;
  }

  async uploadToObs(
    file: File,
    signature: UploadSignatureResponse
  ): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('ossid', signature.data.ossid);
      formData.append('ossaccesskeyid', signature.data.ossAccessKeyId);
      formData.append('policy', signature.data.policy);
      formData.append('signature', signature.data.signature);
      formData.append('key', signature.data.ossKey);
      formData.append('success_action_status', '201');
      formData.append('file', file);

      const response = await fetch(signature.data.ossurl, {
        method: 'POST',
        body: formData,
      });

      return response.status === 201;
    } catch (error) {
      console.error('Failed to upload file to OBS:', error);
      throw new Error('文件上传失败，请重试');
    }
  }
}

export const fileReductionService = new FileReductionService();
export default fileReductionService;
