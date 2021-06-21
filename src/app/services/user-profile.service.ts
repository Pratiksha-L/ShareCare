import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StocksRecommended } from '../model/stocksRecommended';
import { UserHistory } from '../model/userHistory';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private http:HttpClient) { }

  serviceUrl:string = "http://localhost:8080" ;

  addSavedStocks(savedCompanyDetails :UserHistory)
  {
    console.log("addSavedStocks : "+this.serviceUrl) ;
    return this.http.post(this.serviceUrl + "/userProfile/addSavedStocks" , savedCompanyDetails) ;
  }

  getSavedStocks()
  {
    console.log("getSavedStocks : "+this.serviceUrl) ;
    return this.http.get(this.serviceUrl + "/userProfile/getSavedStocks") ;
  }

}
