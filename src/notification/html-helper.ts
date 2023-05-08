import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export async function sendErrorEmail(monitorName: string, email: string, endpoint: string, statusCode: number) {
    const notificationDir = path.join(__dirname, '..', 'notification');

    // Construct the file path to the 'errorTemplate.html' file
    const filePath = path.join(notificationDir, 'errorTemplate.html');

    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        endpoint: endpoint,
        statusCode: statusCode
    }

    const htmlToSend = template(replacements);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "nestjsapiservermonitor@gmail.com",
            pass: process.env.GMAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: 'nestjsapiservermonitor@gmail.com',
        to: email,
        subject: `Your Server Monitor "${monitorName}" Failed!`,
        html: htmlToSend
    }
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
}