import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http' ;
import {User} from '../model/user' ;

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  serviceUrl = "" ;//http://localhost:8080
  isValidUser : boolean = false ;

  constructor(private http:HttpClient) { }

  checkLogin(obj : User)
  {
    return this.http.post<boolean>(this.serviceUrl + "/login" ,obj ) 
  }
}