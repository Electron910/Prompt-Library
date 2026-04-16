import { Component, OnInit, OnDestroy } from '@angular/core';
import { PromptService } from '../../services/prompt.service';
import { Prompt, Tag } from '../../models/prompt.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-prompt-list',
  templateUrl: './prompt-list.component.html',
  styleUrls: ['./prompt-list.component.scss'],
})
export class PromptListComponent implements OnInit, OnDestroy {
  prompts: Prompt[] = [];
  tags: Tag[] = [];
  selectedTag: string | null = null;
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private promptService: PromptService) {}

  ngOnInit(): void {
    this.loadTags();
    this.loadPrompts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTags(): void {
    this.promptService.getTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: tags => this.tags = tags });
  }

  loadPrompts(tag?: string): void {
    this.loading = true;
    this.error = null;

    this.promptService.getPrompts(tag)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: prompts => {
          this.prompts = prompts;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load prompts. Please try again.';
          this.loading = false;
        },
      });
  }

  filterByTag(tagName: string | null): void {
    this.selectedTag = tagName === this.selectedTag ? null : tagName;
    this.loadPrompts(this.selectedTag ?? undefined);
  }

  clearFilter(): void {
    this.selectedTag = null;
    this.loadPrompts();
  }

  getComplexityLabel(c: number): string {
    if (c <= 3) return 'Low';
    if (c <= 6) return 'Mid';
    return 'High';
  }

  trackById(_: number, p: Prompt): number { return p.id; }
}