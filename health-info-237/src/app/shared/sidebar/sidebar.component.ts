import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FilterAdminPipe } from '../pipes/filter-admin.pipe';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, FilterAdminPipe]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() menuItems: any[] = [];
  @Input() activeRoute: string = '';
  @Input() user: any = null;
  @Input() showProfile = true;
  @Input() isMobile = false;
  @Input() isAdmin = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  trackByLabel(_: number, item: any) {
    return item.label;
  }
} 