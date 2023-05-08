import { Module, forwardRef } from "@nestjs/common";
import { EmailService } from "./email.service";

@Module({
    providers: [EmailService],
    exports: [EmailService]
})
export class NotificationModule { }