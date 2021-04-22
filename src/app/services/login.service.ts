import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http' ;
import {User} from '../model/user' ;

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  serviceUrl = "" ;//Backend url

  isValidUser : boolean = false ;
  loggedInUser: User;

  constructor(private http:HttpClient) { }

  checkLogin(obj : User)
  {
    return this.http.post<boolean>(this.serviceUrl + "/login" ,obj ) 
  }
}