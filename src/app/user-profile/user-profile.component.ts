import { Component, OnInit } from '@angular/core';
import { User } from '../model/user';
import { UserHistory } from '../model/userHistory';
import {MessageService} from 'primeng/api';
import {UserProfileService} from '../services/user-profile.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})

export class UserProfileComponent implements OnInit {

  // Immutable Data
  user : User;
  userHistory : UserHistory[];
  imgUrl: string;
  pageTitle : string = "User Profile" ;
  showUserHistory: boolean = false;
  userName: string = "";
  lastName: string = "";
  firstName: string = "";

  constructor(
    private messageService : MessageService,
    private userProfileService :UserProfileService ,
    ) { }

   
  ngOnInit() 
  {
    this.user = JSON.parse(sessionStorage.getItem("user"));
    this.firstName = this.user.firstName;
    this.lastName = this.user.lastName;
    this.userName = sessionStorage.getItem("userName");
    this.imgUrl = "../assets/img/"+this.userName+".jpeg"; 
    this.getSavedStocks();
  }

  //Error Handling 
  getSavedStocks() 
  { 
    this.userProfileService.getSavedStocks(this.userName). 
    subscribe((result :UserHistory[]) => 
    { 
      if(result == null ) 
      { 
        this.messageService.add({severity : 'error', summary : 'Error',detail : 'Incorrect Saved Stocks Details'}) ;
      } 
      else 
      { 
        this.userHistory = []; 
        result.forEach(history => 
          { 
            this.userHistory.push({ 
              userName : history.userName , 
              currentPrice : history.currentPrice , 
              quantity : history.quantity , 
              sector : history.sector , 
              stockName : history.stockName, 
              tradeType : history.tradeType 
            }); 
          }) ; 
         
        }
        this.showUserHistory = true; 
      }, 
      (err: any) => 
      { 
        this.messageService.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down ' }) 
      }) 
    } 

  //Function: Displaying Buy in Green
  checkTradeTypeBUY(tradeType : String)
  {
      return tradeType === "BUY" ;
  }

  //Function: Displaying Hold in Blue
  checkTradeTypeHOLD(tradeType : String)
  {
      return tradeType === "HOLD" ;
  }

  //Function: Displaying Sell in Red
  checkTradeTypeSELL(tradeType : String)
  {
      return tradeType === "SELL" ;
  }
}