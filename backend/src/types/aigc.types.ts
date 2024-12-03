export interface AigcReduceRequest {
  text: string;
}

export interface AigcReduceResponse {
  text: string;
}

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  stream: boolean;
  messages: OpenAIMessage[];
  frequency_penalty?: number;
  presence_penalty?: number;
  temperature?: number;
  top_p?: number;
}

export interface OpenAIResponse {
  created: number;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    finish_reason: string;
    index: number;
    message: {
      role: string;
      content: string;
      refusal: null | string;
    };
  }>;
}