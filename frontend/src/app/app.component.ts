import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 60px);
    }
  `],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.checkAuth().subscribe();
  }
}