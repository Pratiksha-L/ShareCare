import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http' ;
import { PriceShockers } from '../model/price-shockers';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http:HttpClient) { }

  serviceUrl:string = "http://localhost:8080" ;

  getPriceShockers()
  {
    console.log(" getPriceShockers : "+this.serviceUrl) ;
    return this.http.get(this.serviceUrl + "/dashboard/getPriceShockers") ;
  }

  getVolumeShockers()
  {
    console.log(" getVolumeShockers : "+this.serviceUrl) ;
    return this.http.get(this.serviceUrl + "/dashboard/getVolumeShockers") ;
  }

  getTopGainer()
  {
    console.log("getTopGainer : "+this.serviceUrl) ;
    return this.http.get(this.serviceUrl + "/dashboard/getTopGainer") ;
  }

  // getStockPriceOfTopGainer()
  // {
  //   console.log("getStockPriceOfTopGainer: "+this.serviceUrl) ;
  //   return this.http.get(this.serviceUrl + "/getStockPriceOfTopGainer") ;
  // }

  // getDatesOfTopGainer()
  // {
  //   console.log("getDatesOfTopGainer: "+this.serviceUrl) ;
  //   return this.http.get(this.serviceUrl + "/getDatesOfTopGainer") ;
  // }

}
