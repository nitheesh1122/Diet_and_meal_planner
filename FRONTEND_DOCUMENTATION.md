# Frontend Documentation - Meal Planner Application

## Overview
The frontend is built using **React.js** with **Material-UI (MUI)** for UI components, **React Router DOM** for routing, and **Framer Motion** for animations. The application follows a component-based architecture with context API for state management.

---

## 📁 Project Structure

### **Root Configuration Files**

#### `package.json`
- **Purpose**: Defines project dependencies, scripts, and metadata
- **Key Dependencies**: React, React Router DOM, Material-UI, Framer Motion, Axios, jsPDF
- **Scripts**: Development server, build, preview commands

#### `vite.config.js`
- **Purpose**: Vite build tool configuration
- **Function**: Configures the development server, build options, and plugin settings for fast development

#### `index.html`
- **Purpose**: Main HTML entry point
- **Function**: Root HTML file that loads the React application

---

## 📂 Source Files (`src/`)

### **Entry Point**

#### `main.jsx`
- **Purpose**: Application entry point
- **Function**: 
  - Renders the root React component
  - Sets up BrowserRouter for routing
  - Wraps app with ThemeProvider, AuthProvider, and NotificationProvider
  - Initializes the React application

#### `index.css`
- **Purpose**: Global CSS styles
- **Function**: Base styles, resets, and global utility classes

#### `theme.js`
- **Purpose**: Material-UI theme configuration
- **Function**: 
  - Defines color palette (primary, secondary, success, error, etc.)
  - Configures typography settings
  - Sets component default styles
  - Manages light/dark theme support

---

## 📂 Context Providers (`context/`)

### `AuthContext.jsx`
- **Purpose**: Authentication state management
- **Function**:
  - Manages user login/logout state
  - Stores authentication token
  - Provides user information
  - Handles signup, login, and logout operations
  - Persists auth state in localStorage
- **Exports**: `AuthProvider`, `useAuth` hook

### `NotificationContext.jsx`
- **Purpose**: Notification and reminder system
- **Function**:
  - Manages in-app notifications
  - Schedules meal reminders (breakfast, lunch, dinner, snacks)
  - Handles grocery list reminders
  - Manages desktop notifications
  - Converts time zones (IST to local)
  - Tracks read/unread notification status
- **Exports**: `NotificationProvider`, `useNotifications` hook

### `ThemeModeContext.jsx`
- **Purpose**: Theme mode management (light/dark)
- **Function**:
  - Toggles between light and dark themes
  - Persists theme preference in localStorage
  - Provides theme mode to all components
- **Exports**: `ThemeModeProvider`, `useThemeMode` hook

---

## 📂 Pages (`pages/`)

### `Landing.jsx`
- **Purpose**: Landing page for new and returning users
- **Function**:
  - Displays hero section with app introduction
  - Shows features and benefits
  - Provides navigation to signup/login
  - Includes call-to-action buttons
  - Displays app logo and branding

### `Login.jsx`
- **Purpose**: User login page
- **Function**:
  - Email and password authentication form
  - Integrates LoadingSpinner during login
  - Handles form validation
  - Redirects to dashboard on success
  - Shows error messages for failed login

### `Signup.jsx`
- **Purpose**: New user registration page
- **Function**:
  - Comprehensive signup form with:
    - Personal information (name, email, password, age, phone)
    - Physical attributes (height, weight, gender)
    - Health goals (lose/maintain/gain weight)
    - Activity level selection
    - Dietary preferences
    - Macro ratio configuration
  - **Features**:
    - Password strength indicator (weak/moderate/strong)
    - Auto-calculates BMI and weight level
    - Auto-calculates macro ratios based on BMR, BMI, TDEE, and goals
    - Calculates BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure)
    - Shows Privacy/TOS acceptance modal after successful signup
  - Validates all fields before submission

### `Dashboard.jsx`
- **Purpose**: Main dashboard showing daily nutrition overview
- **Function**:
  - Displays daily calorie and macro targets
  - Shows current intake vs. targets
  - **Meal Completion Tracking**: Manual checkbox system to mark meals as completed
  - Calculates calories only from completed meals
  - **Meal Reminders**: Automatically schedules reminders for:
    - Breakfast: 9:00 AM
    - Morning Snacks: 11:00 AM
    - Lunch: 2:00 PM
    - Evening Snacks: 5:30 PM
    - Dinner: 8:00 PM
  - Hydration tracking card
  - Adherence score calculation
  - Meal completion cards with icons
  - Progress indicators and charts

### `Planner.jsx`
- **Purpose**: Meal planning interface
- **Function**:
  - Weekly meal calendar view
  - Add/remove meals for specific dates
  - Generate meal plans automatically
  - View planned meals by day
  - Drag-and-drop meal scheduling
  - Meal recommendations integration

### `Recipes.jsx`
- **Purpose**: Recipe browsing and meal planning
- **Function**:
  - Displays recipes organized by meal type (breakfast, lunch, dinner, snacks)
  - Search and filter recipes
  - **Prep Workload Calculation**: Shows preparation time breakdown:
    - Prep & chopping time
    - Cooking time
    - Plating & serving time
  - Filters prep workload based on selected meal type
  - Recipe details and nutritional information
  - Add recipes to meal plan

