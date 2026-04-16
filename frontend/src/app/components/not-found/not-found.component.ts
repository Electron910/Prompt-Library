import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="page-enter not-found">
      <div class="not-found-content">
        <div class="not-found-code">404</div>
        <h1 class="not-found-title">Page Not Found</h1>
        <p class="not-found-desc">The page you are looking for does not exist.</p>
        <a routerLink="/prompts" class="btn btn-primary">Back to Library</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 60px);
    }

    .not-found-content {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .not-found-code {
      font-size: 80px;
      font-weight: 700;
      font-family: var(--font-mono);
      color: var(--color-text-muted);
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .not-found-title {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .not-found-desc {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }
  `],
})
export class NotFoundComponent {}