const Joi = require("joi");

const createValidation = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Username wajib diisi",
    "string.min": "Username minimal terdiri dari 3 karakter",
    "string.max": "Username maksimal 30 karakter",
  }),

  email: Joi.string().email().optional().messages({
    "string.email": "Email harus berupa alamat email yang valid",
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password wajib diisi",
    "string.min": "Password minimal terdiri dari 6 karakter",
  }),

  role: Joi.string()
    .valid("owner", "staff") // sesuaikan jika ada role lain
    .required()
    .messages({
      "any.only": 'Role hanya boleh berisi "owner" atau "staff"',
      "string.empty": "Role wajib diisi",
    }),
});

const updateValidation = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Username wajib diisi",
    "string.min": "Username minimal terdiri dari 3 karakter",
    "string.max": "Username maksimal 30 karakter",
  }),

  email: Joi.string().email().optional().messages({
    "string.email": "Email harus berupa alamat email yang valid",
  }),

  password: Joi.string().min(6).optional().messages({
    "string.empty": "Password wajib diisi",
    "string.min": "Password minimal terdiri dari 6 karakter",
  }),

  role: Joi.string()
    .valid("owner", "staff") // sesuaikan jika ada role lain
    .required()
    .messages({
      "any.only": 'Role hanya boleh berisi "owner" atau "staff"',
      "string.empty": "Role wajib diisi",
    }),
});

const userIdValidation = Joi.number().required().messages({
  "number.base": "Id User harus berupa angka",
  "any.required": "Id User wajib diberikan",
});

module.exports = {
  createValidation,
  updateValidation,
  userIdValidation,
};
