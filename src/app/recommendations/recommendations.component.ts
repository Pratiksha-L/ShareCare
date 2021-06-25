import {MessageService} from 'primeng/api'
import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import {RecommendationsService} from '../services/recommendations.service'
import { StocksRecommended } from '../model/stocksRecommended';
import { TabView } from 'primeng/tabview';
import { UserProfileService } from '../services/user-profile.service';
import { UserHistory } from '../model/userHistory';
import { User } from '../model/user';
//import { DecimalPipe } from '@angular/common';

//Interface: Finance Parameter for Recommendations
interface Parameter 
{
  label: string,
  value: string,
  definition: string
}

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
  
})

export class RecommendationsComponent implements OnInit 
{
  //Bar Graph
  public gradientStroke: any;
  public chartColor: any;
  public canvas : any;
  public ctx: { createLinearGradient: (arg0: number, arg1: number, arg2: number, arg3: number) => any; };
  public gradientFill: { addColorStop: (arg0: number, arg1: string) => void; };
  public gradientChartOptionsConfiguration: any;
  public gradientChartOptionsConfigurationWithNumbersAndGrid: any;
  public barGraphGradientsNumbersType: string;
  public barGraphGradientsNumbersData:Array<any>;
  public barGraphGradientsNumbersOptions:any;
  public barGraphGradientsNumbersLabels:Array<any>;
  public barGraphGradientsNumbersColors:Array<any>;

  //Immutable Data
  pageTitle : string = "Nifty Recommendations" ;
  dropdown1Title : string = "Sectors" ;
  dropdown2Title : string = "Parameters" ;

  //Defaults                 
  selectedSector : string = "Information Technology";//Default selected sector
  selectedParamValue :string = "growth";             //To bind selectedParamValue   
  selectedParameter :Parameter = 
  {
    label : "Growth",
    value:"growth",
    definition:"Growth rates are used to express the annual change in a variable as a percentage."
  };                                                 //Default selected parameter
  tradeType : string = "BUY";                        //Default trade type
  savedQuantity: number = 1 ;                        //Default saved stock quantity

  //Error Checks
  hasError: boolean = false;                         //For get recommendation
  showBuyTable : boolean = false;                    //For showing Buy recommendations  
  showSellTable : boolean = false ;                  //For showing Sell recommendations
  showHoldTable : boolean = false ;                  //For showing Hold recommendations
  displayDialogueBox: boolean = false;               //For saving selected stock,display Dialogue Box 

  parameters: Parameter[] = [];                      //Finance Parameters
  sectorList: SelectItem[] = [];                     //Sectors
  stocksToBuy : StocksRecommended[] = [] ;           //Recommended stocks to BUY
  stocksToSell : StocksRecommended[] = [];           //Recommended stocks to SELL
  stocksToHold : StocksRecommended[] = [] ;          //Recommended stocks to HOLD
  columnData: 
  { 
    label: string; 
    description: string; 
  }[] = [];                                          //Table Column Header Data
  stocks : StocksRecommended[] = [] ;                //Sorted stock list wrt user's selected parameter & sector

  messageService1: MessageService ;                  //Message service from PrimeNG
  selectedStockToSave : StocksRecommended ;          //Stock saved sent to UserHistory
  user : User ;                                      //User object
  selectedStock : string = "" ;                      //To bind selected stock company name

  constructor
  (
    private recommendationService: RecommendationsService, 
    private messageService: MessageService,private userProfileService :UserProfileService
    //private _decimalPipe: DecimalPipe 
  )
  { 
    this.sectorList = 
     [ 
       { label:"Automobile", value: "Automobile"},
       { label:"Banking", value: "Banking"},
       { label:"Cement", value: "Cement"},
       { label:"Energy", value: "Energy"},
       { label:"Information Technology", value: "Information Technology"},
       { label:"FMCG", value: "FMCG"} ,
       { label:"Pharmaceuticals", value: "Pharmaceuticals"},
       { label:"Metal", value: "Metal"}     
    ],

    this.parameters = 
     [ 
       { 
         label:"Growth", 
         value: "growth",
         definition: "Growth rates are used to express the annual change in a variable as a percentage."
        },

       { 
         label:"Volume", 
         value: "volume",
         definition: "Volume is the number of shares of a security traded during a given period of time"
        },

       { 
         label:"Dividends", 
         value: "dividends",
         definition: "Dividends are payments made by publicly-listed companies as a reward to investors for putting their money into the venture."
        },

       { 
         label:"P/E", 
         value: "pe",
         definition:"Price-Earnings ratio(P/E ratio) relates a company's share price to its earnings per share."
        },

       { 
         label:"EPS",
         value: "eps",
         definition:"Earnings per share(EPS) is calculated as a company's profit divided by the outstanding shares of its common stock"
        },

       { 
         label:"Simple Moving Average", 
         value: "movingAverage",
         definition:"Simple Moving Average(SMA) calculates the average of a selected range of prices, usually closing prices, by the number of periods in that range."
        }   
    ];
  }

