# Backend Documentation - Meal Planner Application

## Overview
The backend is built using **Node.js** with **Express.js** framework, **MongoDB** with **Mongoose** for database management, and **JWT** for authentication. The application follows MVC (Model-View-Controller) architecture with RESTful API design.

---

## 📁 Project Structure

### **Root Configuration Files**

#### `package.json`
- **Purpose**: Defines backend dependencies, scripts, and metadata
- **Key Dependencies**: 
  - Express.js (web framework)
  - Mongoose (MongoDB ODM)
  - jsonwebtoken (JWT authentication)
  - bcryptjs (password hashing)
  - cors (Cross-Origin Resource Sharing)
  - dotenv (environment variables)
  - body-parser (request parsing)
- **Scripts**: Start server, development mode, seed database

#### `server.js`
- **Purpose**: Main server entry point
- **Function**:
  - Initializes Express application
  - Connects to MongoDB database
  - Sets up middleware (CORS, body-parser, error handling)
  - Registers all API routes
  - Starts HTTP server
  - Handles server errors and graceful shutdown
  - Environment configuration (port, database URL)

---

## 📂 Models (`models/`)

Models define the database schema and structure using Mongoose.

### `User.js`
- **Purpose**: User model schema
- **Schema Fields**:
  - `name`: User's full name (String, required)
  - `email`: Email address (String, required, unique, lowercase)
  - `password`: Hashed password (String, required)
  - `age`: User's age (Number)
  - `phoneNumber`: Contact number (String)
  - `gender`: Gender (String: 'male', 'female', 'other')
  - `height`: Height in cm (Number)
  - `weight`: Weight in kg (Number)
  - `weightLevel`: BMI category (String: 'underweight', 'normal', 'overweight', 'obese')
  - `goal`: Health goal (String: 'lose', 'maintain', 'gain')
  - `activityLevel`: Activity level (String: 'no_activity', 'sedentary', 'light_moderate', 'moderate', 'active', 'athlete')
  - `dietaryRestrictions`: Array of dietary preferences (Array)
  - `macroRatio`: Object with protein, carbs, fats percentages (Object)
  - `createdAt`: Account creation timestamp (Date)
- **Methods**:
  - Password hashing before save
  - JWT token generation
  - Password comparison for authentication

### `Food.js`
- **Purpose**: Food item model schema
- **Schema Fields**:
  - `name`: Food name (String, required)
  - `category`: Food category (String: 'vegetables', 'fruits', 'grains', etc.)
  - `calories`: Calories per 100g (Number)
  - `protein`: Protein in grams (Number)
  - `carbs`: Carbohydrates in grams (Number)
  - `fat`: Fat in grams (Number)
  - `fiber`: Fiber in grams (Number)
  - `vitamins`: Object with vitamin content (Object)
  - `minerals`: Object with mineral content (Object)
  - `servingSize`: Default serving size (Object)
  - `image`: Food image URL (String)
  - `description`: Food description (String)
- **Indexes**: Name and category for faster searches

### `Meal.js`
- **Purpose**: Meal plan model schema
- **Schema Fields**:
  - `userId`: Reference to User (ObjectId, required)
  - `date`: Meal date (Date, required)
  - `meals`: Object containing:
    - `breakfast`: Array of breakfast items
    - `lunch`: Array of lunch items
    - `dinner`: Array of dinner items
    - `snacks`: Array of snack items
  - Each meal item contains:
    - `food`: Reference to Food or food object
    - `servingSize`: Custom serving size (Object)
    - `calories`: Calculated calories (Number)
    - `protein`, `carbs`, `fat`: Calculated macros (Number)
  - `totalCalories`: Total daily calories (Number)
  - `createdAt`: Creation timestamp (Date)
- **Indexes**: userId and date for efficient queries

