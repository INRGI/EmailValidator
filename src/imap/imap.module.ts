import { Module } from "@nestjs/common";
import { ImapClientService } from "./imap-client.service";


@Module({
    providers:[ImapClientService],
    exports: [ImapClientService],
})
export class ImapModule{};