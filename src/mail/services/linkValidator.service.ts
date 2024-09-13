import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LinkValidatorService {
  private extractLinks(text: string): string[] {
    const regex = /https?:\/\/[^\s<>"']+/g;

    const links = text.match(regex);
    return links || [];
  }

  private async checkLinks(link: string): Promise<boolean> {
    try {
      const response = await axios.get(link);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  public async validateLinks(
    text: string,
  ): Promise<{ link: string; valid: boolean }[]> {
    const links = this.extractLinks(text);
    const result: { link: string; valid: boolean }[] = [];
    const uniqueLinks = new Set<string>();

    for (const link of links) {
      if (uniqueLinks.has(link)) {
        continue;
      }
      uniqueLinks.add(link);
      const isValid = await this.checkLinks(link);
      result.push({ link, valid: isValid });
    }

    return result;
  }
}
