import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as page title 'NSE Top Gainer: '`,async () => {
    expect(component.pageTitle).toEqual('NSE Top Gainer: ') ;
  })

  it(`should have as card1 title 'Price Shockers'`,async () => {
    expect(component.card1Title).toEqual('Price Shockers') ;
  })

  it(`should have as card2 title 'Volume Shockers'`,async () => {
    expect(component.card2Title).toEqual('Volume Shockers') ;
  })

  it(`should have as card sub-title 'TRENDING'`,async () => {
    expect(component.cardSubTitle).toEqual('TRENDING') ;
  })

});
