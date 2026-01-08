# ETHPAY - Payment System Implementation

This is a full-stack payment system implementation based on the SRS (Software Requirements Specification). The system includes user management, authentication, payment processing, transactions, receipts, and role-based dashboards.

## Project Structure

```
SRS_implementation/
├── Backend/
│   └── ETHPAY/          # Django REST API
│       ├── api/         # Main API app
│       ├── user/        # User app (legacy)
│       ├── bank/        # Bank app (legacy)
│       └── ETHPAY/      # Django project settings
└── Frontend/
    └── ETHPAY/          # React + Vite frontend
        └── src/
            ├── components/
            ├── pages/
            └── service/
```

## Features Implemented

### Backend (Django REST API)

1. **User Management (CLASS 1)**
   - User registration with validation
   - User login with JWT authentication
   - Role-based access (Admin, Merchant, End User)
   - User status management (Pending, Active, Suspended)

2. **AuthenticationManager (CLASS 4)**
   - JWT token generation and verification
   - Password hashing using bcrypt
   - Token refresh mechanism
   - Logout with token blacklisting

3. **SessionManager (CLASS 7)**
   - Session creation and management
   - Session validation
   - Session termination

4. **Validator (CLASS 10)**
   - Email format validation
   - Full name validation
   - Password complexity validation
   - Payment amount validation
   - Transaction ID validation

5. **Dashboard (CLASS 13)**
   - Role-based dashboard generation
   - Widget management
   - Dashboard customization

6. **Payment (CLASS 16)**
   - Payment initiation
   - Payment processing
   - Payment cancellation
   - Payment status tracking

7. **ServiceFeeCalculator (CLASS 19)**
   - Fee calculation based on percentage
   - Minimum and maximum fee constraints
   - Fee rule management (Admin only)

8. **Transaction (CLASS 22)**
   - Transaction creation
   - Transaction status management
   - Total amount calculation

9. **Receipt (CLASS 25)**
   - Receipt generation
   - Receipt details retrieval
   - Multiple format support (PDF, JSON, Text)

10. **Notification (CLASS 28)**
    - Notification creation
    - Multiple notification types (SMS, Email, In-App)
    - Notification status tracking

11. **WalletIntegration (CLASS 31)**
    - Bank/Wallet API integration models
    - Connection status management
    - Provider management

12. **SystemLog (CLASS 34)**
    - System activity logging
    - Log filtering and retrieval
    - User action tracking

### Frontend (React + Vite)

1. **Authentication Pages**
   - Login page with form validation
   - Registration page with role selection
   - Protected routes

2. **Dashboard**
   - Role-based dashboard widgets
   - Real-time transaction display
   - Payment form integration

3. **Payment Components**
   - Payment form with fee calculation
   - Transaction list with filtering
   - Receipt viewing

4. **Services**
   - API service with token management
   - Authentication service
   - User service for API calls

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend/ETHPAY
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend/ETHPAY
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173/` (or the port shown in terminal)

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/profile/` - Get user profile
- `GET /api/auth/dashboard/` - Get user dashboard

### Payments
- `POST /api/payment/initiate/` - Initiate a payment
- `POST /api/payment/process/` - Process a payment
- `POST /api/payment/cancel/` - Cancel a payment
- `GET /api/payment/<payment_id>/` - Get payment details

### Transactions
- `GET /api/transactions/` - Get user transactions
- `GET /api/transaction/<transaction_id>/` - Get transaction details

### Receipts
- `GET /api/receipt/<receipt_id>/` - Get receipt details

### Notifications
- `GET /api/notifications/` - Get user notifications

### Service Fee
- `GET /api/fee/calculate/?amount=<amount>` - Calculate service fee
- `POST /api/fee/update/` - Update fee rules (Admin only)

## Database Models

All models are defined in `Backend/ETHPAY/api/models.py`:
- User
- Session
- Dashboard
- Payment
- Transaction
- Receipt
- Notification
- WalletIntegration
- SystemLog
- ServiceFeeCalculator

## Environment Variables

Create a `.env` file in `Backend/ETHPAY/` (optional, defaults to settings.py):
```
DJANGO_SECRET_KEY=your-secret-key-here
```

## Testing

To test the application:

1. Start the backend server
2. Start the frontend server
3. Navigate to the frontend URL
4. Register a new user
5. Login with your credentials
6. Access the dashboard and test payment functionality

## Notes

- User status defaults to "pending" on registration. In production, you would implement email verification to activate accounts.
- The payment processing is simplified. In production, integrate with actual payment gateways.
- The system uses JWT tokens for authentication. Tokens are stored in localStorage on the frontend.
- CORS is enabled for all origins in development. Restrict this in production.

## Technologies Used

**Backend:**
- Django 5.2.5
- Django REST Framework
- Simple JWT
- bcrypt
- SQLite (development database)

**Frontend:**
- React 19.2.0
- Vite 7.2.4
- React Router DOM
- Axios
- Tailwind CSS

## License

This project is for educational/demonstration purposes.



