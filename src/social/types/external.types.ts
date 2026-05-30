import type { ExternalAccount } from './domain';

export type SocialExternalAccount = ExternalAccount;

export interface XImportPost {
  id: string;
  title: string;
  body: string;
  importedAt: string;
}