### `Progress.js`
- **Purpose**: User progress tracking model schema
- **Schema Fields**:
  - `userId`: Reference to User (ObjectId, required)
  - `entries`: Array of progress entries, each containing:
    - `weight`: Weight in kg (Number)
    - `date`: Entry date (Date)
    - `measurements`: Object with:
      - `chest`, `waist`, `hips`, `arms`, `thighs`: Measurements in cm (Number)
    - `bodyFat`: Body fat percentage (Number)
  - `startingWeight`: Initial weight object (Object)
  - `goalWeight`: Target weight object (Object)
    - `weight`: Goal weight (Number)
    - `targetDate`: Target date (Date)
  - `goalProgress`: Calculated progress object (Object)
    - `percentage`: Progress percentage (Number)
    - `remaining`: Remaining weight to goal (Number)
  - `createdAt`: Creation timestamp (Date)
  - `updatedAt`: Last update timestamp (Date)
- **Methods**: Calculates goal progress automatically

---

## 📂 Controllers (`controllers/`)

Controllers handle business logic and request/response processing.

### `auth.js`
- **Purpose**: Authentication controller
- **Functions**:
  - `register`: User registration
    - Validates input data
    - Checks if email exists
    - Hashes password
    - Creates user in database
    - Generates JWT token
    - Returns user data and token
  - `login`: User login
    - Validates email and password
    - Finds user by email
    - Compares password
    - Generates JWT token
    - Returns user data and token
  - `getMe`: Get current user profile
    - Protected route
    - Returns authenticated user data
  - `updateProfile`: Update user profile
    - Validates input
    - Updates user information
    - Returns updated user data

### `users.js`
- **Purpose**: User management controller
- **Functions**:
  - `getUser`: Get user by ID
  - `updateUser`: Update user information
  - `deleteUser`: Delete user account
  - `getAllUsers`: Get all users (admin only)

### `foods.js`
- **Purpose**: Food database controller
- **Functions**:
  - `getFoods`: Get all foods with filtering
    - Search by name
    - Filter by category
    - Pagination support
    - Sorting options
  - `getFoodById`: Get single food item by ID
  - `createFood`: Create new food item (admin)
  - `updateFood`: Update food item (admin)
  - `deleteFood`: Delete food item (admin)
  - `searchFoods`: Advanced food search
    - Full-text search
    - Category filtering
    - Nutritional filtering (calories, macros)

### `meals.js`
- **Purpose**: Meal planning controller
- **Functions**:
  - `getMeals`: Get user's meal plans
    - Filter by date range
    - Group by date
    - Calculate totals
  - `getMealByDate`: Get meal plan for specific date
  - `createMeal`: Create new meal plan
    - Validates food items
    - Calculates nutritional values
    - Saves to database
  - `updateMeal`: Update existing meal plan
  - `deleteMeal`: Delete meal plan
  - `addFoodToMeal`: Add food item to specific meal
  - `removeFoodFromMeal`: Remove food item from meal

### `generate.js`
- **Purpose**: Meal plan generation controller
- **Functions**:
  - `generateMealPlan`: Generate automatic meal plan
    - Takes user goals, preferences, and constraints
    - Uses meal dataset (lose/maintain/gain weight)
    - Generates balanced meals for date range
    - Calculates nutritional totals
    - Ensures macro ratios are met
    - Returns generated meal plan
  - `generateRecommendations`: Get meal recommendations
    - Based on user history
    - Considers preferences and restrictions
    - Returns personalized recommendations

### `grocery.js`
- **Purpose**: Grocery list controller
- **Functions**:
  - `getGroceryList`: Get user's grocery list
    - Generates from meal plans
    - Groups by category
    - Calculates quantities
    - Filters by date range
  - `updateGroceryItem`: Update grocery item status
    - Mark as "have it" or "to buy"
    - Update quantities
  - `addCustomItem`: Add custom grocery item
  - `removeItem`: Remove item from list
  - `clearList`: Clear entire grocery list
  - `saveList`: Save grocery list for later
  - `getSavedLists`: Get saved grocery lists

