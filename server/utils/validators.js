const Joi = require('joi');

// User validation schemas
const userRegistrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Dataset validation schemas
const datasetUploadSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Dataset name must be at least 1 character long',
      'string.max': 'Dataset name must be less than 100 characters',
      'any.required': 'Dataset name is required'
    })
});

// Calculation validation schemas
const calculationRequestSchema = Joi.object({
  datasetId: Joi.string()
    .required()
    .messages({
      'any.required': 'Dataset ID is required'
    }),
  assumptions: Joi.object({
    discount_rate: Joi.number()
      .min(0)
      .max(1)
      .required()
      .messages({
        'number.min': 'Discount rate must be between 0 and 1',
        'number.max': 'Discount rate must be between 0 and 1',
        'any.required': 'Discount rate is required'
      }),
    lapse_rate: Joi.number()
      .min(0)
      .max(1)
      .required()
      .messages({
        'number.min': 'Lapse rate must be between 0 and 1',
        'number.max': 'Lapse rate must be between 0 and 1',
        'any.required': 'Lapse rate is required'
      }),
    mortality_table: Joi.string()
      .valid('CSO_2017', 'CSO_2001', 'GAM_1994')
      .required()
      .messages({
        'any.only': 'Invalid mortality table selection',
        'any.required': 'Mortality table is required'
      }),
    expense_inflation: Joi.number()
      .min(0)
      .max(0.1)
      .required()
      .messages({
        'number.min': 'Expense inflation must be between 0 and 0.1',
        'number.max': 'Expense inflation must be between 0 and 0.1',
        'any.required': 'Expense inflation is required'
      })
  }).required()
});

// Chat validation schemas
const chatMessageSchema = Joi.object({
  message: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message must be less than 1000 characters',
      'any.required': 'Message is required'
    }),
  conversationHistory: Joi.array()
    .items(Joi.object({
      role: Joi.string().valid('user', 'assistant').required(),
      content: Joi.string().required(),
      timestamp: Joi.date().optional()
    }))
    .optional()
});

// Validation middleware factory
function validateRequest(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace the original property with validated and sanitized data
    req[property] = value;
    next();
  };
}

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  datasetUploadSchema,
  calculationRequestSchema,
  chatMessageSchema,
  validateRequest
};
