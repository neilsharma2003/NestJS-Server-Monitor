import { Test } from '@nestjs/testing';
import { NotificationModule } from './email.module';
import { EmailService } from './email.service';
import { ModuleRef } from '@nestjs/core';

describe('NotificationModule', () => {
    let notificationModule: NotificationModule;
    let emailService: EmailService;
    let moduleRef;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [NotificationModule],
        }).compile();

        notificationModule = moduleRef.get<NotificationModule>(NotificationModule);
        emailService = moduleRef.get<EmailService>(EmailService);
    });

    it('should be defined', () => {
        expect(notificationModule).toBeDefined();
    });

    it('should provide EmailService', () => {
        expect(emailService).toBeDefined();
    });
});
