import { Component, OnInit } from '@angular/core';
import { User } from '../model/user';
import { UserHistory } from '../model/userHistory';
import {UserProfileService} from '../services/user-profile.service'
import { StocksRecommended } from '../model/stocksRecommended';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})

export class UserProfileComponent implements OnInit 
{
  
  user : User;
  userHistory : UserHistory[];
  imgUrl: string;
 
  constructor(private userProfileService :UserProfileService , private messageService: MessageService) { }

  ngOnInit() 
  {

    this.getSavedStocks() ;

    this.user = {
      userName : "mike",
      firstName: "Madhura",
      lastName: "Dongare",
      password: "abc"
    }
     this.imgUrl = "../assets/img/"+this.user.userName+".jpg";

    this.userHistory = [
      {
        userName: "Madhura",
        sector:"FMCG",
        stockName:"P&G",
        currentPrice: 100,
        quantity: 250,
        transactionType:"BUY"
      },
      {
      userName: "Pratiksha",
      sector:"FMCGAC",
      stockName:"T&C",
      currentPrice: 105,
      quantity: 550,
      transactionType:"BUY"
     }
    ]
  }

   
  
  //Error Handling
  getSavedStocks()
  {
    this.userProfileService.getSavedStocks().
    subscribe((result :UserHistory[]) =>
    {
      if(result == null )
      {
        this.messageService.add({severity : 'error', summary : 'Error',detail : 'Incorrect Sector or Parameter'}) ;

      }
      else
      {
        this.userHistory = [];
        result.forEach(history  => 
          {

          this.userHistory.push({
              userName : history.userName ,
              currentPrice : history.currentPrice ,
              quantity : history.quantity ,
              sector : history.sector ,
              stockName : history.stockName,
              transactionType : history.transactionType 
          });
          
        }) ;
      }
    
    },
    (err: any) =>
    {
      this.messageService.add({severity: 'error', summary : 'Error',detail : 'Unable to fetch data, server down '  })        
    })

  }


}
