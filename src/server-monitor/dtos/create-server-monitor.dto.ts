import * as Joi from "joi"

export class CreateServerMonitorDTO {
    monitorName: string
    endpoint: string
    desiredStatusCode: number
    options?: string
}

export const createServerMonitorDTOSchema = Joi.object<CreateServerMonitorDTO>({
    monitorName: Joi.string().required().required(),
    endpoint: Joi.string().uri().required(),
    desiredStatusCode: Joi.number().required(),
    options: Joi.string().optional()
})
