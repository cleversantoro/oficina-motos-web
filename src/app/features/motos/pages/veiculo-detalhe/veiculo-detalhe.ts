import { Component } from '@angular/core';

type TabId = 'historico' | 'dados' | 'docs';

type OsResumo = { id: string; data: string; servico: string; valor: string; status: 'concluida' | 'orcamento' };
type Kpi = { label: string; valor: string; alerta?: boolean };
type Dado = { label: string; valor: string };

@Component({
  selector: 'app-veiculo-detalhe',
  standalone: true,
  imports: [],
  templateUrl: './veiculo-detalhe.html',
  styleUrl: './veiculo-detalhe.scss',
})
export class VeiculoDetalhe {
  activeTab: TabId = 'historico';

  readonly veiculo = {
    placa: 'ABC-1234',
    modelo: 'Honda Civic Sedan 2.0 (2020)',
    dono: 'Maria da Silva',
    donoId: '#456',
  };

  readonly kpis: Kpi[] = [
    { label: 'Ultimo KM registrado', valor: '120.500 KM' },
    { label: 'Proxima troca de oleo', valor: '10.000 KM', alerta: true },
  ];

  readonly historico: OsResumo[] = [
    { id: '#1024', data: '15/11/2025', servico: 'Revisao completa (oleo, filtros)', valor: 'R$ 850,00', status: 'concluida' },
    { id: '#0987', data: '01/08/2025', servico: 'Troca de pneus dianteiros', valor: 'R$ 1.200,00', status: 'orcamento' },
    { id: '#0850', data: '20/03/2025', servico: 'Revisao freios e suspensao', valor: 'R$ 4.500,00', status: 'concluida' },
  ];

  readonly dadosTecnicos: Dado[] = [
    { label: 'Marca', valor: 'Honda' },
    { label: 'Modelo', valor: 'Civic Sedan 2.0' },
    { label: 'Ano Fab/Modelo', valor: '2020/2020' },
    { label: 'Cor', valor: 'Prata' },
    { label: 'Motor', valor: '2.0L i-VTEC' },
    { label: 'Combustivel', valor: 'Flex' },
    { label: 'Chassi', valor: '9B775CXXXXXXXXXXXXX' },
  ];

  setTab(tab: TabId) {
    this.activeTab = tab;
  }
}
