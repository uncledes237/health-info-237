import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterAdmin',
  standalone: true
})
export class FilterAdminPipe implements PipeTransform {

  transform(menuItems: any[], isAdmin: boolean): any[] {
    if (!menuItems) {
      return [];
    }
    return menuItems.filter(item => {
      // If the item is marked as adminOnly, show it only if the user is an admin
      if (item.adminOnly) {
        return isAdmin;
      }
      // Otherwise, show it to all users
      return true;
    });
  }

}
