import { body } from 'express-validator';
import { detectionConfig } from '../config/detection.config';

export const detectionValidator = {
  detectText: [
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isString()
      .withMessage('Content must be a string')
      .trim()
      .isLength({ 
        min: detectionConfig.minContentLength, 
        max: detectionConfig.maxContentLength 
      })
      .withMessage(`Content length must be between ${detectionConfig.minContentLength} and ${detectionConfig.maxContentLength} characters`)
  ]
};