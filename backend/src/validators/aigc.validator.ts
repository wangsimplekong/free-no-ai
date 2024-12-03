import { body } from 'express-validator';
import { aigcConfig } from '../config/aigc.config';

export const aigcValidator = {
  reduceText: [
    body('text')
      .notEmpty()
      .withMessage('Text is required')
      .isString()
      .withMessage('Text must be a string')
      .trim()
      .isLength({ 
        min: 1, 
        max: aigcConfig.maxTextLength 
      })
      .withMessage(`Text length must be between 1 and ${aigcConfig.maxTextLength} characters`)
  ]
};