### `GroceryList.jsx`
- **Purpose**: Smart grocery list management
- **Function**:
  - Generates grocery list from planned meals
  - Organizes items by meal type (breakfast, lunch, dinner, snacks)
  - Category filtering within each meal type
  - Mark items as "have it" or "to buy"
  - Quantity and unit management
  - Custom item addition
  - Reminder settings for grocery items
  - Export to PDF/CSV
  - Saved lists functionality
  - Date navigation and filtering

### `Progress.jsx`
- **Purpose**: Weight and fitness progress tracking
- **Function**:
  - Weight entry and tracking
  - Body measurements (chest, waist, hips, arms, thighs)
  - Body fat percentage tracking
  - Progress charts and graphs (weight, measurements, body fat)
  - Goal setting and progress tracking
  - Weekly and monthly comparisons
  - Consistency tracking and streaks
  - Estimated completion date calculation
  - Time range filters (7 days, 30 days, 90 days, all time)

### `Settings.jsx`
- **Purpose**: User settings and profile management
- **Function**:
  - Edit user profile information
  - Update health goals and activity level
  - Modify macro ratio preferences
  - Change dietary restrictions
  - Update password
  - Notification preferences
  - Account management

### `PrivacyPolicy.jsx`
- **Purpose**: Privacy policy page
- **Function**:
  - Displays comprehensive privacy policy
  - Information about data collection and usage
  - User rights and data protection
  - Contact information for privacy concerns

### `TermsOfService.jsx`
- **Purpose**: Terms of service page
- **Function**:
  - Displays terms and conditions
  - User agreements and responsibilities
  - Service usage guidelines
  - Legal disclaimers

### `Contact.jsx`
- **Purpose**: Contact page
- **Function**:
  - Contact form for user inquiries
  - Company contact information
  - Email: support.mealplanner@gmail.com
  - FAQ section
  - Support information

---

## 📂 Components (`components/`)

### **Layout Components**

#### `App.jsx`
- **Purpose**: Main application component and router
- **Function**:
  - Sets up React Router with all routes
  - Manages sidebar visibility based on authentication
  - Handles page transitions with PageTransitionSpinner
  - Integrates Sidebar, Navbar, MacroBar, and Footer
  - Private route protection
  - Responsive layout management

#### `Sidebar.jsx`
- **Purpose**: Navigation sidebar
- **Function**:
  - Collapsible sidebar with expand/collapse functionality
  - Navigation menu items (Dashboard, Planner, Recipes, Grocery, Progress, Settings)
  - Logo display
  - SidebarNotifications integration
  - Logout functionality
  - Responsive design (mobile drawer, desktop permanent)
  - Active route highlighting

#### `Navbar.jsx`
- **Purpose**: Top navigation bar
- **Function**:
  - App title and branding
  - Notification bell icon
  - User menu
  - Mobile menu toggle
  - Responsive navigation

#### `Footer.jsx`
- **Purpose**: Footer for authenticated pages
- **Function**:
  - Links to Privacy Policy, Terms of Service, Contact
  - Copyright information
  - Social media links (if applicable)

#### `LandingFooter.jsx`
- **Purpose**: Footer for landing page
- **Function**:
  - Company information
  - Links to Privacy Policy, Terms of Service, Contact
  - Logo and branding
  - Designed for unauthenticated users

### **UI Components**

#### `Logo.jsx`
- **Purpose**: Application logo component
- **Function**:
  - Displays logo in different variants (full, icon)
  - Different sizes (small, medium, large)
  - Supports collapsed state for sidebar
  - Branding consistency

#### `LoadingSpinner.jsx`
- **Purpose**: Loading spinner with logo
- **Function**:
  - Shows during login/signup operations
  - Displays brand logo with animation
  - Circular progress indicator with percentage
  - Progressive blur effect on background
  - Used for authentication loading states

#### `PageTransitionSpinner.jsx`
- **Purpose**: Page transition loading spinner
- **Function**:
  - Shows when navigating between pages
  - Progress from 1% to 100%
  - Duration: 4-5 seconds (randomized)
  - Progressive blur effect
  - Logo animation
  - Prevents interaction during transition

#### `KpiCard.jsx`
- **Purpose**: Key Performance Indicator card
- **Function**:
  - Displays metrics in card format
  - Gradient backgrounds
  - Icon and value display
  - Used in dashboard for statistics

#### `MacroBar.jsx`
- **Purpose**: Macro nutrient progress bar
- **Function**:
  - Shows daily macro intake progress
  - Displays protein, carbs, and fats
  - Visual progress bars
  - Percentage indicators
  - Positioned at top of authenticated pages

#### `MacroDonut.jsx`
- **Purpose**: Macro nutrient donut chart
- **Function**:
  - Circular chart showing macro distribution
  - Visual representation of protein, carbs, fats
  - Percentage breakdown
  - Used in dashboard and meal planning

### **Feature Components**

