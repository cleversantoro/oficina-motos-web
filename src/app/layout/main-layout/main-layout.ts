import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from '../header/header';
import { AppSidebar } from '../sidebar/sidebar';
//import { AppFooter } from '../footer/footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    AppHeader,
    AppSidebar,
    //AppFooter
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
