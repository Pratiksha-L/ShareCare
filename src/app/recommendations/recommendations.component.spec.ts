import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StocksRecommended } from '../model/stocksRecommended';
import { RecommendationsComponent } from './recommendations.component';

describe('RecommendationsComponent', () => 
{
  let component: RecommendationsComponent;
  let fixture: ComponentFixture<RecommendationsComponent>;
  let element : StocksRecommended ;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecommendationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as page title 'Nifty Recommendations'`,async () => {
    expect(component.pageTitle).toEqual('Nifty Recommendations') ;
  })

  it('should render page title in a h1 tag', async() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Nifty Recommendations');
  });

  it(`should have as dropdown1 title 'Sectors'`,async () => {
    expect(component.dropdown1Title).toEqual('Sectors') ;
  })

  it(`should have as dropdown1 title 'Parameters'`,async () => {
    expect(component.dropdown2Title).toEqual('Parameters') ;
  })

  it('#showDialogueBox() should set #displayDialogueBox to true',async () => {
     component.showDialogueBox("Infosys") ;
     expect(component.displayDialogueBox).toBeTruthy() ;
  })
 
  it('#showSuccessMessage() should set #displayDialogueBox to false & #selectedStockToSave to #element:StocksRecommended',async () => {
     element = 
     {
      companyName : "Infosys"  ,
      currentPrice : 1511.35 ,
      percentageChange : 9 ,
      marketCap : 642000 ,
      growth : 0 ,
      volume : 6427862 ,
      eps : 0 ,
      pe : 33.20 ,
      dividends : 1.79 ,
      movingAverage : 1471.36 ,
      close : 1500.30 
     } ;
     component.showSuccessMessage(element) ;
     expect(component.displayDialogueBox).toBeFalsy() ;
     expect(component.selectedStockToSave).toEqual(element) ;
  })

  it('#recommendationButtonClick() should set #hasError to true if Sector or Parameter is/are null', async () => {
     component.selectedSector = "" ;
     component.selectedParamValue = "growth" ;
     component.recommendationButtonClick() ;
     expect(component.hasError).toBeTruthy() ;
  })

  it('#recommendationButtonClick() should set #hasError to false if Sector and Parameter are not null',async () => {
     component.selectedSector = "Automobile" ;
     component.selectedParamValue = "growth" ;
     component.recommendationButtonClick() ;
    expect(component.hasError).toBeFalsy() ;
  })

  it('#initialBarGraphConfiguration() should set #lineChartGradientsNumbersType to bar',async () => {
    component.initialBarGraphConfiguration() ;
    expect(component.barGraphGradientsNumbersType).toEqual("bar") ;
 })

 
});


