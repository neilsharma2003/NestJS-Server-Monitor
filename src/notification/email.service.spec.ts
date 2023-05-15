import { EmailService } from "./email.service";
import { sendErrorEmail } from "./html-helper";

jest.mock("./html-helper");

describe("EmailService", () => {
    let emailService: EmailService;

    beforeEach(() => {
        emailService = new EmailService();
    });

    describe("sendErrorEmail", () => {
        it("should call sendErrorEmail with the provided arguments", async () => {
            const monitorName = "Test Monitor";
            const email = "test@example.com";
            const endpoint = "https://example.com";
            const statusCode = 500;

            await emailService.sendErrorEmail(monitorName, email, endpoint, statusCode);

            expect(sendErrorEmail).toHaveBeenCalledWith(
                monitorName,
                email,
                endpoint,
                statusCode
            );
        });
    });
});
