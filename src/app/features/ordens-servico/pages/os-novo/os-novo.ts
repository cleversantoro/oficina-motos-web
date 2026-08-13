import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-os-novo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './os-novo.html',
  styleUrl: './os-novo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsNovoComponent {}
