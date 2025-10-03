# 🍽️ Diet and Meal Planner

A comprehensive full-stack meal planning application that helps users create personalized diet plans, track nutritional goals, and discover healthy recipes based on their dietary preferences and requirements.

## ✨ Features

### Core Features
- **Personalized Meal Plans**: Generate customized meal plans based on dietary goals (weight gain, loss, maintenance)
- **Macro Tracking**: Monitor macronutrients (proteins, carbs, fats) and caloric intake
- **Recipe Discovery**: Search and browse through a vast collection of healthy recipes
- **Grocery List Generation**: Automatically generate shopping lists from meal plans
- **Progress Tracking**: Visual charts and analytics for nutritional progress
- **Food Database**: Extensive database of foods with nutritional information

### Advanced Features
- **Smart Recommendations**: AI-powered meal suggestions based on user preferences
- **Multi-Diet Support**: Vegetarian, Non-vegetarian, and regional cuisine options
- **Notification System**: Reminders for meal times and grocery updates
- **Theme Support**: Dark/Light mode for better user experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database for user data and food information
- **JWT** - Authentication and authorization
- **bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **Material-UI (MUI)** - Component library for styling
- **Context API** - State management
- **React Router** - Client-side routing
- **Chart.js** - Data visualization for progress tracking
- **Axios** - HTTP client for API calls

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nitheesh1122/Diet_and_meal_planner.git
   cd Diet_and_meal_planner/meal-planner
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

4. **Environment Setup**

   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mealplanner
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

5. **Seed the database** (optional)
   ```bash
   cd backend
   npm run seed
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
meal-planner/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── data/           # Food database and seed data
│   ├── middleware/     # Custom middleware
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context providers
│   │   └── theme.js    # Theme configuration
│   └── public/         # Static assets
└── README.md
```

## 🎯 Usage

1. **User Registration**: Create an account or login if you already have one
2. **Set Goals**: Define your dietary objectives (weight gain/loss/maintenance)
3. **Generate Plan**: Create a personalized meal plan based on your preferences
4. **Track Progress**: Monitor your nutritional intake and progress over time
5. **Discover Recipes**: Browse and search for new healthy recipes
6. **Manage Groceries**: Generate shopping lists from your meal plans

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Features in Detail

### Meal Plan Generation
- Supports different meal types (breakfast, lunch, dinner, snacks)
- Considers dietary restrictions and preferences
- Categorizes by calorie goals (gain/loss/maintenance)

### Food Database
- Comprehensive nutritional information
- Regional cuisine support (Indian, South Indian foods)
- Regular updates with new food items

### Analytics Dashboard
- Visual representation of macro and calorie intake
- Progress tracking over time
- Goal achievement metrics

## 🔧 API Endpoints

The backend provides RESTful APIs for:
- User authentication and management
- Meal plan generation and management
- Food search and recommendations
- Progress tracking
- Grocery list management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Contact the maintainers

## 🔄 Updates

The application is regularly updated with:
- New food items in the database
- Performance improvements
- Bug fixes
- New features based on user feedback

---

⭐ If you find this project helpful, please give it a star!
