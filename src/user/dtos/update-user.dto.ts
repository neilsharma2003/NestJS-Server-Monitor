import * as Joi from 'joi'

export class UpdateUserDTO {
    id: string
    username?: string;
    email?: string;
    password?: string;
}

export const updateUserDTOSchema = Joi.object<UpdateUserDTO>({
    id: Joi.string().uuid().required(),
    username: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
}).min(2);
