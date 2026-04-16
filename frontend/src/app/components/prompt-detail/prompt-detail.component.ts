import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PromptService } from '../../services/prompt.service';
import { Prompt } from '../../models/prompt.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-prompt-detail',
  templateUrl: './prompt-detail.component.html',
  styleUrls: ['./prompt-detail.component.scss'],
})
export class PromptDetailComponent implements OnInit, OnDestroy {
  prompt: Prompt | null = null;
  loading = false;
  error: string | null = null;
  copied = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promptService: PromptService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || isNaN(id)) {
          this.router.navigate(['/prompts']);
          return;
        }
        this.loadPrompt(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPrompt(id: number): void {
    this.loading = true;
    this.error = null;

    this.promptService.getPrompt(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: prompt => {
          this.prompt = prompt;
          this.loading = false;
        },
        error: err => {
          this.error = err.status === 404
            ? 'Prompt not found.'
            : 'Failed to load prompt.';
          this.loading = false;
        },
      });
  }

  copyContent(): void {
    if (!this.prompt) return;
    navigator.clipboard.writeText(this.prompt.content).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  refreshViewCount(): void {
    if (this.prompt) this.loadPrompt(this.prompt.id);
  }
}