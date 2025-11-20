# Meal Planner

A comprehensive full-stack meal planning application designed to help users track their nutrition, plan meals, and achieve their health goals. The application features personalized meal recommendations based on user profiles, progress tracking, and automated grocery list generation.

## Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication system with password strength indicator
- **Landing Page**: Beautiful landing page for new and returning users
- **Personalized Meal Planning**: AI-powered meal recommendations based on user goals (lose, maintain, gain weight)
- **Progress Tracking**: Comprehensive progress tracking page with weight, body measurements, and body fat tracking
- **Grocery List Generation**: Automatically generate shopping lists from planned meals, organized by meal type and categories
- **Food Database**: Extensive Indian meal dataset with nutritional information
- **Dashboard Analytics**: Visual charts and KPIs for tracking progress with meal completion tracking
- **Recipe Management**: Browse and manage recipes with prep workload calculations
- **Page Transitions**: Smooth page transitions with logo spinner (1-100% progress, 4-5 seconds)
- **Notifications System**: In-app notifications with meal reminders and grocery updates
- **PDF Export**: Professional PDF exports with user name, download timestamp, and formatted design

### User Profile Features
- **Auto-calculated Metrics**: BMI, BMR, and TDEE calculations automatically computed
- **Smart Macro Ratios**: Auto-calculated macro ratios based on BMR, BMI, TDEE, goals, and activity level (editable)
- **Weight Level Detection**: Automatic weight level classification (underweight/normal/overweight/obese) from BMI
- **Dietary Preferences**: Support for vegetarian, vegan, non-vegetarian, and no restrictions
- **Activity Level Tracking**: Six activity levels from sedentary to athlete
- **Goal-based Recommendations**: Personalized calorie and macro recommendations based on weight goals

### Advanced Features
- **Meal Reminders**: Automatic meal reminders at specific times:
  - Breakfast: 9:00 AM
  - Morning Snacks: 11:00 AM
  - Lunch: 2:00 PM
  - Evening Snacks: 5:30 PM
  - Dinner: 8:00 PM
- **Meal Completion Tracking**: Manual meal completion checkboxes that update calorie counts
- **Notification Panel**: Sidebar notification panel with unread count and quick actions
- **Privacy & Terms**: Privacy Policy and Terms of Service pages with acceptance modal for new users
- **Contact Page**: Contact form and company information
- **Progress Charts**: Multi-metric tracking with weight, body measurements, and body fat percentage charts
- **Grocery List Organization**: Grocery items organized by meal type with category filtering
- **Enhanced PDF Design**: Professional PDF exports with headers, footers, user information, and download timestamps

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Other**: CORS, Morgan (logging), dotenv

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v6
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **PDF Export**: jsPDF, html2canvas

## Project Structure

```
meal-planner/
├── backend/
│   ├── controllers/      # Business logic for routes
│   │   ├── auth.js
│   │   ├── foods.js
│   │   ├── generate.js
│   │   ├── grocery.js
│   │   ├── meals.js
│   │   ├── progress.js
│   │   ├── recommendations.js
│   │   └── users.js
│   ├── data/            # Meal datasets
│   │   ├── indian_meal_dataset_gain_full.json
│   │   ├── indian_meal_dataset_lose_full.json
│   │   └── indian_meal_dataset_maintain_full.json
│   ├── middleware/      # Express middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/          # MongoDB schemas
│   │   ├── Food.js
│   │   ├── Meal.js
│   │   ├── Progress.js
│   │   └── User.js
│   ├── routes/          # API route definitions
│   │   ├── auth.js
│   │   ├── foods.js
│   │   ├── grocery.js
│   │   ├── meals.js
│   │   ├── progress.js
│   │   └── users.js
│   ├── scripts/         # Utility scripts
│   │   └── seed.js
│   ├── utils/           # Helper functions
│   │   ├── errorResponse.js
│   │   └── generateToken.js
│   ├── server.js        # Express server entry point
│   └── package.json
│
└── frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── components/  # Reusable React components
    │   │   ├── FoodDetailDrawer.jsx
    │   │   ├── FoodSearchDialog.jsx
    │   │   ├── Footer.jsx
    │   │   ├── GeneratePlanDialog.jsx
    │   │   ├── KpiCard.jsx
    │   │   ├── LandingFooter.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── Logo.jsx
    │   │   ├── MacroBar.jsx
    │   │   ├── MacroDonut.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NotificationBell.jsx
    │   │   ├── NotificationDrawer.jsx
    │   │   ├── PageTransitionSpinner.jsx
    │   │   ├── PrivacyTOSModal.jsx
    │   │   ├── RecommendationsDialog.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── SidebarNotifications.jsx
    │   │   ├── TrendChart.jsx
    │   │   └── UpcomingTimeline.jsx
    │   ├── context/     # React Context providers
    │   │   ├── AuthContext.jsx
    │   │   ├── NotificationContext.jsx
    │   │   └── ThemeModeContext.jsx
    │   ├── pages/       # Page components
    │   │   ├── Contact.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── GroceryList.jsx
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Planner.jsx
    │   │   ├── PrivacyPolicy.jsx
    │   │   ├── Progress.jsx
    │   │   ├── Recipes.jsx
    │   │   ├── Settings.jsx
    │   │   ├── Signup.jsx
    │   │   └── TermsOfService.jsx
    │   ├── utils/       # Utility functions
    │   │   └── api.js
    │   ├── App.jsx      # Main app component
    │   ├── main.jsx     # React entry point
    │   ├── index.css    # Global styles
    │   └── theme.js     # MUI theme configuration
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meal-planner
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. **Backend Environment Variables**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/meal-planner
   # Or for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/meal-planner
   
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=30d
   PORT=5000
   ```

