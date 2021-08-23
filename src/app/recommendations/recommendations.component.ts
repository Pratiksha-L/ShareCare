import {BlockableUI, MessageService} from 'primeng/api'
import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import {RecommendationsService} from '../services/recommendations.service'
import { StocksRecommended } from '../model/stocksRecommended';
import { UserProfileService } from '../services/user-profile.service';
import { UserHistory } from '../model/userHistory';
import { User } from '../model/user';

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

export class RecommendationsComponent implements OnInit, BlockableUI 
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
  savedQuantity: number  ;                           //Default saved stock quantity

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
  buttonClicked : boolean = true;
  minimumBuy : number = 0 ;                          //Minimum Buy Parameter
  maximumBuy : number = 0 ;                          //Maximum Buy Parameter
  minimumHold : number = 0 ;                         //Minimum Hold Parameter
  maximumHold : number = 0 ;                         //Maximum Hold Parameter
  minimumSell : number = 0 ;                         //Minimum Sell Parameter
  maximumSell : number = 0 ;                         //Maximum Sell Parameter

  constructor
  (
    private recommendationService: RecommendationsService, 
    private messageService: MessageService,
    private userProfileService :UserProfileService
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
    this.user=JSON.parse(sessionStorage.getItem("user"))
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
  }

  //Error Handling: Getting Recommendations
  getRecommendation()
  {
    this.recommendationService.getRecommendation(this.selectedSector, this.selectedParamValue).subscribe((result :StocksRecommended[]) =>
    {
      this.buttonClicked=false;
      if(result == null  || result.length == 0 )
      {
        this.messageService1.add({severity : 'error', summary : 'Error',detail : 'Incorrect Sector or Parameter'}) ;
        this.buttonClicked = false;
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
           
        }) ;
 
      this.buySellHoldRecommendations() ;
      
      }
    
    },
    (err: any) =>
    {
      this.buttonClicked = false;
      this.messageService1.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })        
    })

  }

  //Error Handling: Adding Saved Stocks to User History
  addSavedStocks()
  {
    if(this.savedQuantity < 1)
    {
      this.messageService.add({severity: 'error', summary : 'Error',detail : "Saved Quantity cannot be less than 1."}) ;
      return;
    }
    let userHistory : UserHistory = new UserHistory();
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
        this.displayDialogueBox = false;
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

  //Event: Showing Dialogue Box for taking input for quantity of stocks to save
  showDialogueBox(element) 
  {
    this.selectedStockToSave = element;
    this.displayDialogueBox = true;
    this.selectedStock = element.companyName ;
  }

  //Event: Handling Change in Transaction Type wrt Bar Graph
  tabView = ["BUY","HOLD","SELL"];
  handleChange(e:any) 
  {
    
    var index = e.index;
    this.tradeType = this.tabView[index] ;
    
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
                  stepSize: 5,
                  min : this.minimumBuy - 10 ,
                  max : this.maximumBuy + 10 ,
                  maxTicksLimit : 7,
                  letterSpacing: "0.2px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" ,
                  fontColor: "black",
                  lineHeight: "17px"
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
                  stepSize: 5,
                  min : this.minimumHold - 10 ,
                  max : this.maximumHold + 10 ,
                  maxTicksLimit : 7,
                  letterSpacing: "0.2px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" ,
                  fontColor: "black",
                  lineHeight: "17px"
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
                  stepSize: 5,
                  min : this.minimumSell - 10 ,
                  max : this.maximumSell + 10 ,
                  maxTicksLimit : 7,
                  letterSpacing: "0.2px",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" ,
                  fontColor: "black",
                  lineHeight: "17px"
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
     
    }
  }

  //Event: Get recommendation button shows BUY | HOLD | SELL recommendations
  recommendationButtonClick():void
  {
    this.buttonClicked = true;
    
    //Check if sector & parameter are selected are not
    if (this.selectedSector.length == 0 || this.selectedParameter.value.length == 0) 
    {
      this.hasError = true;
      return;
    } 
    else 
    {
      this.hasError = false;
      this.getRecommendation() ;
    }
  }

  //Event: Bar Graph Clicked
  chartClicked(e:any):void 
  {
    
  }

  //Event: Bar Graph Hovered
  chartHovered(e:any):void 
  {
    
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
  
  //Function: Recommendation Logic- BUY | HOLD | SELL
  buySellHoldRecommendations()
  {
    this.stocksToBuy = [];
    this.stocksToSell = [];
    this.stocksToHold = [] ;

    //Stocks to BUY
    for(let i = 0 ; i < 5 ; ++i )
    {

      this.stocksToBuy[i] = this.stocks[i] ; 
     
    }

    //Stocks to HOLD
    for(let i = 5,j = 0 ; i < 10 ; ++i,++j )
    {

      this.stocksToHold[j] = this.stocks[i] ; 
    
    }

     // Stocks to SELL
    for(let i = (this.stocks.length)-1, j=0 ; i >= (this.stocks.length - 5) ; --i,++j )
    {
      
      this.stocksToSell[j] = this.stocks[i] ; 
    
    }
      
    this.minimumBuy = this.findMinimum(this.stocksToBuy) ;
    this.maximumBuy = this.findMaximum(this.stocksToBuy) ;
    this.minimumHold = this.findMinimum(this.stocksToHold) ;
    this.maximumHold = this.findMaximum(this.stocksToHold) ;
    this.minimumSell = this.findMinimum(this.stocksToSell) ;
    this.maximumSell = this.findMaximum(this.stocksToSell) ;
    this.initialBarGraphConfiguration() ;

    if(this.tradeType ==="BUY") 
    {
      this.handleChange({index :0}) ;
    }

    if(this.tradeType ==="HOLD") 
    {
      this.handleChange({index :1}) ;
    }

    if(this.tradeType ==="SELL") 
    {
      this.handleChange({index :2}) ;
    }
  }

  //Function: Rounding the given number to nearest multiple of 10
  round(n : number)
  {
    
    // Smaller multiple
    let a = Math.floor(n/10) * 10 ; 

    // Larger multiple
    let b = a + 100;
    
    // Return of closest of two
    return (n - a > b - n)? b : a;
  }

   //Function: To Block Web elements
   getBlockableElement(): HTMLElement 
   {
    return document.getElementById("pnl");
  }

  //Function: Finding minimum value of the selected parameter
  findMinimum(tempStocks: StocksRecommended[])
  {
    var minimumParameter : number = 0 ;
    var minimum : number = 0 ;
    if(this.selectedParameter.value == "growth")
    {
        minimum  = tempStocks[0].growth ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(minimum > tempStocks[i].growth)
          {
            minimum = tempStocks[i].growth ;
          }
        }
    }

   else if(this.selectedParameter.value == "volume")
    {
         minimum  = tempStocks[0].volume ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(minimum > tempStocks[i].volume)
          {
            minimum = tempStocks[i].volume ;
          }
        }
        minimum = minimum - 1000000 ;
    }

    else if(this.selectedParameter.value == "dividends")
    {
         minimum  = tempStocks[0].dividends ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(minimum > tempStocks[i].dividends)
          {
            minimum = tempStocks[i].dividends ;
          }
        }
    }

    else if(this.selectedParameter.value == "eps")
    {
       minimum  = tempStocks[0].eps ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(minimum > tempStocks[i].eps)
          {
            minimum = tempStocks[i].eps ;
          }
        }
    }

    else if(this.selectedParameter.value == "pe")
    {
        minimum  = tempStocks[0].pe ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(minimum > tempStocks[i].pe)
          {
            minimum = tempStocks[i].pe ;
          }
        }
    }

    else if(this.selectedParameter.value == "movingAverage")
    {
        minimum   = tempStocks[0].movingAverage ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(minimum > tempStocks[i].movingAverage)
          {
            minimum = tempStocks[i].movingAverage ;
          }
        }
    }

    minimumParameter = this.round(Math.round(minimum)) ;
    
    return minimumParameter ;
  }

  //Function: Finding maximum value of the selected parameter
  findMaximum(tempStocks: StocksRecommended[])
  {
    var maximumParameter : number = 0 ;
    var maximum : number = 0 ;
    if(this.selectedParameter.value == "growth")
    {
        maximum  = tempStocks[0].growth ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(maximum < tempStocks[i].growth)
          {
            maximum = tempStocks[i].growth ;
          }
        }
    }

    else if(this.selectedParameter.value == "volume")
    {
        maximum  = this.stocks[0].volume ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(maximum < tempStocks[i].volume)
          {
            maximum = tempStocks[i].volume ;
          }
        }

        maximum = maximum + 1000000 ;
    }

    else if(this.selectedParameter.value == "dividends")
    {
        maximum  = tempStocks[0].dividends ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(maximum < tempStocks[i].dividends)
          {
            maximum = tempStocks[i].dividends ;
          }
        }
    }

    else if(this.selectedParameter.value == "eps")
    {
        maximum  = tempStocks[0].eps ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(maximum < tempStocks[i].eps)
          {
            maximum = tempStocks[i].eps ;
          }
        }
    }

    else if(this.selectedParameter.value == "pe")
    {
        maximum  = tempStocks[0].pe ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(maximum < tempStocks[i].pe)
          {
            maximum = tempStocks[i].pe ;
          }
        }
    }

    else if(this.selectedParameter.value == "movingAverage")
    {
        maximum  = tempStocks[0].movingAverage ;
        for(let i = 0 ;i < tempStocks.length ; ++i)
        {
          if(maximum <  tempStocks[i].movingAverage)
          {
            maximum = tempStocks[i].movingAverage ;
          }
        }
    }
  
    maximumParameter = this.round(Math.round(maximum)) ;
  
    return maximumParameter ;
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

      if(this.selectedParameter.value == "growth" && this.tradeType == "BUY")
      {
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
            
            }
          ];
      }

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
     
      this.barGraphGradientsNumbersType = 'bar';
  }

}