#### `FoodSearchDialog.jsx`
- **Purpose**: Food search and selection dialog
- **Function**:
  - Search food items from database
  - Filter by categories
  - Add foods to meals
  - Nutritional information display
  - Quick add functionality

#### `FoodDetailDrawer.jsx`
- **Purpose**: Food item detail drawer
- **Function**:
  - Shows detailed nutritional information
  - Serving size options
  - Add to meal functionality
  - Nutritional breakdown (calories, macros, vitamins, minerals)

#### `GeneratePlanDialog.jsx`
- **Purpose**: Meal plan generation dialog
- **Function**:
  - Generate automatic meal plans
  - Select date range
  - Choose meal preferences
  - Generate based on user goals and preferences

#### `RecommendationsDialog.jsx`
- **Purpose**: Meal recommendations dialog
- **Function**:
  - AI-powered meal recommendations
  - Based on user goals, preferences, and history
  - Filter and sort recommendations
  - Add recommended meals to plan

### **Notification Components**

#### `NotificationBell.jsx`
- **Purpose**: Notification bell icon in navbar
- **Function**:
  - Badge showing unread count
  - Opens notification drawer on click
  - Visual indicator for new notifications

#### `NotificationDrawer.jsx`
- **Purpose**: Full notification drawer
- **Function**:
  - Displays all notifications
  - Mark as read functionality
  - Mark all as read button
  - Notification history
  - Filter by type
  - Slide-out drawer from right

#### `SidebarNotifications.jsx`
- **Purpose**: Notification panel in sidebar
- **Function**:
  - Compact notification display in sidebar
  - Shows recent notifications (up to 5)
  - Expandable/collapsible panel
  - Unread count badge
  - Mark all as read button
  - Quick access to notifications

### **Special Components**

#### `PrivacyTOSModal.jsx`
- **Purpose**: Privacy Policy and Terms of Service acceptance modal
- **Function**:
  - Shows after successful signup
  - Requires user to accept both Privacy Policy and Terms of Service
  - Checkboxes for each agreement
  - Links to full policy pages
  - Blurred background effect
  - Prevents navigation until accepted
  - "I understand and agree..." text for each

#### `TrendChart.jsx`
- **Purpose**: Trend visualization chart
- **Function**:
  - Displays trends over time
  - Used for weight, calorie, or macro trends
  - Line/area chart visualization
  - Time-based data display

#### `UpcomingTimeline.jsx`
- **Purpose**: Upcoming events timeline
- **Function**:
  - Shows upcoming meals or reminders
  - Timeline visualization
  - Date and time display
  - Quick action buttons

---

## 📂 Utilities (`utils/`)

### `api.js`
- **Purpose**: API communication utility
- **Function**:
  - Centralized API calls using Axios
  - Base URL configuration
  - Request/response interceptors
  - Authentication token handling
  - Error handling
  - API endpoints for:
    - Authentication (login, signup, logout)
    - User management
    - Meal planning
    - Food database
    - Grocery lists
    - Progress tracking
    - Recommendations

---

## 🎨 Design System

### **Color Palette**
- Primary: Purple gradient (#667eea to #764ba2)
- Success: Green for positive metrics
- Error: Red for warnings/errors
- Warning: Orange for cautions

### **Typography**
- Headings: Bold, various sizes
- Body: Regular weight, readable sizes
- Captions: Smaller, secondary information

### **Components Style**
- Cards: Elevated with shadows
- Buttons: Contained, outlined, text variants
- Forms: Material-UI TextField components
- Icons: Material-UI icon library

---

## 🔄 State Management

### **Context API**
- AuthContext: User authentication state
- NotificationContext: Notifications and reminders
- ThemeModeContext: Theme preferences

### **Local Storage**
- Authentication token
- User preferences
- Theme mode
- Notification settings
- Hydration data
- Meal completion state
- Grocery list state

---

## 📱 Responsive Design

- **Mobile**: Collapsible sidebar, stacked layouts
- **Tablet**: Adaptive grid systems
- **Desktop**: Full sidebar, multi-column layouts
- **Breakpoints**: Using Material-UI's useMediaQuery hook

---

## 🚀 Key Features

1. **Authentication**: Secure login/signup with JWT tokens
2. **Meal Planning**: Weekly meal calendar with recommendations
3. **Nutrition Tracking**: Real-time macro and calorie tracking
4. **Progress Monitoring**: Weight and body measurements tracking
5. **Smart Grocery Lists**: Auto-generated from meal plans
6. **Notifications**: In-app and desktop notifications for meals and groceries
7. **Responsive Design**: Works on all device sizes
8. **Theme Support**: Light and dark modes
9. **Data Visualization**: Charts and graphs for progress
10. **Export Functionality**: PDF/CSV export for grocery lists

---

## 📦 Dependencies

- **React**: UI library
- **React Router DOM**: Routing
- **Material-UI**: Component library
- **Framer Motion**: Animations
- **Axios**: HTTP client
- **jsPDF**: PDF generation
- **Recharts**: Chart library (for Progress page)

---

This frontend provides a complete, user-friendly interface for meal planning, nutrition tracking, and health goal management.

