const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  group: Joi.string().optional().allow(null),
});

const updatePostSchema = Joi.object({
  title: Joi.string().optional(),
  content: Joi.string().optional(),
  group: Joi.string().optional().allow(null),
});

module.exports = { createPostSchema, updatePostSchema };
