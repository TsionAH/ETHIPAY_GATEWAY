import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getTransactions, getNotifications } from "../service/userService";
import { logout, getCurrentUser } from "../service/authService";
import PaymentForm from "../components/PaymentForm";
import TransactionList from "../components/TransactionList";

function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const [dashboardData, transactionsData, notificationsData] = await Promise.all([
        getDashboard(),
        getTransactions(),
        getNotifications(),
      ]);
      setDashboard(dashboardData);
      setTransactions(transactionsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const renderWidget = (widget) => {
    switch (widget.type) {
      case "statistics":
        return (
          <div key={widget.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">{widget.title}</h3>
            <p className="text-3xl font-bold text-indigo-600">-</p>
          </div>
        );
      case "balance":
        return (
          <div key={widget.id} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">{widget.title}</h3>
            <p className="text-3xl font-bold">0.00 ETB</p>
          </div>
        );
      case "quick_pay":
        return (
          <div key={widget.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <PaymentForm onSuccess={loadDashboardData} />
          </div>
        );
      case "recent_transactions":
      case "recent_payments":
        return (
          <div key={widget.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <TransactionList transactions={transactions.slice(0, 5)} />
          </div>
        );
      case "recent_activity":
        return (
          <div key={widget.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif.notificationID} className="text-sm text-gray-600">
                  {notif.message}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ETHPAY Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user.fullName} ({user.role})</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Widgets */}
        {dashboard && dashboard.widgets && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {dashboard.widgets.map((widget) => renderWidget(widget))}
          </div>
        )}

        {/* Transactions Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">All Transactions</h2>
          <TransactionList transactions={transactions} />
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
