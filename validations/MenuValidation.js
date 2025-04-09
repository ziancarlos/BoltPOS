const Joi = require("joi");

const createValidation = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Nama menu wajib diisi.",
    "string.min": "Nama menu minimal 2 karakter.",
    "string.max": "Nama menu maksimal 100 karakter.",
    "any.required": "Nama wajib diisi.",
  }),
  price: Joi.number().required().messages({
    "number.base": "Harga harus berupa angka",
    "string.empty": "Harga wajib diisi.",
  }),
  categoryId: Joi.number().integer().required().messages({
    "any.required": "Kategori wajib dipilih.",
    "number.base": "Kategori tidak valid.",
  }),
  fileName: Joi.string().optional().messages({
    "string.empty": "Foto menu wajib dipilih.",
    "any.required": "Foto menu wajib dipilih.",
  }),
});

const menuIdValidation = Joi.number().required().messages({
  "number.base": "Id Menu harus berupa angka",
  "any.required": "Id Menu wajib diberikan",
});

module.exports = {
  createValidation,
  menuIdValidation,
};
