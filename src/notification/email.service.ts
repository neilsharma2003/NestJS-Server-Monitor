import { Injectable } from "@nestjs/common";
import { sendErrorEmail } from "./html-helper";

@Injectable()
export class EmailService {
    constructor() { }

    async sendErrorEmail(monitorName: string, email: string, endpoint: string, statusCode: number) {
        sendErrorEmail(monitorName, email, endpoint, statusCode)
    }
}