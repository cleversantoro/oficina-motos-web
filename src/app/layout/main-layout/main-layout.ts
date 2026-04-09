import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from '../header/header';
import { AppSidebar } from '../sidebar/sidebar';
import { ToastComponent } from '../../shared/ui/toast/toast';
import { LoadingSpinner } from '../../shared/ui/loading-spinner/loading-spinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
//import { AppFooter } from '../footer/footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    AppHeader,
    AppSidebar,
    ToastComponent,
    LoadingSpinner,
    ConfirmDialogModule,
    //AppFooter
  ],
  providers: [ConfirmationService],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
