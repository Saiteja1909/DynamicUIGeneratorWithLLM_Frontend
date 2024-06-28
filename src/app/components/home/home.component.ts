import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  // encapsulation: ViewEncapsulation.None  // Applies styles globally
})
export class HomeComponent implements OnInit {
  definitionName: string = '';
  definitions: any[] = [];
  command: string = '';
  generatedCode: SafeHtml = '';
  showPreview: boolean = false;  // Flag to toggle between command input and preview
  isLoading: boolean = false;  // Flag to track loading state
  API_BASE_URL = 'http://localhost:5000';
  activeDefinition: any = null;
  userName: string = '';

  constructor(
    private http: HttpClient, 
    private sanitizer: DomSanitizer, 
    private router: Router, 
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.fetchDefinitions();
    this.loadUserData();
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  loadUserData(): void {
    const userInfoString = localStorage.getItem('user');
    if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        this.userName = userInfo.username; // Ensure you use the correct property name
    } else {
        this.userName = 'Unknown'; // Fallback to 'Unknown' if no user info
    }
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  extractHtmlContent(safeHtml: any): string {
    let content = safeHtml;
    // Loop to continuously unwrap the content if it's nested within multiple SafeHtml layers
    while (content && content.changingThisBreaksApplicationSecurity) {
      content = content.changingThisBreaksApplicationSecurity;
    }
    return typeof content === 'string' ? content : '';
  }
  

  resetForm(): void {
    this.definitionName = '';
    this.command = '';
    this.generatedCode = '';
    this.activeDefinition = null;
    this.showPreview = false;
  }

  startEdit(definition: any): void {
    this.activeDefinition = definition;
    this.definitionName = definition.name;
    this.command = definition.command;
    this.generatedCode = this.sanitizer.bypassSecurityTrustHtml(definition.code);
    this.showPreview = false; // Optionally switch to the input view for editing
  }
  

  generate(): void {
    this.isLoading = true;  // Set loading to true on submit
    this.http.post<any>(this.API_BASE_URL+'/api/ui-generation/generate-ui', { command: this.command })
      .subscribe({
        next: (response) => {
          this.generatedCode = this.sanitizer.bypassSecurityTrustHtml(response.uiComponentCode);
          this.isLoading = false;  // Reset loading state on success
          this.showPreview = true;  // Automatically show the preview after generation
        },
        error: (error) => {
          console.error('Failed to generate UI component', error);
          this.isLoading = false;  // Reset loading state on error
          this.showError('Failed to generate UI component: ' + error.message);
        }
      });
  }

  saveDefinition(): void {
    console.log("This is the code string BEFORE>>>>>>>>>>>", this.generatedCode);

    // Trying to safely extract the HTML content from the SafeHtml object
    let codeString = this.extractHtmlContent(this.generatedCode);

    console.log("This is the code string AFTER>>>>>>>>>>>", codeString);
    const url = this.activeDefinition ? `${this.API_BASE_URL}/api/definitions/${this.activeDefinition._id}` : `${this.API_BASE_URL}/api/definitions`;
    const method = this.activeDefinition ? 'put' : 'post';
  
    this.http.request(method, url, {
      body: {
        name: this.definitionName,
        command: this.command,
        code: codeString
      }
    }).subscribe({ 
      next: (response) => {
      this.fetchDefinitions();
      // this.resetForm();
    },
    error: (error) => {
      console.error('Failed to save UI component', error);
      this.isLoading = false;  // Reset loading state on error
      this.showError('Failed to save UI component: ' + error.message);
    }
});
  }
  

  fetchDefinitions(): void {
    this.http.get<any[]>(this.API_BASE_URL + '/api/definitions').subscribe({
      next: (response: any[]) => {
        this.definitions = response.map(def => ({
          ...def,
          code: this.sanitizer.bypassSecurityTrustHtml(def.code)  // Convert the HTML string to SafeHtml
        }));
        this.resetForm();
      },
      error: (error) => {
        console.error('Failed to fetch definitions', error);
        this.showError('Failed to fetch saved definitions: ' + error.message);
      }
    });
  }

  deleteDefinition(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {name: name}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If user clicks 'Delete', proceed with the deletion
        this.http.delete(`${this.API_BASE_URL}/api/definitions/${id}`).subscribe({
            next: () => {
              this.fetchDefinitions();
            },
            error: (error) => {
              console.error('Deletion failed', error);
              this.showError('Failed to delete ' + name);
            }
          });
      }
    });
  }
  

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
