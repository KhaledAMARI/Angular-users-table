import { Component, computed, DoCheck, OnInit, signal } from '@angular/core'; // Add FormBuilder
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss'
})
export class UserTableComponent implements OnInit, DoCheck {
  users = signal<any[]>([]);
  currentPage = signal<number>(1); // Current page number
  itemsOptions: number[] = [10, 15, 20]; // Options for items per page
  itemsPerPage = signal<number>(10); // Default items per page
  sortColumn = signal<string>("id"); // Column to sort by
  sortDirection = signal<'asc' | 'desc'> ('asc'); // Sort direction
  searchTerm = signal<string>("");
  userForm: FormGroup; // Declare FormGroup
  tableHeaders: string[] = ['id', 'firstName', 'lastName', 'age', 'dob', 'email', 'salary', 'address', 'contactNumber'];

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.userForm = this.fb.group({ // Initialize FormGroup
      id: [''],
      firstName: [''],
      lastName: [''],
      age: [''],
      dob: [''],
      email: [''],
      salary: [''],
      address: [''],
      contactNumber: [''],
    });
  }

  async ngOnInit() {
    await this.fetchData();
  }

  ngDoCheck(): void {
      console.log('changes happened!');
      console.log(this.sortDirection());
      console.log(this.sortColumn());
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

  filterByGlobalSearch = (startIndex: number, endIndex: number) => {
      return this.users().filter(user => (
        user?.firstName?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user?.lastName?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user?.dob?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user?.email?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        user?.address?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        String(user?.contactNumber)?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        String(user?.id)?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        String(user?.age)?.toLowerCase().includes(this.searchTerm().toLowerCase())
      )).slice(startIndex, endIndex);
  }

    // Sort users() based on the selected column and direction
    sortTable = computed(() => {
      console.log("🚀 ~ UserTableComponent ~ sortTable:")
      return this.users().sort((a, b) => {
        const column = this.sortColumn(); // Get the current sort column
        const direction = this.sortDirection(); // Get the current sort direction
  
        if (a[column] < b[column]) {
          return direction === "asc" ? -1 : 1; // Ascending or descending
        }
        if (a[column] > b[column]) {
          return direction === "asc" ? 1 : -1; // Ascending or descending
        }
        return 0; // Equal values
      });
    })

  // Get the users() for the current page
  paginatedUsers = computed(() => {
    const startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage());
    const endIndex = computed(() => startIndex() + this.itemsPerPage());
    if (this.searchTerm()) {
      this.filterByGlobalSearch(startIndex(), endIndex());
    }
    if (this.sortColumn() && this.sortDirection()) {
      this.sortTable();
    }
    return this.users().slice(startIndex(), endIndex());

  });

  // Change page
  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return; // Prevent out-of-bounds
    this.currentPage.set(page);
  }

  // Get total pages
  totalPages = computed(() => Math.ceil(this.users().length / this.itemsPerPage()));

  // Update items per page
  updateItemsPerPage(event: Event) {
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

  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  submitForm() {
    const newUser = {
      id: Number(this.userForm.get('id')?.value),
      firstName: this.userForm.get('firstName')?.value,
      lastName: this.userForm.get('lastName')?.value,
      age: Number(this.userForm.get('age')?.value),
      dob: this.userForm.get('dob')?.value,
      email: this.userForm.get('email')?.value,
      salary: Number(this.userForm.get('salary')?.value),
      address: this.userForm.get('address')?.value,
      contactNumber: this.userForm.get('contactNumber')?.value,
      imageUrl: '',
    };
    console.log("🚀 ~ UserTableComponent ~ submitForm ~ newUser:", newUser)

    // Insert the new user at the first index
    this.users.set([newUser, ...this.users()]);

    // Close the modal after submission
    this.closeModal();
    this.userForm.reset();
  }

  handleSortDirectionChange = () => {
    this.sortDirection.update(value => value === "asc" ? "desc" : "asc");
  }

  handleSortColumnChange = (event: Event) => {
    const element = event.target as HTMLSelectElement;
    this.sortColumn.set(element.value);
  }
}


