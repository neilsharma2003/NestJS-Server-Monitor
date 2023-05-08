import * as Joi from "joi"

export class SignInDTO {
    username: string
    password: string
}

export const signInDTOSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})
