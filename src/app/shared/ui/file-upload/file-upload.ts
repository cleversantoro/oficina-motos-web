import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule, FileSelectEvent } from 'primeng/fileupload';
import { ClientesService } from '../../../core/services/clientes.service';
import { Toast } from '../../services/toast';
import { Confirmation } from '../../services/confirmation';

interface Anexo {
  id: number;
  clienteId: number;
  nome: string;
  tipo: string;
  url: string;
  observacao?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, FileUploadModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
  providers: [ClientesService],
})
export class FileUpload implements OnInit, OnChanges {
  @Input() clienteId!: number;
  @Input() readonly = false;

  private clientesService = inject(ClientesService);
  private toast = inject(Toast);
  private confirmation = inject(Confirmation);

  anexos: Anexo[] = [];
  loading = false;
  uploading = false;
  pendingFile: File | null = null;
  pendingObs = '';

  ngOnInit(): void {
    if (this.clienteId) this.loadAnexos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clienteId'] && !changes['clienteId'].firstChange) {
      this.loadAnexos();
    }
  }

  loadAnexos(): void {
    this.loading = true;
    this.clientesService.getAnexos({ clienteId: this.clienteId }).subscribe({
      next: (data: any) => {
        this.anexos = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onFileSelect(event: FileSelectEvent): void {
    this.pendingFile = event.files[0] ?? null;
  }

  onClearPending(): void {
    this.pendingFile = null;
    this.pendingObs = '';
  }

  onUpload(): void {
    if (!this.pendingFile || !this.clienteId) return;
    this.uploading = true;

    this.clientesService
      .uploadAnexo(this.clienteId, this.pendingFile, this.pendingObs || undefined)
      .subscribe({
        next: () => {
          this.pendingFile = null;
          this.pendingObs = '';
          this.uploading = false;
          this.toast.success('Arquivo enviado!', 'O anexo foi salvo com sucesso.');
          this.loadAnexos();
        },
        error: (err: any) => {
          this.uploading = false;
          this.toast.error('Erro no upload', err?.error?.message ?? 'Falha ao enviar arquivo.');
        },
      });
  }

  confirmDelete(anexo: Anexo): void {
    this.confirmation.confirmDelete(anexo.nome).then((confirmed) => {
      if (confirmed) this.deleteAnexo(anexo.id);
    });
  }

  private deleteAnexo(id: number): void {
    this.clientesService.deleteAnexo(id).subscribe({
      next: () => {
        this.toast.success('Removido', 'Anexo excluído com sucesso.');
        this.loadAnexos();
      },
      error: () => this.toast.error('Erro', 'Não foi possível excluir o anexo.'),
    });
  }

  getDownloadUrl(url: string): string {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    const base = 'http://localhost:5000';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getFileIcon(tipo: string): string {
    const t = (tipo ?? '').toLowerCase();
    if (t.includes('pdf')) return 'pi-file-pdf';
    if (t.includes('word') || t.includes('doc')) return 'pi-file-word';
    if (t.includes('excel') || t.includes('xls') || t.includes('sheet')) return 'pi-file-excel';
    if (t.includes('image') || t.includes('jpg') || t.includes('jpeg') || t.includes('png'))
      return 'pi-image';
    return 'pi-file';
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
