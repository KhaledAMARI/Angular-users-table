import { Component, computed, DoCheck, effect, OnInit, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss'
})
export class UserTableComponent implements OnInit, DoCheck {
  users = signal<any[]>([]);
  currentPage = signal<number>(1); // Current page number
  itemsOptions: number[] = [10, 15, 20]; // Options for items per page
  itemsPerPage = signal<number>(10); // Default items per page
  sortColumn = signal<string>(""); // Column to sort by
  sortDirection = signal<'asc' | 'desc'> ('asc'); // Sort direction
  searchTerm = signal<string>("");

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    await this.fetchData();
  }

  ngDoCheck(): void {
      console.log('changes happened!');
      console.log("🚀 ~ UserTableComponent ~ sortBy ~ this.sortDirection:", this.sortDirection())
  }

  fetchData() {
    this.apiService.getData().subscribe(data => {
      this.users.set(data);
    });
  }

  deleteUser(user: any) {
    this.users.set(this.users().filter((u: any) => u.id !== user.id));
  };

  handleGlobalSearch(event: Event) {
    event.stopPropagation();
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.update(value => String(inputElement.value));
  }

  // Get the users() for the current page
  paginatedUsers = computed(() => {
    const startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage());
    const endIndex = computed(() => startIndex() + this.itemsPerPage());
    if (this.searchTerm()) {
      return this.users().filter(user => (
        user?.firstName?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user?.lastName?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user?.dob?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user?.email?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user?.address?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        String(user?.contactNumber)?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        String(user?.id)?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        String(user?.age)?.toLowerCase().includes(this.searchTerm().toLowerCase())
      )).slice(startIndex(), endIndex());
    }
    return this.users().slice(startIndex(), endIndex());
  });

  // Sort users() based on the selected column and direction
  // sortUsers(users(): any[]) {
  //   if (!this.sortColumn) return users(); // No sorting if no column is selected
  //   return users().sort((a, b) => {
  //     const aValue = a[this.sortColumn];
  //     const bValue = b[this.sortColumn];

  //     if (aValue < bValue) return this.sortDirection() === 'asc' ? -1 : 1;
  //     if (aValue > bValue) return this.sortDirection() === 'asc' ? 1 : -1;
  //     return 0;
  //   });
  // }

  // Change page
  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return; // Prevent out-of-bounds
    this.currentPage.set(page);
  }

  // Get total pages
  totalPages = computed(() => Math.ceil(this.users().length / this.itemsPerPage()));

  // Update items per page
  updateItemsPerPage(event: Event) {
    console.log("🚀 ~ UserTableComponent ~ updateItemsPerPage ~ event:", event)
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage.set(Number(selectElement.value));
    this.currentPage.set(1); // Reset to the first page when items per page changes
  }

  // Sort by column
  sortBy(column: string) {
    if (this.sortColumn() === column) {
      // If the same column is clicked, toggle the sort direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Set the new column and default to ascending
      this.sortColumn.set(column);
      // this.sortDirection.set('asc');
    }
  }
}
