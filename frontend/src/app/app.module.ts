import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PromptListComponent } from './components/prompt-list/prompt-list.component';
import { PromptDetailComponent } from './components/prompt-detail/prompt-detail.component';
import { AddPromptComponent } from './components/add-prompt/add-prompt.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ComplexityBadgeComponent } from './components/shared/complexity-badge/complexity-badge.component';
import { LoadingSpinnerComponent } from './components/shared/loading-spinner/loading-spinner.component';
import { CredentialsInterceptor } from './interceptors/credentials.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    PromptListComponent,
    PromptDetailComponent,
    AddPromptComponent,
    LoginComponent,
    NotFoundComponent,
    ComplexityBadgeComponent,
    LoadingSpinnerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}