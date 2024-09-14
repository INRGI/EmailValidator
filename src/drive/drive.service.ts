import { Injectable } from "@nestjs/common";
import { google, drive_v3 } from 'googleapis';
import { ProductNotFoundException } from "./exception/productNotFound.exception";
import { cleanFolderName } from "./utils/cleanFolderName";
import { ProductFolderdException } from "./exception/productFolder.exception";
import { LiftFolderdException } from "./exception/liftFolder.exception";
import { HTMLNotFoundException } from "./exception/htmlNotFound.exception";
import 'dotenv/config';

@Injectable()
export class DriveService {
    private drive: drive_v3.Drive;

    private async initializeDrive(): Promise<void> {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            type: process.env.GOOGLE_TYPE,
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLIENT_ID,
          },
          scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
    
        this.drive = google.drive({ version: 'v3', auth });
      }

    private async findProductFolder(product: string): Promise<drive_v3.Schema$File> {
        const query = `name contains '${product}' and mimeType = 'application/vnd.google-apps.folder'`;
        const res = await this.drive.files.list({
            q: query,
            fields: 'files(id, name)',
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
        });

        if (res.data.files.length === 0) {
            throw new ProductNotFoundException(product);
        }

        const productFolder = res.data.files.find(
            (file) => cleanFolderName(file.name) === product
        );

        if (!productFolder) {
            throw new ProductFolderdException(product);
        }

        return productFolder;
    }

    private async findSubFolder(productFolderId: string): Promise<string> {
        const query = `'${productFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name contains 'HTML+SL'`;
        const res = await this.drive.files.list({
            q: query,
            fields: 'files(id, name)',
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
        });

        if (res.data.files.length === 0) {
            throw new ProductFolderdException('HTML+SL');
        }

        return res.data.files[0].id;
    }

    private async findLiftFolder(subFolderId: string, liftNumber: string): Promise<string> {
        const query = `'${subFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name contains 'Lift '`;
        const res = await this.drive.files.list({
            q: query,
            fields: 'files(id, name)',
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
        });

        if (res.data.files.length === 0) {
            throw new LiftFolderdException(liftNumber);
        }

        const liftFolder = res.data.files.find(
            (file) => {
                const match = file.name.match(/Lift (\d+)/);
                return match && match[1] === liftNumber;
            }
        );

        if (!liftFolder) {
            throw new LiftFolderdException(liftNumber);
        }

        return liftFolder.id;
    }

    private async findHtmlFile(liftFolderId: string): Promise<string> {
        const query = `'${liftFolderId}' in parents and mimeType = 'text/html'`;
        const res = await this.drive.files.list({
            q: query,
            fields: 'files(id, name)',
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
        });

        if (res.data.files.length === 0) {
            throw new HTMLNotFoundException('HTML');
        }

        const htmlFile = res.data.files.find(file => !file.name.toLowerCase().includes('mjml'));

        if (!htmlFile) {
            throw new HTMLNotFoundException('HTML');
        }

        return htmlFile.id;
    }

    private async fetchHtmlContent(fileId: string): Promise<string> {
        const res = await this.drive.files.get({
            fileId,
            alt: 'media',
        });
        return res.data as string;
    }

    public async findProduct(copy: string): Promise<string> {
        await this.initializeDrive();
        const product = copy.match(/[a-zA-Z]+/)[0];
        const liftNumber = copy.match(/[a-zA-Z]+(\d+)/)[1];

        const productFolder = await this.findProductFolder(product);
        console.log(productFolder)
        const subFolderId = await this.findSubFolder(productFolder.id);
        console.log(subFolderId)
        const liftFolderId = await this.findLiftFolder(subFolderId, liftNumber);
        console.log(liftFolderId)
        const htmlFileId = await this.findHtmlFile(liftFolderId);
        console.log(htmlFileId)

        return await this.fetchHtmlContent(htmlFileId);
    }
}
