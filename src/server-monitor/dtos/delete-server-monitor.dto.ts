import * as Joi from "joi"

export class DeleteServerMonitorDTO {
    monitorName?: string
    resourceId?: string
}

export const deleteServerMonitorDTOSchema = Joi.object<DeleteServerMonitorDTO>(
    {
        monitorName: Joi.string().optional(),
        resourceId: Joi.string().uuid().optional()
    }).xor('monitorName', 'resourceId')