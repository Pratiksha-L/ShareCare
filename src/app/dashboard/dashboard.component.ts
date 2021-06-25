import { Component, OnInit } from '@angular/core';
import { PriceShockers } from '../model/price-shockers';
import {DashboardService} from '../services/dashboard.service' ;
import {MessageService} from 'primeng/api'
import { VolumeShockers } from '../model/volume-shockers';
import { TopGainer } from '../model/top-gainer';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit 
{
  //Top Gainer: Big Line Chart
  public topGainerChartType: string;
  public gradientStroke: { addColorStop: (arg0: number, arg1: string) => void; };
  public chartColor: string;
  public canvas : any;
  public ctx:any ;
  public gradientFill: { addColorStop: (arg0: number, arg1: string) => void; };
  public topGainerLineChartData:Array<any>;
  public topGainerLineChartOptions:any;
  public topGainerLineChartLabels:Array<any>;
  public topGainerLineChartColors:Array<any>
  public gradientChartOptionsConfiguration: any;
  public gradientChartOptionsConfigurationWithNumbersAndGrid: any;

  //Volume Shockers: Bar Graph
  public volumeShockersGradientsNumbersType: string;
  public volumeShockerGradientsNumbersData:Array<any>;
  public volumeShockersGradientsNumbersOptions:any;
  public volumeShockersGradientsNumbersLabels:Array<any>;
  public volumeShockersGradientsNumbersColors:Array<any>

  //Immutable Data
  pageTitle : string = "NSE Top Gainer: " ;
  cardSubTitle : string = "TRENDING" ;
  card1Title : string = "Price Shockers" ;
  card2Title : string = "Volume Shockers" ;
  priceShockerDefinition : string = "Price Shockers are those stocks that see a sudden spike in price." ;
  volumeShockerDefinition : string = "Volume Shockers are those stocks that see a sudden spike in volumes" ;
  topGainerDefinition : string = "A security that gains price or increases in price during the course of a single trading day is called a gainer." ;
  columnData = [
    {label : "Company Name"} ,
    {label : "Sector"} ,
    {label : "Current Price(Rs.)"},
    {label : "%Change"}
  ] ;                                                  //Table Column Header Data
  
  topGainer : String = "" ;                            //Top Gainer Company Name
  volumeShockers : VolumeShockers[] = [] ;             //Top 5 Volume Shockers
  priceShockers : PriceShockers[] = [] ;               //Top 5 Price Shockers
  messageService: MessageService ;                     //Message service from PrimeNG
  closingPriceList : Number[] = [] ;                   //11 days Closing Price of Top Gainer
  dateList : string[] = [] ;                           //Dates of last 11 days
  // volumeShockersBarGraphReady:boolean = false ;
  // topGainerLineChartReady:boolean = false ;

  constructor
  (
    private dashboardService : DashboardService
  ) { }

  ngOnInit() 
  {
    this.getTopGainer() ;
    this.getPriceShockers() ;
    this.getVolumeShockers() ;
  }

  //Error Handling: Price Shockers
  getPriceShockers()
  {
  this.dashboardService.getPriceShockers()
  .subscribe((result : PriceShockers[]) =>
    {
      if(result == null )
      {
        this.messageService.add({severity : 'error', summary : 'Error',detail : 'Incorrect Price Shocker'}) ;
      }
      else
      {
      this.priceShockers = [];
      let i=0;
        result.forEach(priceShocker  => 
        {
          if(i<5) {
          this.priceShockers.push({
          companyName: priceShocker.companyName.replace("Limited", "") , 
          sector: priceShocker.sector, 
          currentPrice : priceShocker.currentPrice, 
          percentageChange : priceShocker.percentageChange});
          } else {
          return;
        }
          i++; 
        }) ;
        
  //this.configureCharts();
      }
    },
    (err: any) =>
    {
      this.messageService.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })        
    })
  }

  //Error Handling: Volume Shockers
  getVolumeShockers()
  {
    this.dashboardService.getVolumeShockers()
    .subscribe((result : VolumeShockers[]) => 
    {
      if(result == null )
      {
        this.messageService.add({severity : 'error', summary : 'Error',detail : 'Incorrect Volume Shocker'}) ;
        this.messageService.add({severity : 'error', summary : 'Error',detail : 'Error in fetching volume shockers'}) ;
      }
      else
      {
        this.volumeShockers = [];
        let i=0;
        result.forEach(volumeShocker  => 
          {
            if(i<5) 
            {
              this.volumeShockers.push({
              companyName: volumeShocker.companyName.replace("Limited", "") , 
              sector: volumeShocker.sector, 
              volume: volumeShocker.volume, 
              });
            } 
            else 
            {
              return;
            }
            i++;
          }) ;
        this.configureVolumeShockersBarGraph() ;
      }
    },
    (err: any) =>
    {
      this.messageService.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })        
    })
  }

  //Error Handling: Top Gainer
  getTopGainer()
  {
    this.dashboardService.getTopGainer().subscribe((result : TopGainer[]) =>
    {
       
      if(result == null || result.length ==0)
      {
        this.messageService.add({severity : 'error', summary : 'Error',detail : 'Incorrect Top Gainer Stock Name'}) ;

      }
      else
      {
        this.closingPriceList = [] ;
        this.dateList = [] ;
        this.topGainer = result[0].symbol  ;
        result.forEach((day: TopGainer)  => {  
          this.closingPriceList.push(day.close); 
          let tempDate = new Date(day.date);
          let temp : string[] =  tempDate.toDateString().split(" ");
          let stockDate = temp[1]+ " " + temp[2];
          this.dateList.push(stockDate);  
        }); 
        this.configureTopGainerLineChart() ;
        //this.closePriceList = result.map(data => data.close);
       // this.dateList = result.map(data => data.date);
        console.log(this.dateList);
        console.log(this.closingPriceList);
      }

    
    }, 
    (err: any) =>
    {
      this.messageService.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })
    })

  }

  //Function: Volume Shockers Bar Graph Configuration
  configureVolumeShockersBarGraph()
  {
    //this.volumeShockersBarGraphReady = true ;
    this.canvas = document.getElementById("barChartSimpleGradientsNumbers");
    this.ctx = this.canvas.getContext("2d");

    this.gradientFill = this.ctx.createLinearGradient(20, 400, 100, 50);
    this.gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
    this.gradientFill.addColorStop(1, this.hexToRGB('#2CA8FF', 0.7));


    this.volumeShockerGradientsNumbersData = 
    [
      {
        label: "Volume",
        pointBorderWidth: 2,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 1,
        pointRadius: 4,
        fill: true,
        borderWidth: 1,
        data:this.volumeShockers.map(data => data.volume)
      }
    ];
    this.volumeShockersGradientsNumbersColors = 
    [
     {
       backgroundColor: this.gradientFill,
       borderColor: "#2CA8FF",
       pointBorderColor: "#FFF",
       pointBackgroundColor: "#2CA8FF",
     }
   ];
    console.log(this.volumeShockerGradientsNumbersData) ;

    this.volumeShockersGradientsNumbersLabels = this.volumeShockers.map(data => data.companyName);
    console.log(this.volumeShockersGradientsNumbersLabels);
    
    this.volumeShockersGradientsNumbersOptions = 
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
          display: true,
          ticks: 
          {
            display: true,
            maxRotation: -80
            //autoSkip: true,
            //autoSkipPadding: 30
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
          left: 10,
          right: 10,
          top: 15,
          bottom: 10
        }
      }
    }

    this.volumeShockersGradientsNumbersType = 'bar';
  }

  //Function: Top Gainer Line Chart Configuration
  configureTopGainerLineChart() 
  {
    //this.topGainerLineChartReady = true ;
    this.chartColor = "#FFFFFF";
    this.canvas = document.getElementById("bigDashboardChart");
    this.ctx = this.canvas.getContext("2d");

    this.gradientStroke = this.ctx.createLinearGradient(500, 0, 100, 0);
    this.gradientStroke.addColorStop(0, '#80b6f4');
    this.gradientStroke.addColorStop(1, this.chartColor);

    this.gradientFill = this.ctx.createLinearGradient(0, 200, 0, 50);
    this.gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
    this.gradientFill.addColorStop(1, "rgba(255, 255, 255, 0.28)");

    this.topGainerLineChartData = 
    [
        {
          label: "Close",
          pointBorderWidth: 1,
          pointHoverRadius: 7,
          pointHoverBorderWidth: 2,
          pointRadius: 5,
          fill: true,
          borderWidth: 2,
          data: this.closingPriceList 
          //[50, 150, 100, 190, 130, 90, 150, 160, 120, 140, 190, 95, 60, 110, 180, 220]

        }
    ];

    this.topGainerLineChartColors = 
    [
       {
         backgroundColor: this.gradientFill,
         borderColor: this.chartColor,
         pointBorderColor: this.chartColor,
         pointBackgroundColor: "#2c2c2c",
         pointHoverBackgroundColor: "#2c2c2c",
         pointHoverBorderColor: this.chartColor,
       }
    ];

    this.topGainerLineChartLabels = this.dateList;
    //  [
    //    "10 July","11 July", "12 July", "13 July", "14 July", "15 July", "16 July", "17 July", "18 July", "19 July", "20 July", "21 July", "22 July", "22 July", "23 July"
    //  ];

    this.topGainerLineChartOptions = 
    {
      layout: 
      {
        padding: 
        {
          left: 20,
          right: 20,
          top: 0,
          bottom: 0
        }
      },

      maintainAspectRatio: false,

      tooltips: 
      {
        backgroundColor: '#fff',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },

      legend: 
      {
          position: "bottom",
          fillStyle: "#FFF",
          display: false
      },

      scales: 
      {
          yAxes: 
          [{
              ticks: 
              {
                fontColor: "rgba(255,255,255,0.4)",
                fontStyle: "bold",
                beginAtZero: true,
                maxTicksLimit: 8,
                padding: 10

              },
              gridLines: 
              {
                drawTicks: true,
                drawBorder: false,
                display: true,
                color: "rgba(255,255,255,0.1)",
                zeroLineColor: "transparent"
              }

          }],

          xAxes: 
          [{
              gridLines: 
              {
                zeroLineColor: "transparent",
                display: false,

              },

              ticks: 
              {
                padding: 10,
                fontColor: "rgba(255,255,255,0.4)",
                fontStyle: "bold"
              }
          }]
      }
    };

    this.topGainerChartType = 'line';


    this.gradientChartOptionsConfiguration = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      tooltips: {
        bodySpacing: 4,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        xPadding: 10,
        yPadding: 10,
        caretPadding: 10
      },
      responsive: 1,
      scales: {
        yAxes: [{
          display: 0,
          ticks: {
            display: false
          },
          gridLines: {
            zeroLineColor: "transparent",
            drawTicks: false,
            display: false,
            drawBorder: false
          }
        }],
        xAxes: [{
          display: 0,
          ticks: {
            display: false
          },
          gridLines: {
            zeroLineColor: "transparent",
            drawTicks: false,
            display: false,
            drawBorder: false
          }
        }]
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 15,
          bottom: 15
        }
      }
    };

    this.gradientChartOptionsConfigurationWithNumbersAndGrid = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      tooltips: {
        bodySpacing: 4,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
        xPadding: 10,
        yPadding: 10,
        caretPadding: 10
      },
      responsive: true,
      scales: {
        yAxes: [{
          gridLines: {
            zeroLineColor: "transparent",
            drawBorder: false
          },
          ticks: {
              stepSize: 500
          }
        }],
        xAxes: [{
          display: 0,
          ticks: {
            display: false
          },
          gridLines: {
            zeroLineColor: "transparent",
            drawTicks: false,
            display: false,
            drawBorder: false
          }
        }]
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 15,
          bottom: 15
        }
      }
    };

  }

  //Event: Big Line Chart Clicked
  public chartClicked(e:any):void 
  {
    console.log("Chart is clicked ! ",e);
  }

  //Event: Big Line Chart Hovered
  public chartHovered(e:any):void 
  {
    console.log("Chart is hovered ! ",e);
  }

  //Event: Coverting Hexadecimal to RGB
  public hexToRGB(hex: string, alpha: string | number) 
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