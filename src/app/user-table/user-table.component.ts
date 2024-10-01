import { Component, computed, OnInit, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss'
})
export class UserTableComponent implements OnInit {
  users: any[] = [];
  currentPage: number = 1; // Current page number
  itemsOptions: number[] = [10, 15, 20]; // Options for items per page
  itemsPerPage = signal<number>(10); // Default items per page
  sortColumn: string = ''; // Column to sort by
  sortDirection: 'asc' | 'desc' = 'asc'; // Sort direction

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    await this.fetchData();
  console.log("🚀 ~ UserTableComponent ~ itemsPerPage:", this.itemsPerPage())

  }

  fetchData() {
    this.apiService.getData().subscribe(data => {
      this.users = data;
    });
  }

  // Get the users for the current page
  paginatedUsers() {
    const startIndex = computed(() => (this.currentPage - 1) * this.itemsPerPage());
    const endIndex = computed(() => startIndex() + this.itemsPerPage());//+
    return this.users.slice(startIndex(), endIndex());
  }

  // // Sort users based on the selected column and direction
  // sortUsers(users: any[]) {
  //   if (!this.sortColumn) return users; // No sorting if no column is selected
  //   return users.sort((a, b) => {
  //     const aValue = a[this.sortColumn];
  //     const bValue = b[this.sortColumn];

  //     if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
  //     if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
  //     return 0;
  //   });
  // }

  // Change page
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return; // Prevent out-of-bounds
    this.currentPage = page;
  }

  // Get total pages
  get totalPages() {
    return Math.ceil(this.users.length / this.itemsPerPage());
  }

  // Update items per page
  updateItemsPerPage(event: Event) {
    console.log("🚀 ~ UserTableComponent ~ updateItemsPerPage ~ event:", event)
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage.set(Number(selectElement.value));
    this.currentPage = 1; // Reset to the first page when items per page changes
  }

  // Sort by column
  sortBy(column: string) {
    if (this.sortColumn === column) {
      // If the same column is clicked, toggle the sort direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set the new column and default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }
}
