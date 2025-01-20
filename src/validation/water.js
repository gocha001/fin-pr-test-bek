import Joi from 'joi';

// export const addWaterCardSchema = Joi.object({
//   date: Joi.date().required(),
//   amount: Joi.number().required()
// });
// export const updateWaterCardSchema = Joi.object({
//   date: Joi.date().required(),
//   amount: Joi.number().required()
// });


export const addWaterCardSchema = Joi.object({
  date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)  // Перевірка формату ISO 8601
    .required()
    .example('2025-01-05T17:20:38.936Z')
    .description('Water card creation date in ISO 8601 format'),
  amount: Joi.number()
    .min(0)  // Мінімальне значення
    .max(5000)  // Максимальне значення
    .required()
    .example(50)
    .description('Amount of water in milliliters')
});

export const updateWaterCardSchema = Joi.object({
  date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)  // Перевірка формату ISO 8601
    .required()
    .example('2025-01-05T17:20:38.936Z')
    .description('Water card creation date in ISO 8601 format'),
  amount: Joi.number()
    .min(0)  // Мінімальне значення
    .max(5000)  // Максимальне значення
    .required()
    .example(50)
    .description('Amount of water in milliliters')
});
