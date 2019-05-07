import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerguntaDetalheComponent } from './pergunta-detalhe.component';

describe('PerguntaDetalheComponent', () => {
  let component: PerguntaDetalheComponent;
  let fixture: ComponentFixture<PerguntaDetalheComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerguntaDetalheComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerguntaDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
