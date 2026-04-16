import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-complexity-badge',
  template: `
    <span class="badge" [ngClass]="getBadgeClass()">
      {{ getLabel() }}
    </span>
  `,
})
export class ComplexityBadgeComponent {
  @Input() complexity: number = 1;

  getBadgeClass(): string {
    if (this.complexity <= 3) return 'badge-low';
    if (this.complexity <= 6) return 'badge-medium';
    return 'badge-high';
  }

  getLabel(): string {
    if (this.complexity <= 3) return `L${this.complexity}`;
    if (this.complexity <= 6) return `M${this.complexity}`;
    return `H${this.complexity}`;
  }
}