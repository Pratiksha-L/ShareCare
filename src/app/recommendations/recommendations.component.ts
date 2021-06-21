import {MessageService} from 'primeng/api'
import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import {RecommendationsService} from '../services/recommendations.service'
import { StocksRecommended } from '../model/stocksRecommended';
import { TabView } from 'primeng/tabview';
import { UserProfileService } from '../services/user-profile.service';
import { UserHistory } from '../model/userHistory';
import { User } from '../model/user';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
  
})

export class RecommendationsComponent implements OnInit 
{
  pageTitle : string = "Nifty Recommendations" ;
  dropdown1Title : string = "Sectors" ;
  dropdown2Title : string = "Parameters" ;
  parameters: SelectItem[] = [];                           //Finance Parameters for recommendation
  sectorList: SelectItem[] = [];                           //Sectors
  selectedParameter :  string = "Growth";             //Default selected parameter
  selectedSector : string = "Information Technology";             //Default selected sector
  messageService1: MessageService ;                   //Message service from PrimeNG
  columnData = 
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
      label : this.selectedParameter, 
      description : 'Growth rates are used to express the annual change in a variable as a percentage.'
    },
    {
      label : 'Change(%)', 
      description:''
    },
    {
      label : 'Market Cap.(Rs.cr)',
      description: 'Market Cap. is the total market value of all outstanding shares.'
    }
  ]
  selectedStockToSave : StocksRecommended ;           //Stocks saved sent to UserHistory
  savedQuantity: number = 0;                             //Saved Stock quantity
  displayDialogueBox: boolean = false;                //Display Dialogue Box to save selected stock
  user : User;
  
  stocks : StocksRecommended[] = [] ;                      //Sorted list of stocks according to user's selected parameter & sector
  transactionType : string = "BUY";                   //BUY or SELL
  stocksToBuy : StocksRecommended[] = [] ;                 //Recommended stocks to BUY
  stocksToSell : StocksRecommended[] = [];                //Recommended stocks to SELL
  hasError: boolean = false;                          //Error Check for get recommendatin
  showBUYTable : boolean = false;                         //Error Check for showing recommendation table 
  showSELLTable : boolean = false ;

  public gradientStroke;
  public chartColor;
  public canvas : any;
  public ctx;
  public gradientFill;
  public gradientChartOptionsConfiguration: any;
  public gradientChartOptionsConfigurationWithNumbersAndGrid: any;
  public lineChartGradientsNumbersType;
  public lineChartGradientsNumbersData:Array<any>;
  public lineChartGradientsNumbersOptions:any;
  public lineChartGradientsNumbersLabels:Array<any>;
  public lineChartGradientsNumbersColors:Array<any>
  

  constructor(private recommendationService: RecommendationsService, private messageService: MessageService,private userProfileService :UserProfileService  )
  { 
    this.sectorList = 
     [ 
       { label:"Automobile", value: "Automobile"},
       { label:"Banking", value: "Banking"},
       { label:"Cement", value: "Cement"},
       { label:"Energy", value: "Energy"},
       { label:"Information Technology", value: "Information Technology"}   
    ],

    this.parameters = 
     [ 
       { label:"Growth", value: "Growth"},
       { label:"Volume", value: "Volume"},
       { label:"Dividends", value: "Dividends"},
       { label:"P/E", value: "P/E"},
       { label: "EPS",value: "EPS"},
       { label:"Simple Moving Average", value: "Simple Moving Average"}   
    ];
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
  showDialogueBox() 
  {
    this.displayDialogueBox = true;
    console.log("Dialogue Box to input quantity of stocks to save is displayed !") ;
  }

  //Event: Handling Change in Transaction Type wrt Bar Graph
  @ViewChild(TabView) tabView: TabView;
  handleChange(e:any) 
  {
    console.log("Changing tab " , e) ;

    var index = e.index;
    this.transactionType = this.tabView.tabs[index].header ;

    console.log("Transaction Type Changed to "+this.transactionType) ;

    if(this.transactionType == "BUY")
    {
      this.showBUYTable = true ;
      this.lineChartGradientsNumbersData = [
        {
          label: this.selectedParameter,
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 1,
         data: [190, 99, 70, 96, 123]
 
        }
      ];

      this.lineChartGradientsNumbersColors = [
        {
          backgroundColor: this.gradientFill,
          borderColor: "#2CA8FF",
          pointBorderColor: "#FFF",
          pointBackgroundColor: "#2CA8FF",
        }
      ];
      this.lineChartGradientsNumbersLabels = ["Bal Pharma", "TCS", "Infosys", "Walmart", "MasterCard"];
   
    }

    else if(this.transactionType == "SELL")
    {
      this.showSELLTable = true ;
      this.lineChartGradientsNumbersData = [
        {
          label: this.selectedParameter ,
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 1,
         data: [120, 99, 100, 68, 193]
 
        }
      ];

      this.lineChartGradientsNumbersColors = [
      {
        backgroundColor: this.gradientFill,
        borderColor: "#2CA8FF",
        pointBorderColor: "#FFF",
        pointBackgroundColor: "#2CA8FF",
      }
    ];
      this.lineChartGradientsNumbersLabels = ["Bal Pharma", "TCS", "Infosys", "Walmart", "MasterCard"];
    
    }
  }

  //Event: Get recommendation button shows BUY/SELL recommendations
  public recommendationClick():void
  {

    console.log("Get Recommendation Button is Clicked !" ) ;

    //Check if sector & parameter are selected are not
    if (this.selectedSector.length == 0 || this.selectedParameter.length == 0) 
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
  public chartClicked(e:any):void 
  {
    console.log("Bar Graph is clicked !", e);
  }

  //Event: Bar Graph Hovered
  public chartHovered(e:any):void 
  {
    console.log("Bar Graph is hovered !" ,e);
  }

  
  //Event: Coverting Hexadecimal to RGB
  public hexToRGB(hex, alpha) 
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

  ngOnInit() :void
  { 
    //Sectors
    this.recommendationService.getSector()
    .subscribe((result : string[]) =>
    {
      if(result == null )
      {
        this.messageService1.add({severity : 'error', summary : 'Error',detail : 'Incorrect Sector'}) ;

      }

      else
      {
      result.forEach(sectorName  => 
        {

         this.sectorList.push({label: sectorName, value : result[0]});
       }), 
       (err: any) =>
       {
          this.messageService1.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })
      }

    }

  }, err => {
  })

    this.recommendationClick() ;  
    
    //Bar Graph
    this.canvas = document.getElementById("barChartSimpleGradientsNumbers");
    this.ctx = this.canvas.getContext("2d");

    this.gradientFill = this.ctx.createLinearGradient(20, 400, 100, 50);
    this.gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
    this.gradientFill.addColorStop(1, this.hexToRGB('#2CA8FF', 0.8));

    this.lineChartGradientsNumbersData = 
    [
        {
          label: "Growth", //this.selectedParameter
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 1,
          pointRadius: 4,
          fill: true,
          borderWidth: 1,
         data: [190, 99, 70, 96, 123]
 
        }
      ];

      this.lineChartGradientsNumbersColors = 
      [
        {
          backgroundColor: this.gradientFill,
          borderColor: "#2CA8FF",
          pointBorderColor: "#FFF",
          pointBackgroundColor: "#2CA8FF",
        }
      ];

      this.lineChartGradientsNumbersLabels = 
      [
        "Bal Pharma", "TCS", "Infosys", "Walmart", "MasterCard"
      ];
   
     this.lineChartGradientsNumbersOptions = 
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

     this.lineChartGradientsNumbersType = 'bar';

  }

  //Error Handling
  getRecommendation()
  {
    this.recommendationService.getRecommendation(this.selectedSector, this.selectedParameter).subscribe((result :StocksRecommended[]) =>
    {
      if(result == null )
      {
        this.messageService1.add({severity : 'error', summary : 'Error',detail : 'Incorrect Sector or Parameter'}) ;

      }
      else
      {
        this.stocks = [];
        result.forEach(stock  => 
          {

          this.stocks.push({
            companyName:stock.companyName.replace("Limited", ""), 
            currentPrice : stock.currentPrice,  
            percentageChange:stock.percentageChange, 
            marketCap:stock.marketCap/10000000, 
            volume: stock.volume ,
            eps: stock.eps,
            growth: stock.growth ,
            dividend : stock.dividend ,
            pe : stock.pe });
          
        }) ;
        
      this.buySellRecommendations() ;
      
      }
    
    },
    (err: any) =>
    {
      this.messageService1.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })        
    })

  }

  //Error Handling
  addSavedStocks()
  {
    let userHistory : UserHistory;
    userHistory.userName = this.user.userName ;
    userHistory.stockName = this.selectedStockToSave.companyName ;
    userHistory.sector = this.selectedSector ;
    userHistory.currentPrice = this.selectedStockToSave.currentPrice ;
    userHistory.quantity = this.savedQuantity ;
    userHistory.transactionType = this.transactionType ;

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

  buySellRecommendations()
  {
     // Stocks to SELL
    this.stocksToBuy = [];
    this.stocksToSell = [];
    console.log("Top 5 recommended stocks to BUY : ");
    for(let i = 0 ; i < 5 ; ++i )
    {
    //console.log(this.stocks);
      this.stocksToBuy[i] = this.stocks[i] ; 
      console.log(this.stocksToBuy[i].companyName);

    }
    console.log("Top 5 recommended stocks to SELL : ");
    for(let i = (this.stocks.length)-1, j=0 ; i >= (this.stocks.length - 5) ; --i,++j )
    {
      
      this.stocksToSell[j] = this.stocks[i] ; 
      console.log(this.stocksToSell[j].companyName);

    }
       
     //Stocks to BUY
      if(this.transactionType ==="BUY") 
       {
        this.handleChange({index :0})
      
         // this.showBUYTable = true ;
      }
  }

}
