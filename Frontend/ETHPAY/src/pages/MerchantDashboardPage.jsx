import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../service/authService";

function MerchantDashboardPage() {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        
        // Check if user is merchant
        if (currentUser.role !== 'merchant') {
            alert("Only merchants can access this dashboard");
            navigate("/dashboard");
            return;
        }
        
        setUser(currentUser);
        loadMerchantDashboard();
    }, [navigate]);

    const loadMerchantDashboard = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch('http://localhost:8001/api/bank/merchant/dashboard/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setDashboard(data);
            } else {
                console.error("Failed to load dashboard:", response.status);
            }
        } catch (error) {
            console.error("Error loading merchant dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // Build simple sparkline for recent credits
    const sparklinePoints = (() => {
        if (!dashboard?.recent_transactions) return [];
        const amounts = dashboard.recent_transactions
            .slice(0, 12)
            .map((tx) => parseFloat(tx.amount))
            .reverse();
        const max = Math.max(...amounts, 1);
        const stepX = amounts.length > 1 ? 120 / (amounts.length - 1) : 120;
        return amounts.map((amt, idx) => ({
            x: idx * stepX,
            y: 40 - (amt / max) * 35
        }));
    })();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading merchant dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Merchant Dashboard</h1>
                        <p className="text-sm text-gray-600">
                            Welcome, {user?.fullName} ({user?.email})
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {dashboard ? (
                    <>
                        {/* Account Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-gray-500 text-sm font-medium">Current Balance</h3>
                                <p className="text-3xl font-bold mt-2">
                                    ETB {dashboard.account?.current_balance?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-gray-500 text-sm font-medium">Total Received</h3>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    ETB {dashboard.statistics?.total_received?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-gray-500 text-sm font-medium">Fees Paid (2%)</h3>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">
                                    ETB {dashboard.statistics?.total_fees?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-gray-500 text-sm font-medium">Net Income</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    ETB {dashboard.statistics?.net_income?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4">Account Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600">Account Number</p>
                                    <p className="font-semibold">{dashboard.account?.account_number || '200000001'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Account Holder</p>
                                    <p className="font-semibold">{dashboard.account?.account_holder_name || 'Demo Merchant Shop'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Bank Name</p>
                                    <p className="font-semibold">{dashboard.account?.bank_name || 'Demo Bank'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Total Transactions</p>
                                    <p className="font-semibold">{dashboard.statistics?.transaction_count || 0}</p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    Performance Snapshot
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">live</span>
                                </h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                    {sparklinePoints.length > 0 ? (
                                        <svg viewBox="0 0 120 40" className="w-full h-20 text-indigo-600">
                                            <polyline
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                points={sparklinePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                                            />
                                        </svg>
                                    ) : (
                                        <p className="text-sm text-gray-500">Transactions will appear here once payments start flowing.</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">Shows the last {sparklinePoints.length || 0} payments received.</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Recent Transactions</h2>
                                <button
                                    onClick={loadMerchantDashboard}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Refresh
                                </button>
                            </div>
                            
                            {dashboard.recent_transactions && dashboard.recent_transactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {dashboard.recent_transactions.map((transaction) => (
                                                <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {formatDate(transaction.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                            transaction.transaction_type === 'credit' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {transaction.transaction_type.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                                        {transaction.transaction_type === 'credit' ? '+' : '-'}
                                                        ETB {parseFloat(transaction.amount).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {transaction.description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        ETB {parseFloat(transaction.running_balance).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No transactions yet</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Transactions will appear here when customers make purchases
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Unable to load dashboard data</p>
                        <button
                            onClick={loadMerchantDashboard}
                            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default MerchantDashboardPage;