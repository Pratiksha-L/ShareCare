import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MessageService} from 'primeng/api'
import { EncryptPasswordService } from '../services/encrypt-password.service';
import { LoginService } from '../services/login.service';
// ../../services/login.service

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userName: string = "";
  password: string = "";
  hasError: boolean = false;

  constructor(
    // private loginService: LoginService, 
    private messageService: MessageService,
    private router: Router, 
    private encrypt : EncryptPasswordService,
   private loginService:LoginService
   ) { }

  ngOnInit(): void {
    localStorage.setItem('SessionUser',this.userName) 

    var encrypted = this.encrypt.set('123456$#@$^@1ERF', this.password);
    var decrypted = this.encrypt.get('123456$#@$^@1ERF', encrypted);
   
    console.log('Encrypted :' + encrypted);
    console.log('Decrypted :' + decrypted);
  }


  login() {
    if (this.userName.length == 0 || this.password.length == 0) {
      this.hasError = true;
      return;
    } else {
      this.hasError = false;
      sessionStorage.setItem("isLoggedIn","true");
      this.router.navigate(["/dashboard"]);
    }
  }
  //let temp: User = {username : this.username, password : btoa(this.password.split('').reverse().join('')) } ;
    // this.loginService.checkLogin(temp).subscribe((result : User) =>
    //   {
    //     this.loginService.isValidUser = result ;

    //     if(result == null )
    //     {
    //       this.messageService.add({severity : 'error', summary : 'Error',detail : 'Incorrect Password '}) ;

    //     }
    //     else
    //     {
          
    //     sessionStorage.setItem("isLoggedIn", "true") ;
    // this.loginService.loggedInUser = result;
    //       this.myRoute.navigate(['/dashboard'])
    //     }
    //   }, (err: any) =>{
    //     this.messageService.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })
    //   }
    
    // ) ;
}
