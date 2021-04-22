import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecommendationsService {

  constructor() { }

  getSector() 
  {
    return Array<string>() ;
  } 

  getRecommendation(sector : string , dropdownOption : string)
  {

  }
}
