import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http' ;
import {User} from '../model/user' ;

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  serviceUrl = "http://localhost:8080" ;
  isValidUser : boolean = false ;
  user: User;

  constructor(private http:HttpClient) { }

  checkLogin(obj : User)
  {
    console.log("checkLogin is called !") ;
    return this.http.post<User>(this.serviceUrl + "/userlogin/login" ,obj ) ;
  }

}