module.exports = function validate(schema, value, cb) {
  const result = schema.validate(value, { abortEarly: false });

  if (result.error) {
    cb(
      result.error.details.map((err) => ({
        message: err.message,
      }))
    );
  }

  return result.value;
};
