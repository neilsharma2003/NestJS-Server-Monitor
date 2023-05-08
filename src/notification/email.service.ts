import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer'
import path from "path";
import { sendErrorEmail } from "./html-helper";
import * as handlebars from 'handlebars'
import { SendMailOptions } from 'nodemailer'

@Injectable()
export class EmailService {
    constructor() { }


    async sendErrorEmail(monitorName: string, email: string, endpoint: string, statusCode: number) {
        sendErrorEmail(monitorName, email, endpoint, statusCode)
    }

    async sendCreatedMonitorEmail() { }

    async sendMonitorEmail() {

    }
}