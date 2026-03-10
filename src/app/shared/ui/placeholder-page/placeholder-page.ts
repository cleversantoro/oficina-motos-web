import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [],
  templateUrl: './placeholder-page.html',
  styleUrl: './placeholder-page.scss',
})
export class PlaceholderPage {
  @Input() title = 'Em breve';
  @Input() message = 'Esta tela ainda esta sendo montada.';
}
