import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http' ;
import { StocksRecommended } from '../model/stocksRecommended';

@Injectable({
  providedIn: 'root'
})
export class RecommendationsService 
{
  constructor(private http:HttpClient) { }

  serviceUrl:string = "http://localhost:8080" ;//Backend url : http://localhost:8080

  getSector() 
  { 
     return this.http.get(this.serviceUrl + "/getSectors" ) ; 
  } 

  getRecommendation(sector : string , dropdownOption : string)
  {
    console.log("getRecommendation : " +this.serviceUrl) ;
    //return this.http.get(this.serviceUrl + "/recommendation/getRecommendation?sector=" + sector+"/" + dropdownOption ) ;
     return this.http.get(this.serviceUrl + "/recommendation/getRecommendation?sector=" + sector+"&parameter=" + dropdownOption ) ;
  }


}
