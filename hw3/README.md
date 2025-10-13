# 📚 Digital Library Service

A modern Single-Page Application (SPA) built with React TypeScript that allows users to browse, select, and reserve books from a digital library.

## 🎯 Features

### Three-Stage User Journey (Implicit)

1. **📖 Browse Books** - Explore the library collection with search and filters
2. **📋 Select Books** - Add/remove selections directly while browsing
3. **📝 Submit Reservations** - One consolidated flow (select → contact → review → success)

### Key Functionality

- **Advanced Search & Filtering**: Search by title, author, or description with genre and status filters
- **Interactive Book Cards**: Hover effects, detailed information dialogs, and status indicators
- **Selection Management**: Add/remove books directly from the browse view
- **Reservation System**: Consolidated multi-step form (selection/contact/review/success)
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
│   │   ├── BookBrowser.tsx      # Browse books and add/remove selections
│   │   └── ReservationSubmission.tsx # Consolidated selection/contact/review/success
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
- Physical details (condition, location, pages)

### Accounts Dataset (accounts.csv)
Contains user account information including:
- Personal details (name, contact information)
- Membership information (type, dates, status)
- Library activity (borrowed books, fines, limits)
 - Authentication fields (username, password)

## 🎨 UI/UX Design Principles

### Stage 1: Browse Books
- **Search & Filter**: Easy-to-use search bar with genre and status filters
- **Visual Cards**: Book cards with hover effects and clear status indicators
- **Detailed View**: Modal dialogs for comprehensive book information
- **Status Awareness**: Clear visual indicators for book availability

### Stage 2: Select Books (Implicit)
- **Direct Add/Remove**: Toggle selection on each book from the browse grid
- **Live Count**: Floating action button shows selection count
- **No Separate Page**: Selection happens implicitly before submission

### Stage 3: Reservation Submission
- **Multi-step Process**: Selection → Contact Info → Review → Success
- **Form Validation**: Real-time validation with helpful error messages
- **Review System**: Comprehensive review before final submission
- **Success Page**: Confirmation screen with “Back to Browsing”

## 🔄 Data Flow

1. **Data Loading**: CSV files are parsed and loaded into React state
2. **Browse Stage**: Books are filtered and displayed based on user input
3. **Selection Stage**: Selections are tracked in app state
4. **Submission Stage**: Selections are converted to reservations
5. **Success**: Confirmation screen; returning clears selections

## 🎯 Key Features Explained

### Search & Filtering
- Real-time search across title, author, and description
- Genre-based filtering with dynamic options
- Status-based filtering (available, borrowed, reserved, out_of_order)
- Clear filter reset functionality

### Selection Management
- Add/remove with one click (only available books)
- Optional notes and reading dates per selected item
- View selection summary and total pages in review

### Reservation System
- Multi-step form with validation
- Contact information collection
- Terms and conditions agreement
- Comprehensive review before submission
- Success confirmation with next steps and “Back to Browsing”

### Accounts & Login
- App starts as a guest by default (limited to 2 selections, no auto-fill)
- Optional login from the app bar to unlock account limits and auto-filled contact info
- Demo accounts provided in `public/data/accounts.csv` (username/password)

### Data Hot Reload
- Editing CSVs under `public/data` will refresh data without code changes

## 🧭 Project Overview (to be completed by author)

> Replace this placeholder with a high-level description of your project vision, audience, and key UX decisions. Suggested outline:
> - Problem statement and goals
> - Target users and use cases
> - Why a library reservation flow (and rationale for implicit stages)
> - How the datasets were modeled and why
> - Notable UX choices and trade-offs

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


