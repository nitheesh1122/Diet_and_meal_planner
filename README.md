# Meal Planner

A comprehensive full-stack meal planning application designed to help users track their nutrition, plan meals, and achieve their health goals. The application features personalized meal recommendations based on user profiles, progress tracking, and automated grocery list generation.

## Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication system
- **Personalized Meal Planning**: AI-powered meal recommendations based on user goals (lose, maintain, gain weight)
- **Progress Tracking**: Monitor daily nutrition intake, weight, and macro goals
- **Grocery List Generation**: Automatically generate shopping lists from planned meals
- **Food Database**: Extensive Indian meal dataset with nutritional information
- **Dashboard Analytics**: Visual charts and KPIs for tracking progress
- **Recipe Management**: Browse and manage recipes

### User Profile Features
- BMI, BMR, and TDEE calculations
- Customizable macro ratios (protein, carbs, fats)
- Dietary preferences and restrictions
- Activity level tracking
- Goal-based calorie recommendations

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
    │   │   ├── Logo.jsx
    │   │   ├── MacroBar.jsx
    │   │   ├── MacroDonut.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NotificationBell.jsx
    │   │   ├── NotificationDrawer.jsx
    │   │   ├── RecommendationsDialog.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── TrendChart.jsx
    │   │   └── UpcomingTimeline.jsx
    │   ├── context/     # React Context providers
    │   │   ├── AuthContext.jsx
    │   │   ├── NotificationContext.jsx
    │   │   └── ThemeModeContext.jsx
    │   ├── pages/       # Page components
    │   │   ├── Dashboard.jsx
    │   │   ├── GroceryList.jsx
    │   │   ├── Login.jsx
    │   │   ├── Planner.jsx
    │   │   ├── Progress.jsx
    │   │   ├── Recipes.jsx
    │   │   ├── Settings.jsx
    │   │   └── Signup.jsx
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
- Weight progress over time
- Macro and calorie goal visualization
- Trend charts and analytics

### Grocery Lists
- Automatic generation from planned meals
- Organized by categories
- Export functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Indian meal datasets for providing comprehensive nutritional data
- Material-UI for the excellent component library
- All open-source contributors whose packages made this project possible

