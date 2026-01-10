# ETHPAY - Setup Guide

## Quick Start

### 1. Backend Setup steps

1. **Navigate to backend directory:**
   ```bash
   cd Backend/ETHPAY
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Mac/Linux
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the server:**
   ```bash
   python manage.py runserver 8001
   ```
   
   Or on Windows, double-click `start_server.bat`

   The backend will run on: **http://127.0.0.1:8001**

### 2. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Frontend/ETHPAY
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
  npm run dev
  
   ```
   
   The frontend will run on: **http://localhost:5173** (or the port shown)

### 3. Access the Application

- **Homepage:** http://localhost:5173
- **Login:** http://localhost:5173/login
- **Register:** http://localhost:5173/register
- **Dashboard:** http://localhost:5173/dashboard (requires login)
- **Admin Panel:** http://127.0.0.1:8001/admin

## Troubleshooting Network Errors

### Error: "Cannot connect to server"

**Solutions:**

1. **Make sure the backend is running:**
   - Check that you see "Starting development server at http://127.0.0.1:8001" in your terminal
   - Try accessing http://127.0.0.1:8000 in your browser - you should see `{"message": "ETHPAY API is running"}`

2. **Check if the ports are correct:**
   - Backend: http://127.0.0.1:8001
   - Frontend: http://localhost:5173 (default Vite port)

3. **CORS Issues:**
   - The backend has CORS enabled for localhost:5173
   - If using a different port, update `Backend/ETHPAY/ETHPAY/settings.py`:
     ```python
     CORS_ALLOWED_ORIGINS = [
         "http://localhost:5173",
         "http://127.0.0.1:5173",
         # Add your port here
     ]
     ```

4. **Firewall/Antivirus:**
   - Temporarily disable firewall/antivirus to test
   - Make sure port 8000 is not blocked

5. **Check browser console:**
   - Open browser DevTools (F12)
   - Check the Console tab for detailed error messages
   - Check the Network tab to see if requests are being sent

### Common Issues

**Issue: "Module not found" errors**
- Make sure all dependencies are installed: `pip install -r requirements.txt` and `npm install`

**Issue: Database errors**
- Run migrations: `python manage.py migrate`

**Issue: Login not working**
- Check if user status is "active" (not "pending" or "suspended")
- For testing, users with "pending" status can now login

**Issue: CORS errors in browser console**
- Make sure `django-cors-headers` is installed and `CORS_ALLOW_ALL_ORIGINS = True` is set

## Testing the Application

1. **Register a new user:**
   - Go to http://localhost:5173/register
   - Fill in the form and submit
   - User will be created with status "pending" (can login for testing)

2. **Login:**
   - Go to http://localhost:5173/login
   - Use your registered email and password
   - Should redirect to dashboard

3. **Access Dashboard:**
   - After login, you'll see your role-based dashboard
   - Try making a payment or viewing transactions

## Need Help?

- Check the browser console (F12) for errors
- Check the backend terminal for Django errors
- Verify both servers are running
- Make sure all dependencies are installed



