import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button'; // Botão
import { TableModule } from 'primeng/table';   // Tabela

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule], // Importando direto no componente (Standalone)
  templateUrl: './cliente-lista.html',
  styleUrl: './cliente-lista.scss',
})
export class ClienteLista {
  // Dados Fake só para testar o visual
  clientes = [
    { nome: 'João da Silva', cpf: '123.456.789-00', email: 'joao@gmail.com' },
    { nome: 'Maria Oliveira', cpf: '999.888.777-11', email: 'maria@hotmail.com' },
    { nome: 'Oficina do Pedro', cpf: '44.555.666/0001-99', email: 'contato@pedromotos.com' },
  ];

}