  ngOnInit() :void
  { 
    this.reinitialiseColumnData() ;
    this.recommendationButtonClick() ;  
    this.initialBarGraphConfiguration() ;
  }

  //Error Handling: Getting Recommendations
  getRecommendation()
  {
    this.recommendationService.getRecommendation(this.selectedSector, this.selectedParamValue).subscribe((result :StocksRecommended[]) =>
    {
      if(result == null  || result.length == 0 )
      {
        this.messageService1.add({severity : 'error', summary : 'Error',detail : 'Incorrect Sector or Parameter'}) ;

      }
      else
      {
        this.stocks = [];
        this.selectedParameter = this.parameters.filter( data => data.value == this.selectedParamValue)[0];
        this.reinitialiseColumnData();
        result.forEach(stock  => 
          {

            this.stocks.push({
            companyName:stock.companyName.replace("Limited", ""), 
            currentPrice : stock.currentPrice,  
            percentageChange:stock.percentageChange, 
            marketCap:stock.marketCap, 
            volume: stock.volume ,
            eps: stock.eps,
            growth: stock.growth ,
            dividends : stock.dividends ,
            pe : stock.pe ,
            movingAverage : stock.movingAverage ,
            close : stock.close });
           // Number(this._decimalPipe.transform(stock.close, '1.2-2')
        }) ;
        
      this.buySellHoldRecommendations() ;
      
      }
    
    },
    (err: any) =>
    {
      this.messageService1.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })        
    })

  }

  //Error Handling: Adding Saved Stocks to User History
  addSavedStocks()
  {
    let userHistory : UserHistory;
    userHistory.userName = this.user.userName ;
    userHistory.stockName = this.selectedStockToSave.companyName ;
    userHistory.sector = this.selectedSector ;
    userHistory.currentPrice = this.selectedStockToSave.currentPrice ;
    userHistory.quantity = this.savedQuantity ;
    userHistory.tradeType = this.tradeType ;

    this.userProfileService.addSavedStocks(userHistory) 

    .subscribe((result) => 
    {
     if (result) 
      {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Stock saved successfully' });
      } 
      else 
      {
        this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Failed to save stock' });
      }
    }, 
    err => 
    {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Failed to save stock' });
    })

  }

  //Function: Recommendation Logic- BUY | HOLD | SELL
  buySellHoldRecommendations()
  {
    this.stocksToBuy = [];
    this.stocksToSell = [];
    this.stocksToHold = [] ;

    //Stocks to BUY
    console.log("Top 5 recommended stocks to BUY : ");
    for(let i = 0 ; i < 5 ; ++i )
    {

      this.stocksToBuy[i] = this.stocks[i] ; 
      console.log(this.stocksToBuy[i].companyName);

    }

    //Stocks to HOLD
     console.log("Top 5 recommended stocks to HOLD : ");
     for(let i = 5,j = 0 ; i < 10 ; ++i,++j )
     {

       this.stocksToHold[j] = this.stocks[i] ; 
       console.log(this.stocksToHold[j].companyName);

     }

     // Stocks to SELL
    console.log("Top 5 recommended stocks to SELL : ");
    for(let i = (this.stocks.length)-1, j=0 ; i >= (this.stocks.length - 5) ; --i,++j )
    {
      
      this.stocksToSell[j] = this.stocks[i] ; 
      console.log(this.stocksToSell[j].companyName);

    }
   
    if(this.tradeType ==="BUY") 
    {
      this.handleChange({index :0})
    }
  }

  //Function: Reinitializing Column Data
  reinitialiseColumnData(){
    this.columnData = 
    [
      {
        label : 'Company Name', 
        description:''
      },
      {
        label : 'Curr. Price(Rs.)', 
        description :'' 
      } ,
      {
        label : this.selectedParameter.label, 
        description : this.selectedParameter.definition
      },
      {
        label : 'Change(%)', 
        description:''
      },
      {
        label : 'Market Cap.(Rs.cr)',
        description: 'Market Cap. is the total market value of all outstanding shares.'
      }
    ];
  }

  //Function: Initial Bar Graph Configuration
  initialBarGraphConfiguration()
  {
      //Bar Graph
      this.canvas = document.getElementById("barChartSimpleGradientsNumbers");
      this.ctx = this.canvas.getContext("2d");

      this.gradientFill = this.ctx.createLinearGradient(20, 400, 100, 50);
      this.gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
      this.gradientFill.addColorStop(1, this.hexToRGB('#2CA8FF', 0.8));

      this.barGraphGradientsNumbersData = 
      [
          {
            label: this.selectedParameter.label ,
            pointBorderWidth: 2,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 1,
            pointRadius: 4,
            fill: true,
            borderWidth: 1,
            data: this.stocksToBuy.map(data => data.growth) 
            //[190, 99, 70, 96, 123]
  
          }
        ];

        this.barGraphGradientsNumbersColors = 
        [
          {
            backgroundColor: this.gradientFill,
            borderColor: "#2CA8FF",
            pointBorderColor: "#FFF",
            pointBackgroundColor: "#2CA8FF",
          }
        ];

        this.barGraphGradientsNumbersLabels = this.stocksToBuy.map(data => data.companyName);
        console.log(this.barGraphGradientsNumbersLabels);
        // this.lineChartGradientsNumbersLabels = 
        // [
        //   "Bal Pharma", "TCS", "Infosys", "Walmart", "MasterCard"
        // ];
    
      this.barGraphGradientsNumbersOptions = 
      {
          maintainAspectRatio: false,
          legend: 
          {
            display: false
          },
          tooltips: 
          {
            bodySpacing: 4,
            mode: "nearest",
            intersect: 0,
            position: "nearest",
            xPadding: 10,
            yPadding: 10,
            caretPadding: 10
          },
          responsive: 1,
          scales: 
          {
            yAxes:
            [{
              gridLines: 
              {
                zeroLineColor: "transparent",
                drawBorder: false
              },
              ticks: 
              {
                  stepSize: 20
              }
            }],
            xAxes: 
            [{
                display: 0,
                ticks: {
                display: false
              },
              gridLines: 
              {
                zeroLineColor: "transparent",
                drawTicks: false,
                display: false,
                drawBorder: false
              }
            }]
          },
          layout: 
          {
            padding: 
            {
              left: 0,
              right: 0,
              top: 15,
              bottom: 15
            }
          }
        }

      this.barGraphGradientsNumbersType = 'bar';
  }

  //Event: Showing Success message after stock is saved
  showSuccessMessage(element : StocksRecommended) 
  {
    this.messageService.add({severity:'info', summary: 'Success', detail: 'Saved successfully !'});
    this.selectedStockToSave = element ;
    this.displayDialogueBox = false ;
    this.addSavedStocks() ;
    console.log("Success Message for saving stocks generated !") ;
    console.log("Saved Stock : ", element.companyName) ;
  }

  //Event: Showing Dialogue Box for taking input for quantity of stocks to save
  showDialogueBox(selectedCompanyName : string) 
  {
    this.displayDialogueBox = true;
    this.selectedStock = selectedCompanyName ;
    console.log("Dialogue Box to input quantity of stocks to save is displayed !") ;
    console.log("Selected Stock: "+this.selectedStock) ;
  }

  //Event: Handling Change in Transaction Type wrt Bar Graph
  @ViewChild(TabView) tabView: TabView;
  handleChange(e:any) 
  {
    console.log("Changing tab " , e) ;
    var index = e.index;
    this.tradeType = this.tabView.tabs[index].header ;
    console.log("Transaction Type Changed to "+this.tradeType) ;

    if(this.tradeType == "BUY")
    {
      this.showBuyTable = true ;
      this.barGraphGradientsNumbersData = [
        {
          label: this.selectedParameter.label,
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 1,
          data: this.stocksToBuy.map(data => data[this.selectedParameter.value])
  
        }
      ];
      this.barGraphGradientsNumbersLabels = this.stocksToBuy.map(data => data.companyName);
      console.log(this.barGraphGradientsNumbersLabels);
    }

    else if(this.tradeType == "HOLD")
    {
      this.showHoldTable = true ;
      this.barGraphGradientsNumbersData = [
        {
          label: this.selectedParameter.label,
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 1,
          data: this.stocksToHold.map(data => data[this.selectedParameter.value])
  
        }
      ];
      this.barGraphGradientsNumbersLabels = this.stocksToHold.map(data => data.companyName)
      //["Bal Pharma", "TCS", "Infosys", "Walmart", "MasterCard"];
     // this.lineChartGradientsNumbersLabels = this.stocksToHold.map(data => data.companyName);
      console.log(this.barGraphGradientsNumbersLabels);
    }

    else if(this.tradeType == "SELL")
    {
      this.showSellTable = true ;
      this.barGraphGradientsNumbersData = [
        {
          label: this.selectedParameter.label,
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 1,
          data: this.stocksToSell.map(data => data[this.selectedParameter.value]) 
  
        }
      ];
      this.barGraphGradientsNumbersLabels = this.stocksToSell.map(data => data.companyName);
      console.log(this.barGraphGradientsNumbersLabels);
    }
  }

  //Event: Get recommendation button shows BUY | HOLD | SELL recommendations
  recommendationButtonClick():void
  {

    console.log("Get Recommendation Button is Clicked !" ) ;

    //Check if sector & parameter are selected are not
    if (this.selectedSector.length == 0 || this.selectedParameter.value.length == 0) 
    {
      this.hasError = true;
      return;
    } 
    else 
    {
      this.hasError = false;
      console.log("Getting Recommendations !") ;
      this.getRecommendation() ;
    }
  }

  //Event: Bar Graph Clicked
  chartClicked(e:any):void 
  {
    console.log("Bar Graph is clicked !", e);
  }

  //Event: Bar Graph Hovered
  chartHovered(e:any):void 
  {
    console.log("Bar Graph is hovered !" ,e);
  }

  //Event: Coverting Hexadecimal to RGB
   hexToRGB(hex: string, alpha: string | number) 
  {
    var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

    if (alpha) 
    {
      return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } 
    else 
    {
      return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  }

}