### `progress.js`
- **Purpose**: Progress tracking controller
- **Functions**:
  - `getProgress`: Get user's progress data
    - Returns all entries
    - Calculates statistics
    - Returns goal progress
  - `addProgressEntry`: Add new progress entry
    - Validates weight and measurements
    - Calculates body fat if provided
    - Updates goal progress
    - Saves entry
  - `updateProgressGoal`: Update weight goal
    - Sets target weight
    - Sets target date
    - Recalculates progress
  - `deleteProgressEntry`: Delete progress entry
  - `getProgressStats`: Get progress statistics
    - Total change
    - Weekly average
    - Trend analysis
    - Consistency metrics

### `recommendations.js`
- **Purpose**: AI/ML recommendations controller
- **Functions**:
  - `getMealRecommendations`: Get personalized meal recommendations
    - Analyzes user goals
    - Considers dietary restrictions
    - Matches nutritional needs
    - Returns ranked recommendations
  - `getSimilarFoods`: Find similar foods
  - `getTrendingMeals`: Get trending meals

---

## 📂 Routes (`routes/`)

Routes define API endpoints and connect them to controllers.

### `auth.js`
- **Endpoints**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/me` - Get current user (protected)
  - `PUT /api/auth/update` - Update profile (protected)

### `users.js`
- **Endpoints**:
  - `GET /api/users/:id` - Get user by ID
  - `PUT /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user
  - `GET /api/users` - Get all users (admin)

### `foods.js`
- **Endpoints**:
  - `GET /api/foods` - Get all foods (with filters)
  - `GET /api/foods/:id` - Get food by ID
  - `POST /api/foods` - Create food (admin)
  - `PUT /api/foods/:id` - Update food (admin)
  - `DELETE /api/foods/:id` - Delete food (admin)
  - `GET /api/foods/search` - Search foods

### `meals.js`
- **Endpoints**:
  - `GET /api/meals` - Get user's meals (protected)
  - `GET /api/meals/:date` - Get meal by date (protected)
  - `POST /api/meals` - Create meal plan (protected)
  - `PUT /api/meals/:id` - Update meal plan (protected)
  - `DELETE /api/meals/:id` - Delete meal plan (protected)

### `grocery.js`
- **Endpoints**:
  - `GET /api/grocery` - Get grocery list (protected)
  - `PUT /api/grocery/item/:id` - Update grocery item (protected)
  - `POST /api/grocery/custom` - Add custom item (protected)
  - `DELETE /api/grocery/item/:id` - Remove item (protected)
  - `POST /api/grocery/save` - Save list (protected)
  - `GET /api/grocery/saved` - Get saved lists (protected)

### `progress.js`
- **Endpoints**:
  - `GET /api/progress` - Get progress data (protected)
  - `POST /api/progress/entry` - Add progress entry (protected)
  - `PUT /api/progress/goal` - Update goal (protected)
  - `DELETE /api/progress/entry/:id` - Delete entry (protected)
  - `GET /api/progress/stats` - Get statistics (protected)

---

## 📂 Middleware (`middleware/`)

### `auth.js`
- **Purpose**: Authentication middleware
- **Function**:
  - Verifies JWT token from request headers
  - Extracts user information from token
  - Attaches user to request object
  - Protects routes that require authentication
  - Returns 401 if token is invalid or missing

### `errorHandler.js`
- **Purpose**: Global error handling middleware
- **Function**:
  - Catches all errors in the application
  - Formats error responses
  - Handles different error types:
    - Validation errors (Mongoose)
    - Authentication errors
    - Database errors
    - Custom application errors
  - Returns appropriate HTTP status codes
  - Logs errors for debugging

---

## 📂 Utilities (`utils/`)

### `generateToken.js`
- **Purpose**: JWT token generation utility
- **Function**:
  - Generates JWT token with user ID
  - Sets expiration time (default: 30 days)
  - Signs token with secret key
  - Returns token string

