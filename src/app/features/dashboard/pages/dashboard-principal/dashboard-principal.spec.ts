import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardPrincipalComponent } from './dashboard-principal';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardKpisResponse } from '../../../../core/models/dashboard';

describe('DashboardPrincipalComponent', () => {
  let fixture: ComponentFixture<DashboardPrincipalComponent>;
  let component: DashboardPrincipalComponent;
  let getKpisMock: ReturnType<typeof vi.fn>;

  const mockKpisPayload: DashboardKpisResponse = {
    periodo: '2026-11',
    osAbertas: 5,
    osDoDia: 2,
    osConcluidasMes: 8,
    faturamentoMensal: 4850,
    ticketMedio: 606.25,
    pecasAbaixoMinimo: 2,
    osPorStatus: [
      { status: 'Aberta', label: 'Aberta', quantidade: 2 },
      { status: 'EmAndamento', label: 'Em Andamento', quantidade: 2 },
      { status: 'AguardandoPeca', label: 'Aguardando Peça', quantidade: 1 },
      { status: 'Concluida', label: 'Concluída', quantidade: 8 },
      { status: 'Cancelada', label: 'Cancelada', quantidade: 1 },
    ],
    faturamentoUltimosSeisMeses: [
      { mes: '2026-06', rotulo: 'Jun/26', valor: 3200, quantidadeOs: 5 },
      { mes: '2026-07', rotulo: 'Jul/26', valor: 4100, quantidadeOs: 7 },
      { mes: '2026-08', rotulo: 'Ago/26', valor: 2950, quantidadeOs: 4 },
      { mes: '2026-09', rotulo: 'Set/26', valor: 5120, quantidadeOs: 9 },
      { mes: '2026-10', rotulo: 'Out/26', valor: 4400, quantidadeOs: 7 },
      { mes: '2026-11', rotulo: 'Nov/26', valor: 4850, quantidadeOs: 8 },
    ],
    pecasCriticas: [
      {
        id: 14,
        codigo: 'PAST-CB300',
        descricao: 'Pastilha de Freio Dianteira CB 300',
        quantidadeAtual: 2,
        estoqueMinimo: 5,
        deficit: 3,
        unidade: 'UN',
      },
      {
        id: 27,
        codigo: 'OLEO-10W30',
        descricao: 'Óleo Semissintético 10W30',
        quantidadeAtual: 1,
        estoqueMinimo: 6,
        deficit: 5,
        unidade: 'LT',
      },
    ],
  };

  beforeEach(async () => {
    getKpisMock = vi.fn();

    await TestBed.configureTestingModule({
      imports: [DashboardPrincipalComponent],
      providers: [
        provideRouter([]),
        {
          provide: DashboardService,
          useValue: {
            getKpis: getKpisMock,
          },
        },
      ],
    }).compileComponents();
  });

  it('T-033.4 — deve exibir skeleton loading nos cards de KPI enquanto aguarda resposta de GET /api/v1/Dashboard/kpis', () => {
    const pending$ = new Subject<DashboardKpisResponse>();
    getKpisMock.mockReturnValue(pending$.asObservable());

    fixture = TestBed.createComponent(DashboardPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loading()).toBe(true);
    const skeletonCards = fixture.nativeElement.querySelectorAll('[data-testid="kpi-skeleton"]');
    expect(skeletonCards.length).toBe(4);
  });

  it('T-033.1, T-033.2, T-033.3 & T-034.2 — deve consumir GET /api/v1/Dashboard/kpis e renderizar KPIs, grafico de OS por status, grafico de faturamento (6 meses) e card Alertas de Estoque com link /estoque/:id', () => {
    getKpisMock.mockReturnValue(of(mockKpisPayload));

    fixture = TestBed.createComponent(DashboardPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(getKpisMock).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBe(false);

    // Cards de KPI
    const kpiCards = fixture.nativeElement.querySelectorAll('[data-testid="kpi-card"]');
    expect(kpiCards.length).toBe(4);
    expect(fixture.nativeElement.textContent).toContain('5 abertas');
    expect(fixture.nativeElement.textContent).toContain('2 OS aberta(s) hoje');

    // T-033.2: Gráfico de OS por status
    const statusBars = fixture.nativeElement.querySelectorAll('[data-testid="os-status-bar"]');
    expect(statusBars.length).toBe(5);
    expect(fixture.nativeElement.querySelector('[data-testid="chart-os-status"]').textContent).toContain('Em Andamento');

    // T-033.3: Gráfico de faturamento mensal (6 meses)
    const revenueBars = fixture.nativeElement.querySelectorAll('[data-testid="faturamento-mes-bar"]');
    expect(revenueBars.length).toBe(6);
    expect(fixture.nativeElement.querySelector('[data-testid="chart-faturamento-mensal"]').textContent).toContain('Jun/26');
    expect(fixture.nativeElement.querySelector('[data-testid="chart-faturamento-mensal"]').textContent).toContain('Nov/26');

    // T-034.2: Card "Alertas de Estoque" com link para /estoque/:id
    const alertCard = fixture.nativeElement.querySelector('[data-testid="card-alertas-estoque"]');
    expect(alertCard).toBeTruthy();
    expect(alertCard.textContent).toContain('Alertas de Estoque');
    expect(alertCard.textContent).toContain('Pastilha de Freio Dianteira CB 300');

    const alertLinks = fixture.nativeElement.querySelectorAll('[data-testid="alerta-estoque-link"]');
    expect(alertLinks.length).toBe(2);
    expect(alertLinks[0].getAttribute('href')).toBe('/estoque/14');
    expect(alertLinks[1].getAttribute('href')).toBe('/estoque/27');
  });
});
