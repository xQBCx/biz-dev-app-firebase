import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async signIn(email: string, password: string) {
    await this.page.goto('/auth');
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    await this.page.waitForURL('/dashboard', { timeout: 5000 });
  }

  async signOut() {
    const signOutButton = this.page.getByRole('button', { name: /sign out/i });
    await signOutButton.click();
    await this.page.waitForURL('/', { timeout: 5000 });
  }

  async clearAuth() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => localStorage.clear());
  }

  async isAuthenticated(): Promise<boolean> {
    const hasSession = await this.page.evaluate(() => {
      const auth = window.localStorage.getItem('sb-eoskcsbytaurtqrnuraw-auth-token');
      return auth !== null;
    });
    return hasSession;
  }
}
