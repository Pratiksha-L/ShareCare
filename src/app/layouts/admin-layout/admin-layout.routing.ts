import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { RecommendationsComponent } from '../../recommendations/recommendations.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent,  },
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'recommendation', component: RecommendationsComponent },
];
