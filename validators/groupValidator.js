const Joi = require("joi");

const createGroupSchema = Joi.object({
  name: Joi.string().required(),
});

const manageUserSchema = Joi.object({
  userId: Joi.string().required(),
});

module.exports = { createGroupSchema, manageUserSchema };
