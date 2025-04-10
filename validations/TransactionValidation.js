const Joi = require("joi");

const createValidation = Joi.object({
  customerName: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Nama Kustomer tidak boleh kosong",
    "string.min":
      "Nama Kustomer lengkap harus terdiri dari minimal {#limit} karakter",
    "string.max": "Nama Kustomer tidak boleh lebih dari {#limit} karakter",
    "any.required": "Nama Kustomer tidak boleh kosong",
  }),

  paymentMethod: Joi.string()
    .valid("Cash", "QRIS", "Kartu Kredit", "Kartu Debit", "Transfer")
    .allow(null)
    .messages({
      "string.empty": "Metode pembayaran tidak boleh kosong",
      "any.only": "Metode pembayaran tidak valid",
      "any.valid": "Metode pembayaran tidak valid",
    }),

  status: Joi.string()
    .valid("PENDING", "PROSES", "SELESAI", "DIBATALKAN")
    .default("PENDING")
    .messages({
      "any.only": "Status transaksi tidak valid",
    }),

  notes: Joi.string().allow("").max(500).messages({
    "string.max": "Catatan tidak boleh lebih dari {#limit} karakter",
  }),

  items: Joi.array()
    .min(1)
    .required()
    .items(
      Joi.object({
        menuId: Joi.number().integer().required().messages({
          "number.base": "ID menu harus berupa angka",
          "number.integer": "ID menu harus berupa bilangan bulat",
          "any.required": "ID menu tidak boleh kosong",
        }),

        quantity: Joi.number().integer().min(1).required().messages({
          "number.base": "Kuantitas harus berupa angka",
          "number.integer": "Kuantitas harus berupa bilangan bulat",
          "number.min": "Kuantitas minimal {#limit}",
          "any.required": "Kuantitas tidak boleh kosong",
        }),

        price: Joi.number().min(0).required().messages({
          "number.base": "Harga harus berupa angka",
          "number.min": "Harga tidak boleh negatif",
          "any.required": "Harga tidak boleh kosong",
        }),

        notes: Joi.string().allow("").max(200).messages({
          "string.max": "Catatan item tidak boleh lebih dari {#limit} karakter",
        }),
      })
    )
    .messages({
      "array.min": "Transaksi harus memiliki minimal 1 item",
      "any.required": "Item transaksi tidak boleh kosong",
    }),
});

const transactionIdValidation = Joi.number().required().messages({
  "number.base": "Id Transaksi harus berupa angka",
  "any.required": "Id Transaksi wajib diberikan",
});

module.exports = {
  createValidation,
  transactionIdValidation,
};
