import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http' ;
import { StocksRecommended } from '../model/stocksRecommended';

@Injectable({
  providedIn: 'root'
})

export class RecommendationsService 
{
  constructor(private http:HttpClient) { }

  serviceUrl:string = "http://localhost:8080" ;

  getRecommendation(sector : string , selectedDropdownOption : string)
  {
    console.log("getRecommendation : " +this.serviceUrl) ;
    return this.http.get(this.serviceUrl + "/recommendation/getRecommendation?sector=" + sector+"&parameter=" + selectedDropdownOption ) ;
  }


}
