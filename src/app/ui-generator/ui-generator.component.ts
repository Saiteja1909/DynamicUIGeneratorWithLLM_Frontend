// ui-generator.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-ui-generator',
  templateUrl: './ui-generator.component.html',
  styleUrls: ['./ui-generator.component.css']
})
export class UiGeneratorComponent implements OnInit {
  command: string = '';
  generatedCode: SafeHtml = '';
  isLoading: boolean = false;  // Flag to track loading state

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.isLoading = true;  // Set loading to true on submit
    this.http.post<any>('http://localhost:5000/api/ui-generation/generate-ui', { command: this.command })
      .subscribe({
        next: (response) => {
          this.generatedCode = this.sanitizer.bypassSecurityTrustHtml(response.uiComponentCode);
          this.isLoading = false;  // Reset loading state on success
        },
        error: (error) => {
          console.error('Failed to generate UI component', error);
          this.isLoading = false;  // Reset loading state on error
        }
      });
  }
}
