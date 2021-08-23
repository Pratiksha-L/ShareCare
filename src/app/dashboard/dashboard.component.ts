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
  closingPriceList : Number[] = [] ;                   //11 days Closing Price of Top Gainer
  dateList : string[] = [] ;                           //Dates of last 11 days
 
  minimumClosingPrice : number = 0 ;                  //Minimum closing price        
  maximumClosingPrice : number = 0 ;                  //Minimum closing price   
  minimumVolume : number = 0 ;                        //Minimum volume
  maximumVolume : number = 0 ;                        //Maximum closing price
  topGainerNotReady : boolean = true ;                //Check for progress spinner

  constructor
  (
    private dashboardService : DashboardService,
    private messageService: MessageService,
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

        this.findMinimumVolume() ;
        this.findMaximumVolume() ;
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
        result.forEach((day: TopGainer)  => {  
          this.closingPriceList.push(day.close); 
          let tempDate = new Date(day.date);
          let temp : string[] =  tempDate.toDateString().split(" ");
          let stockDate = temp[1]+ " " + temp[2];
          this.dateList.push(stockDate);  
        }); 
        this.topGainer = result[0].symbol.replace(".NS", "") ; 
        this.minimumClosingPrice = this.round(Math.round(Math.min.apply(null, this.closingPriceList))) ; 
        this.maximumClosingPrice = this.round(Math.round(Math.max.apply(null, this.closingPriceList))) ;
        this.configureTopGainerLineChart() ;
        this.topGainerNotReady = false;
        
      }

    
    }, 
    (err: any) =>
    {
      this.messageService.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })
    })

  }

  //Event: Big Line Chart Clicked
  public chartClicked(e:any):void 
  {
  }

  //Event: Big Line Chart Hovered
  public chartHovered(e:any):void 
  {
   
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

  //Function: Finding minimum volume
  findMinimumVolume()
  {
    var minimum : number = this.volumeShockers[0].volume ;
      for(let i = 1 ;i < this.volumeShockers.length ; ++i)
      {
        if(minimum > this.volumeShockers[i].volume)
        {
          minimum = this.volumeShockers[i].volume ;
        }
      }

    
    this.minimumVolume = this.round(Math.round(minimum)) ;
    
  }

  //Function: Finding maximum volume
  findMaximumVolume()
  {
    var maximum : number = this.volumeShockers[0].volume ;
      for(let i = 1 ;i < this.volumeShockers.length ; ++i)
      {
        if(maximum < this.volumeShockers[i].volume)
        {
          maximum = this.volumeShockers[i].volume ;
        }
      }

    
    this.maximumVolume = this.round(Math.round(maximum)) ;
    
  }

  //Function: Rounding the given number to nearest multiple of 100
  round(n : number)
  {
      // Smaller multiple
      console.log("n : ",n) ;
      let a = Math.floor(n/100) * 100 ; 
      console.log("a : ",a) ;
      // Larger multiple
      let b = a + 100;
      console.log("b" ,b) ;
      
      // Return of closest of two
      return (n - a > b - n)? b : a;
  }

  //Function: Top Gainer Line Chart Configuration
  configureTopGainerLineChart() 
  {
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
                padding: 10,
                stepSize : 80,
                min : this.minimumClosingPrice - 100,
                max : this.maximumClosingPrice + 100
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
                padding: 10 ,
                fontColor: "rgba(255,255,255,0.4)",
                fontStyle: "bold",
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
              stepSize: 1000
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
              stepSize: 20,
              min : this.minimumVolume - 10000000 ,
              max : this.maximumVolume + 10000000  ,
              maxTicksLimit : 6,
              letterSpacing: "0.2px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" ,
              fontColor: "black",
              lineHeight: "17px"
          }
        }],
        xAxes: [
          {
            ticks: {
              callback: function(label, index, labels) {
                if (/\s/.test(label)) {
                  return label.split(" ");
                }else{
                  return label;
                }              
              } ,
              letterSpacing: "0.2px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif" ,
              fontColor: "black",
              lineHeight: "17px"    
            },
            gridLines: 
            {
              zeroLineColor: "transparent",
              display: false,
              drawBorder: false
            },
            
          }
        ]
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

}