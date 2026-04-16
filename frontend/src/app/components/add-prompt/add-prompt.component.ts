import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PromptService } from '../../services/prompt.service';
import { Tag } from '../../models/prompt.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-prompt',
  templateUrl: './add-prompt.component.html',
  styleUrls: ['./add-prompt.component.scss'],
})
export class AddPromptComponent implements OnInit, OnDestroy {
  promptForm!: FormGroup;
  availableTags: Tag[] = [];
  selectedTags: string[] = [];
  submitting = false;
  submitError: string | null = null;
  submitSuccess = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private promptService: PromptService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.promptForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      complexity: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    });

    this.promptService.getTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: tags => this.availableTags = tags });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get title(): FormControl { return this.promptForm.get('title') as FormControl; }
  get content(): FormControl { return this.promptForm.get('content') as FormControl; }
  get complexity(): FormControl { return this.promptForm.get('complexity') as FormControl; }

  get complexityValue(): number { return Number(this.complexity.value) || 5; }

  getComplexityLabel(v: number): string {
    if (v <= 3) return 'Low';
    if (v <= 6) return 'Medium';
    if (v <= 8) return 'High';
    return 'Extreme';
  }

  getComplexityClass(v: number): string {
    if (v <= 3) return 'low';
    if (v <= 6) return 'medium';
    return 'high';
  }

  toggleTag(tagName: string): void {
    const idx = this.selectedTags.indexOf(tagName);
    if (idx > -1) {
      this.selectedTags.splice(idx, 1);
    } else {
      this.selectedTags.push(tagName);
    }
  }

  isTagSelected(tagName: string): boolean {
    return this.selectedTags.includes(tagName);
  }

  onTagInputChange(event: Event): void {
    // Handled via template reference variable
  }

  addCustomTag(value: string): void {
    const tag = (value || '').trim().toLowerCase();
    if (!tag) return;
    if (!this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
    }
  }

  removeSelectedTag(tagName: string): void {
    this.selectedTags = this.selectedTags.filter(t => t !== tagName);
  }

  isFieldInvalid(control: FormControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.promptForm.invalid) {
      this.promptForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = null;

    const payload = {
      title: this.promptForm.value.title.trim(),
      content: this.promptForm.value.content.trim(),
      complexity: Number(this.promptForm.value.complexity),
      tags: this.selectedTags,
    };

    this.promptService.createPrompt(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: prompt => {
          this.submitting = false;
          this.submitSuccess = true;
          setTimeout(() => this.router.navigate(['/prompts', prompt.id]), 1000);
        },
        error: err => {
          this.submitting = false;
          if (err.error?.errors) {
            this.submitError = Object.values(err.error.errors).join(' ');
          } else if (err.error?.error) {
            this.submitError = err.error.error;
          } else if (err.status === 401) {
            this.submitError = 'You must be logged in to create prompts.';
          } else {
            this.submitError = 'Something went wrong. Please try again.';
          }
        },
      });
  }
}