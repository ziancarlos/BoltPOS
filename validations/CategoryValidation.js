const Joi = require("joi");

exports.categoryIdValidation = Joi.number().required().messages({
  "number.base": "Id Kategori harus berupa angka",
  "any.required": "Id Kategori wajib diberikan",
});
