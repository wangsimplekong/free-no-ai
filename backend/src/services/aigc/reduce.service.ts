import { createHttpClient } from '../../utils/http.util';
import { aigcConfig } from '../../config/aigc.config';
import { logger } from '../../utils/logger';
import { OpenAIRequest, OpenAIResponse } from '../../types/aigc.types';

export class AigcReduceService {
  private httpClient;

  constructor() {
    this.httpClient = createHttpClient(aigcConfig.apiUrl, aigcConfig.timeout);
  }

  private validateText(text: string): void {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }
    if (text.length > aigcConfig.maxTextLength) {
      throw new Error(`Text length exceeds maximum limit of ${aigcConfig.maxTextLength} characters`);
    }
  }

  private preprocessText(text: string): string {
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
      .replace(/\r\n/g, '\n')                 // Normalize line endings
      .trim();
  }

  private async callOpenAI(messages: OpenAIRequest['messages']): Promise<string> {
    try {
      const params = new URLSearchParams({
        key: aigcConfig.apiKey,
        keyType: aigcConfig.keyType
      });

      const response = await this.httpClient.post<OpenAIResponse>(`?${params.toString()}`, {
        model: aigcConfig.model,
        ...aigcConfig.defaultParams,
        messages
      });

      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from OpenAI service');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI API call failed:', error);
      throw new Error('Failed to process text reduction');
    }
  }

  private buildFirstPrompt(text: string): OpenAIMessage[] {
    return [{
      role: 'user',
      content: `# 任务说明：\n您是一位专业的论文编辑，现在您需要对 \`<text></text>\` 标签中的文本进行重新组织，以便其更贴近人类进行论文写作时的表达习惯和语言风格。\n\n## 重写指南：\n1. 重写时需保持确保文本的核心意义保持不变，并确保内容细节的精确无误；\n2. 使语言更加流畅自然，模仿人类作者的写作习惯；\n3. 使用简练且直观的专业术语和多样化的句式，以接近人类写作时的特点与风格；\n4. 确保重写后的文本结构合理，逻辑顺畅，信息传达精准。\n\n# 原文内容：\n<text>${text}</text>\n\n# 输出：\n`
    }];
  }

  private buildSecondPrompt(text: string): OpenAIMessage[] {
    return [{
      role: 'user',
      content: `请分析下面文本的质量，检查以下几点：
1. 是否存在乱码
2. 是否存在严重不通顺
3. 是否存在明显语病
4. 是否存在中文简体繁体混合

如果存在以上任何问题，请回复格式如下：
{"status": "error", "issues": ["具体问题1", "具体问题2"]}

如果文本质量良好，请回复：
{"status": "ok"}

原文：
${text}

输出：`
    }];
  }

  public async reduceText(text: string): Promise<string> {
    try {
      logger.info('Starting text reduction process', {
        textLength: text.length,
        timestamp: new Date().toISOString()
      });

      // Validate and preprocess text
      this.validateText(text);
      const processedText = this.preprocessText(text);

      // First reduction
      const firstPrompt = this.buildFirstPrompt(processedText);
      const firstResult = await this.callOpenAI(firstPrompt);

      // Quality check
      const secondPrompt = this.buildSecondPrompt(firstResult);
      const qualityCheckResponse = await this.callOpenAI(secondPrompt);
      
      try {
        const qualityResult = JSON.parse(qualityCheckResponse);
        
        if (qualityResult.status === 'error') {
          logger.warn('Quality check found issues', {
            issues: qualityResult.issues,
            originalLength: text.length,
            reducedLength: firstResult.length
          });
          
          // 尝试修复质量问题
          const fixPrompt = [{
            role: 'user',
            content: `请修复以下文本中的问题：${qualityResult.issues.join('、')}。
保持原意的同时，使文本更加通顺、规范。

原文：
${firstResult}

输出：`
          }];
          
          const fixedResult = await this.callOpenAI(fixPrompt);
          logger.info('Text fixed after quality check', {
            originalLength: firstResult.length,
            fixedLength: fixedResult.length
          });
          
          return fixedResult;
        } else {
          logger.info('Text reduction completed successfully', {
            originalLength: text.length,
            reducedLength: firstResult.length,
            timestamp: new Date().toISOString()
          });

          return firstResult;
        }
      } catch (error) {
        logger.error('Failed to parse quality check response', error);
        throw new Error('Failed to process text reduction');
      }
    } catch (error) {
      logger.error(error);
      logger.error('Text reduction failed', {
        error,
        textLength: text.length,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

export default new AigcReduceService();