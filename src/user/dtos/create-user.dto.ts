import * as Joi from 'joi';

export class CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

export const createUserDTOSchema = Joi.object<CreateUserDTO>({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
