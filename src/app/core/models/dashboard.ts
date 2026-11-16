export interface DashboardOsStatusCount {
  status: string;
  label: string;
  quantidade: number;
}

export interface DashboardFaturamentoMensal {
  mes: string;
  rotulo: string;
  valor: number;
  quantidadeOs: number;
}

export interface DashboardPecaCritica {
  id: number;
  codigo: string;
  descricao: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
  deficit: number;
  unidade: string;
}

export interface DashboardKpisResponse {
  periodo: string;
  osAbertas: number;
  osDoDia: number;
  osConcluidasMes: number;
  faturamentoMensal: number;
  ticketMedio: number;
  pecasAbaixoMinimo: number;
  osPorStatus: DashboardOsStatusCount[];
  faturamentoUltimosSeisMeses: DashboardFaturamentoMensal[];
  pecasCriticas: DashboardPecaCritica[];
}
