import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MessageService} from 'primeng/api'
import { LoginService } from '../services/login.service';
import { User } from '../model/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit 
{
  //Immutable Data
  pageTitle: string = "ShareCare" ;
  tagline: string = "You need profits, We know profits !" ;
  header: string = "Login" ;
  label1: string = "Username" ;
  label2: string = "Password" ;
  errorMessage: string = "*Username and Password are compulsary" ;
  
  userName: string = "" ;                     //Credentials: Username               
  password: string = "";                      //Credentials: Password
  firstName : string = "" ;                   //User's First Name
  lastName : string = "";                     //User's Last Name
  hasError: boolean = false;                  //Check if Username & Password are provided or not

  constructor
  (
    private loginService: LoginService, 
    private messageService: MessageService,
    private router: Router, 
    
   ) { }

  ngOnInit(): void 
  {
  }

  //Error Handling: Checking Login 
  checkLogin()
  {
    let temp: User = {userName : this.userName, firstName : this.firstName,lastName: this.lastName, password : btoa(this.password.split('').reverse().join('')) } ;

     this.loginService.checkLogin(temp).subscribe((result : User) =>
     {

        if(result == null )
        {
          this.messageService.add({severity : 'error', summary : 'Error',detail : 'Incorrect Password or Username'}) ;

        }
        else
        {
          sessionStorage.setItem("isLoggedIn", "true") ;
          sessionStorage.setItem("userName", this.userName) ;
          sessionStorage.setItem("user", JSON.stringify(result)) ;
          this.loginService.user = result;
          this.router.navigate(["/dashboard"]);
        }
      }, (err: any) =>
      {
        this.messageService.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })
      }
    
    ) ;
     
  }

  //Function: Validating Login
  validateLogin() 
  {
    //Checking if Username & Password are provided or not
    if (this.userName.length == 0 || this.password.length == 0) 
    {
      this.hasError = true;
      return;
    } 

    else 
    {
      this.hasError = false;
      this.checkLogin() ;
    }

    
  }
      
}