2. **Frontend Environment Variables (Optional)**
   
   Create a `.env` file in the `frontend/` directory if you need to configure API endpoints:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB**
   - If using local MongoDB, ensure the service is running
   - If using MongoDB Atlas, ensure your connection string is correct

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev    # Development mode with nodemon
   # or
   npm start      # Production mode
   ```
   The backend server will run on `http://localhost:5000`

3. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or another port if 5173 is occupied)

4. **Seed the database (Optional)**
   ```bash
   cd backend
   npm run seed
   ```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```
The production build will be in the `frontend/dist/` directory.

**Backend:**
```bash
cd backend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Foods
- `GET /api/foods` - Get all foods (with search/filter)
- `GET /api/foods/:id` - Get food by ID
- `POST /api/foods` - Create new food entry

### Meals
- `GET /api/meals` - Get user's meals
- `POST /api/meals` - Create a meal
- `PUT /api/meals/:id` - Update a meal
- `DELETE /api/meals/:id` - Delete a meal

### Progress
- `GET /api/progress` - Get user's progress records
- `POST /api/progress` - Create progress entry
- `PUT /api/progress/:id` - Update progress entry

### Grocery
- `GET /api/grocery` - Get grocery list
- `POST /api/grocery/generate` - Generate grocery list from meals

## Development

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed the database with sample data

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features in Detail

### Meal Planning
- Generate personalized meal plans based on:
  - User's calorie and macro goals
  - Dietary preferences and restrictions
  - Activity level and weight goals
  - Indian cuisine focus

### Progress Tracking
- Daily nutrition intake tracking
- Weight progress over time with goal setting
- Body measurements tracking (chest, waist, hips, arms, thighs)
- Body fat percentage tracking
- Macro and calorie goal visualization
- Trend charts and analytics (7 days, 30 days, 90 days, all time)
- Weekly comparisons and consistency tracking
- Estimated completion date calculation
- Progress streaks and statistics

### Grocery Lists
- Automatic generation from planned meals
- Organized by meal type (breakfast, lunch, dinner, snacks)
- Category filtering within each meal type
- Mark items as "have it" or "to buy"
- Custom item addition
- Quantity and unit management
- Reminder settings for grocery items
- Export to PDF/CSV with professional formatting
- Saved lists functionality
- Date range navigation

### Notifications & Reminders
- In-app notification system
- Meal reminders at scheduled times
- Grocery list update notifications
- Desktop notification support
- Notification drawer with full history
- Sidebar notification panel
- Mark as read / Mark all as read functionality
- Unread count badges

### PDF Export Features
- Professional PDF design with headers and footers
- User name and download timestamp included
- Page numbers and app branding
- Color-coded sections
- Nutritional summaries
- Available for:
  - Grocery lists (day/week/range)
  - Meal plans (day/week/month)
  - Recipes (day/week/month)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Recent Updates

### Version 2.0 Features
- ✅ Landing page with hero section and features
- ✅ Progress tracking page with comprehensive analytics
- ✅ Page transition spinner with logo and progress indicator
- ✅ Privacy Policy and Terms of Service pages
- ✅ Privacy/TOS acceptance modal for new users
- ✅ Password strength indicator (weak/moderate/strong)
- ✅ Auto-calculated macro ratios based on BMR, BMI, TDEE, and goals
- ✅ Auto-calculated weight level from BMI
- ✅ Meal reminders at specific times
- ✅ Meal completion tracking with manual checkboxes
- ✅ Sidebar notification panel
- ✅ Enhanced grocery list design with meal type organization
- ✅ Professional PDF exports with user info and timestamps
- ✅ Improved UI/UX across all pages

## Acknowledgments

- Indian meal datasets for providing comprehensive nutritional data
- Material-UI for the excellent component library
- jsPDF for PDF generation capabilities
- Recharts for data visualization
- Framer Motion for smooth animations
- All open-source contributors whose packages made this project possible

