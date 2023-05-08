import * as Joi from "joi"

export class StartServerMonitorDTO {
    monitorName?: string
    resourceId?: string
}

export const startServerMonitorDTOSchema = Joi.object<StartServerMonitorDTO>({
    monitorName: Joi.string().optional(),
    resourceId: Joi.string().uuid().optional()
}).xor('monitorName', 'resourceId')