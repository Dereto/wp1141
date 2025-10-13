# 📚 Digital Library Service

A modern Single-Page Application (SPA) built with React TypeScript that allows users to browse, select, and reserve books from a digital library.

## 🎯 Features

### Three-Stage User Journey

1. **📖 Browse Books** - Explore the library collection with advanced search and filtering
2. **📋 Build Reading List** - Select and organize books with personal notes and reading dates
3. **📝 Submit Reservations** - Complete the reservation process with contact information

### Key Functionality

- **Advanced Search & Filtering**: Search by title, author, or description with genre and status filters
- **Interactive Book Cards**: Hover effects, detailed information dialogs, and status indicators
- **Reading List Management**: Add/remove books, set reading dates, and add personal notes
- **Reservation System**: Multi-step form with contact information and confirmation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Data**: Automatically loads from CSV files in the public/data directory

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) with custom theming
- **Data Source**: CSV files (books.csv, accounts.csv)
- **Build Tool**: Create React App
- **Styling**: Emotion (CSS-in-JS)

## 📁 Project Structure

```
hw3/
├── src/
│   ├── components/          # React components
│   │   ├── BookBrowser.tsx      # Stage 1: Browse books
│   │   ├── ReadingList.tsx      # Stage 2: Manage reading list
│   │   └── ReservationSubmission.tsx # Stage 3: Submit reservations
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── dataLoader.ts        # CSV data loading
│   ├── App.tsx              # Main application component
│   ├── index.tsx            # Application entry point
│   └── index.css            # Global styles
├── public/
│   ├── data/                # CSV data files
│   │   ├── books.csv            # Book catalog with status info
│   │   └── accounts.csv         # User account data
│   ├── index.html           # HTML template
│   └── manifest.json        # PWA manifest
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd hw3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit `http://localhost:3000`

## 📊 Data Structure

### Books Dataset (books.csv)
Contains comprehensive book information including:
- Basic details (title, author, ISBN, genre, publication year)
- Library status (available, borrowed, reserved, out_of_order)
- Lending information (borrower, dates, reservations)
- Physical details (condition, location, pages, price)

### Accounts Dataset (accounts.csv)
Contains user account information including:
- Personal details (name, contact information)
- Membership information (type, dates, status)
- Library activity (borrowed books, fines, limits)

## 🎨 UI/UX Design Principles

### Stage 1: Browse Books
- **Search & Filter**: Easy-to-use search bar with genre and status filters
- **Visual Cards**: Book cards with hover effects and clear status indicators
- **Detailed View**: Modal dialogs for comprehensive book information
- **Status Awareness**: Clear visual indicators for book availability

### Stage 2: Reading List
- **Summary Dashboard**: Overview of selected books with statistics
- **Editable Items**: Modify reading dates and add personal notes
- **Flexible Management**: Easy add/remove functionality
- **Progress Tracking**: Visual feedback on reading list status

### Stage 3: Reservation Submission
- **Multi-step Process**: Clear progression through contact info and confirmation
- **Form Validation**: Real-time validation with helpful error messages
- **Review System**: Comprehensive review before final submission
- **Confirmation**: Clear success state with next steps

## 🔄 Data Flow

1. **Data Loading**: CSV files are parsed and loaded into React state
2. **Browse Stage**: Books are filtered and displayed based on user input
3. **Selection Stage**: Selected books are added to reading list state
4. **Submission Stage**: Reading list is converted to reservations
5. **Confirmation**: Final state shows successful submission

## 🎯 Key Features Explained

### Search & Filtering
- Real-time search across title, author, and description
- Genre-based filtering with dynamic options
- Status-based filtering (available, borrowed, reserved, out_of_order)
- Clear filter reset functionality

### Reading List Management
- Add books with one click (only available books)
- Edit reading dates and personal notes
- Remove books from the list
- View comprehensive statistics (total pages, reading time, value)

### Reservation System
- Multi-step form with validation
- Contact information collection
- Terms and conditions agreement
- Comprehensive review before submission
- Success confirmation with next steps

## 🚀 Future Enhancements

- User authentication and personal accounts
- Book recommendations based on reading history
- Integration with external book APIs
- Advanced analytics and reading statistics
- Mobile app version
- Social features (reviews, ratings, sharing)

## 📝 Notes

- The application is purely frontend and doesn't require a backend server
- Data is loaded from CSV files in the public/data directory
- All state management is handled within React components
- The design follows Material Design principles for consistency
- The application is fully responsive and works on all device sizes

## 🤝 Contributing

This is a homework project for educational purposes. Feel free to use it as a reference for building similar applications.

## 📄 License

This project is created for educational purposes as part of a university assignment.