### `errorResponse.js`
- **Purpose**: Error response formatting utility
- **Function**:
  - Formats error messages consistently
  - Handles Mongoose validation errors
  - Formats custom error messages
  - Returns standardized error response object

---

## 📂 Data (`data/`)

### `indian_meal_dataset_lose_full.json`
- **Purpose**: Meal dataset for weight loss goals
- **Content**: 
  - Comprehensive list of Indian meals
  - Nutritional information for each meal
  - Suitable for calorie deficit diets
  - Categorized by meal type

### `indian_meal_dataset_maintain_full.json`
- **Purpose**: Meal dataset for weight maintenance goals
- **Content**:
  - Balanced Indian meals
  - Maintenance calorie range
  - Nutritional information
  - Categorized by meal type

### `indian_meal_dataset_gain_full.json`
- **Purpose**: Meal dataset for weight gain goals
- **Content**:
  - High-calorie Indian meals
  - Suitable for muscle gain
  - Nutritional information
  - Categorized by meal type

---

## 📂 Scripts (`scripts/`)

### `seed.js`
- **Purpose**: Database seeding script
- **Function**:
  - Populates database with initial data
  - Seeds food items from datasets
  - Creates sample users (optional)
  - Can be run with: `node scripts/seed.js`

---

## 🔐 Security Features

### **Authentication**
- JWT (JSON Web Tokens) for stateless authentication
- Password hashing using bcryptjs
- Token expiration and refresh
- Protected routes with middleware

### **Data Validation**
- Input validation on all endpoints
- Mongoose schema validation
- Sanitization of user inputs
- Error handling for invalid data

### **CORS Configuration**
- Configured for frontend origin
- Prevents unauthorized cross-origin requests
- Secure headers

---

## 🗄️ Database Schema

### **Collections**

1. **users**: User accounts and profiles
2. **foods**: Food database with nutritional information
3. **meals**: Meal plans linked to users
4. **progress**: Progress tracking entries

### **Relationships**
- Users → Meals (One-to-Many)
- Users → Progress (One-to-Many)
- Meals → Foods (Many-to-Many via references)

---

## 🔄 API Flow

1. **Authentication Flow**:
   - User registers/logs in
   - Server validates credentials
   - JWT token generated
   - Token sent to client
   - Client includes token in subsequent requests

2. **Meal Planning Flow**:
   - User requests meal generation
   - Server analyzes user goals/preferences
   - Generates meal plan from dataset
   - Calculates nutritional values
   - Saves to database
   - Returns meal plan to client

3. **Grocery List Flow**:
   - User requests grocery list
   - Server fetches meal plans
   - Extracts food items
   - Groups by category
   - Calculates quantities
   - Returns organized list

4. **Progress Tracking Flow**:
   - User adds progress entry
   - Server validates data
   - Saves entry
   - Recalculates goal progress
   - Updates statistics
   - Returns updated progress

---

## 📊 Key Features

1. **RESTful API**: Standard HTTP methods and status codes
2. **Authentication**: Secure JWT-based authentication
3. **Meal Generation**: AI-powered meal plan generation
4. **Nutritional Calculation**: Automatic macro and calorie calculations
5. **Progress Tracking**: Weight and measurement tracking
6. **Data Management**: CRUD operations for all entities
7. **Error Handling**: Comprehensive error handling
8. **Validation**: Input validation and sanitization
9. **Scalability**: Modular architecture for easy scaling
10. **Database Optimization**: Indexed queries for performance

---

## 🚀 Deployment Considerations

- Environment variables for configuration
- MongoDB connection string
- JWT secret key
- Port configuration
- CORS origins
- Error logging
- Database backups

---

This backend provides a robust, secure, and scalable API for the meal planner application with comprehensive features for meal planning, nutrition tracking, and user management.

