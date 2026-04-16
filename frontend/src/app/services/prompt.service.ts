import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prompt, CreatePromptPayload, Tag } from '../models/prompt.model';

@Injectable({ providedIn: 'root' })
export class PromptService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getPrompts(tag?: string): Observable<Prompt[]> {
    let params = new HttpParams();
    if (tag) {
      params = params.set('tag', tag);
    }
    return this.http.get<Prompt[]>(`${this.baseUrl}/prompts/`, { params });
  }

  getPrompt(id: number): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.baseUrl}/prompts/${id}/`);
  }

  createPrompt(payload: CreatePromptPayload): Observable<Prompt> {
    return this.http.post<Prompt>(`${this.baseUrl}/prompts/`, payload);
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/tags/`);
  }
}