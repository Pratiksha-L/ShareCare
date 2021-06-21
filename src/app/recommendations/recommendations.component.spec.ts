import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StocksRecommended } from '../model/stocksRecommended';
import { RecommendationsComponent } from './recommendations.component';

describe('RecommendationsComponent', () => {
  let component: RecommendationsComponent;
  let fixture: ComponentFixture<RecommendationsComponent>;
  let element : StocksRecommended ;
  let event : any ;

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
    component.showDialogueBox() ;
    expect(component.displayDialogueBox).toBeTruthy() ;
  })
 
  // it('#showSuccessMessage() should set #displayDialogueBox to false & #selectedStockToSave to #element:StocksRecommended',async () => {
  //   element = 
  //   {
  //     companyName : "Persistent Systems",
  //     currentPrice : 2530.10 ,
  //     bidPrice : 2456 ,
  //     percentageChange : -12.10 ,
  //     marketCap : 18960 ,
  //     parameterValue : 879
  //   } ;
  //   component.showSuccessMessage(element) ;
  //   expect(component.displayDialogueBox).toBeFalsy() ;
  //   expect(component.selectedStockToSave).toEqual(element) ;
  // })

  it('#recommendationClick() should set #hasError to true if Sector or Parameter is/are null', async () => {
    component.selectedSector = "" ;
    component.selectedParameter = "Growth" ;
    component.recommendationClick(event) ;
    expect(component.hasError).toBeTruthy() ;
  })

  it('#recommendationClick() should set #hasError to false if Sector and Parameter are not null',async () => {
    component.selectedSector = "Automobile" ;
    component.selectedParameter = "Growth" ;
    component.recommendationClick(event) ;
    expect(component.hasError).toBeFalsy() ;
  })
});


