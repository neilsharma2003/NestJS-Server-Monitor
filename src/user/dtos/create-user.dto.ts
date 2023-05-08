import * as Joi from 'joi';

export class CreateUserDTO {
  username: string;
  email: string;
  password: string;
  confirmPassword: string
}

export const createUserDTOSchema = Joi.object<CreateUserDTO>({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({ 'any.only': "Passwords don't match!" })
});
