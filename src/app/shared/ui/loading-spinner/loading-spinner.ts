import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Loading } from '../../services/loading';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinner {
  protected loadingService = inject(Loading);
}
