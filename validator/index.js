const Joi = require("joi");

exports.signupValidation = Joi.object({
  name: Joi.string().max(32).required(),
  address: Joi.string().max(32),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.number().integer().required(),
});

exports.signinValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
