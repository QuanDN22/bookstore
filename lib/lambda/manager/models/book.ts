export interface Book {
  id: string;          // Unique identifier for the book (e.g., UUID)
  title: string;       // Title of the book
  author: string;      // Author(s) of the book
  isbn: string;        // ISBN of the book (unique for every book)
  publicationYear: number; // Year the book was published
  genre: string;       // Genre/category of the book (e.g., Fiction, Non-fiction)
  description?: string;   // A brief description or summary of the book (optional)
  createdAt: string;   // Timestamp when the book record was created
  updatedAt: string;   // Timestamp when the book record was last updated
}