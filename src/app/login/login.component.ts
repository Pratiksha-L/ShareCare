import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MessageService} from 'primeng/api'
import { EncryptPasswordService } from '../services/encrypt-password.service';
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

  userName: string ;                      //Credentials: Username               
  password: string ;                      //Credentials: Password
  firstName : string ;                    //User's First Name
  lastName : string ;                     //User's Last Name
  hasError: boolean = false;              //Check if Username & Password are provided or not

  constructor
  (
    private loginService: LoginService, 
    private messageService: MessageService,
    private router: Router, 
    private encrypt : EncryptPasswordService,
   
   ) { }

  ngOnInit(): void 
  {
    localStorage.setItem('SessionUser',this.userName) 

    var encrypted = this.encrypt.set('123456$#@$^@1ERF', this.password);
    var decrypted = this.encrypt.get('123456$#@$^@1ERF', encrypted);
   
    console.log('Encrypted Password:' + encrypted);
    console.log('Decrypted Password :' + decrypted);
  }

  //Error Handling: Checking Login 
  checkLogin()
  {
    let temp: User = {userName : this.userName, firstName : this.firstName,lastName: this.lastName, password : btoa(this.password.split('').reverse().join('')) } ;

     this.loginService.checkLogin(temp).subscribe((result : boolean) =>
     {
        this.loginService.isValidUser = result ;

        if(result == null )
        {
          this.messageService.add({severity : 'error', summary : 'Error',detail : 'Incorrect Password '}) ;

        }
        else
        {
          sessionStorage.setItem("isLoggedIn", "true") ;
          //this.loginService.loggedInUser = result;
          this.router.navigate(['/dashboard']) ;
        }
      }, (err: any) =>
      {
        this.messageService.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })
      }
    
    ) ;
     
  }

  //Function: Login
  login() 
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
      sessionStorage.setItem("isLoggedIn","true");
      sessionStorage.setItem("userName", this.userName) ;
      this.router.navigate(["/dashboard"]);
    }

    console.log("Login Button is Clicked !" ) ;

  }
      
}

