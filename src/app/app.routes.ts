import { Routes } from '@angular/router';
import { AddressSearchComponent } from './features/address-search/pages/address-search/address-search.component';

export const routes: Routes = [
	{
        path: '', 
        component: AddressSearchComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];
