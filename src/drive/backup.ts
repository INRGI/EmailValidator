import { Injectable } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ProductNotFoundException } from './exception/productNotFound.exception';
import { ProductFolderdException } from './exception/productFolder.exception';
import { LiftFolderdException } from './exception/liftFolder.exception';
import { HTMLNotFoundException } from './exception/htmlNotFound.exception';
import 'dotenv/config';

@Injectable()
export class DriveService {
  private drive: drive_v3.Drive;
  private oauth2Client: OAuth2Client;

  private async initializeDrive(): Promise<void> {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const tokens = await this.getTokens();
    this.oauth2Client.setCredentials(tokens);

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  private async getTokens(): Promise<any> {
    const code = '4/0AQlEd8zSDW29f2SUMuPVhJf-29sfVyvWLHSxl_NOXViXNE9C-o_krBfW22wpG6xzGpS2Lw';

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to obtain tokens.');
    }
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

    const productFolder = res.data.files.find((file) => file.name === product);
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

    const liftFolder = res.data.files.find((file) => {
      const match = file.name.match(/Lift (\d+)/);
      return match && match[1] === liftNumber;
    });

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
    const subFolderId = await this.findSubFolder(productFolder.id);
    const liftFolderId = await this.findLiftFolder(subFolderId, liftNumber);
    const htmlFileId = await this.findHtmlFile(liftFolderId);

    return await this.fetchHtmlContent(htmlFileId);
  }
}
