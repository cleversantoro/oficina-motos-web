import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type TabId = 'perfil' | 'contato' | 'financeiro' | 'legal' | 'anexos';

@Component({
  selector: 'app-cliente-cadastro',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cliente-cadastro.html',
  styleUrl: './cliente-cadastro.scss',
})
export class ClienteCadastro {
  activeTab: TabId = 'perfil';
  isPessoaFisica = true;

  readonly tabs: { id: TabId; label: string; desc: string }[] = [
    { id: 'perfil', label: 'Perfil & Identidade', desc: 'PF/PJ, status e origem' },
    { id: 'contato', label: 'Contato & Localizacao', desc: 'Telefones e enderecos' },
    { id: 'financeiro', label: 'Financeiro & Comercial', desc: 'Limite, indicacoes' },
    { id: 'legal', label: 'Legal & Compliance', desc: 'Documentos e LGPD' },
    { id: 'anexos', label: 'Arquivos', desc: 'Uploads e comprovantes' },
  ];

  readonly contatos = [
    { tipo: 'Celular (WhatsApp)', valor: '(11) 99999-9999', obs: 'Preferencial' },
    { tipo: 'Email Financeiro', valor: 'financeiro@cliente.com', obs: 'Boleto' },
  ];

  readonly enderecos = [
    {
      tag: 'Principal',
      cep: '01310-100',
      logradouro: 'Av. Paulista, 1000',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
    },
  ];

  readonly documentos = [
    { nome: 'RG', numero: '12.345.678-9', validade: '2028-05-12' },
    { nome: 'CNH', numero: '999999999', validade: '2027-11-01' },
  ];

  setTab(tab: TabId) {
    this.activeTab = tab;
  }

  setTipo(tipo: 'pf' | 'pj') {
    this.isPessoaFisica = tipo === 'pf';
  }

  onTabSelect(event: Event) {
    const value = (event.target as HTMLSelectElement | null)?.value as TabId | undefined;
    if (value) this.setTab(value);
  }
}
