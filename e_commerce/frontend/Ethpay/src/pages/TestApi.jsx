// import React, { useState } from 'react';
// import { testApi, registerUser, loginUser } from '../api.js';

// const TestApi = () => {
//     const [testResult, setTestResult] = useState('');
//     const [registerData, setRegisterData] = useState({
//         username: '',
//         email: '',
//         password: ''
//     });
//     const [loginData, setLoginData] = useState({
//         username: '',
//         password: ''
//     });

//     const handleTestApi = async () => {
//         const result = await testApi();
//         setTestResult(result ? '✅ API is working!' : '❌ API failed');
//     };

//     const handleRegister = async (e) => {
//         e.preventDefault();
//         console.log("Registering:", registerData);
//         const result = await registerUser(registerData);
//         console.log("Register result:", result);
//         alert(JSON.stringify(result, null, 2));
//     };

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         console.log("Logging in:", loginData);
//         const result = await loginUser(loginData);
//         console.log("Login result:", result);
//         alert(JSON.stringify(result, null, 2));
//     };

//     return (
//         <div className="max-w-4xl mx-auto p-8">
//             <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
            
//             <div className="mb-8">
//                 <button 
//                     onClick={handleTestApi}
//                     className="bg-blue-600 text-white px-6 py-2 rounded"
//                 >
//                     Test API Connection
//                 </button>
//                 <p className="mt-2">{testResult}</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {/* Registration Test */}
//                 <div className="border p-6 rounded-lg">
//                     <h2 className="text-xl font-bold mb-4">Test Registration</h2>
//                     <form onSubmit={handleRegister}>
//                         <div className="mb-4">
//                             <label className="block mb-1">Username *</label>
//                             <input
//                                 type="text"
//                                 value={registerData.username}
//                                 onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
//                                 className="w-full border p-2 rounded"
//                                 required
//                             />
//                         </div>
//                         <div className="mb-4">
//                             <label className="block mb-1">Email (optional)</label>
//                             <input
//                                 type="email"
//                                 value={registerData.email}
//                                 onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
//                                 className="w-full border p-2 rounded"
//                             />
//                         </div>
//                         <div className="mb-4">
//                             <label className="block mb-1">Password *</label>
//                             <input
//                                 type="password"
//                                 value={registerData.password}
//                                 onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
//                                 className="w-full border p-2 rounded"
//                                 required
//                             />
//                         </div>
//                         <button 
//                             type="submit"
//                             className="bg-green-600 text-white px-6 py-2 rounded"
//                         >
//                             Register Test User
//                         </button>
//                     </form>
//                 </div>

//                 {/* Login Test */}
//                 <div className="border p-6 rounded-lg">
//                     <h2 className="text-xl font-bold mb-4">Test Login</h2>
//                     <form onSubmit={handleLogin}>
//                         <div className="mb-4">
//                             <label className="block mb-1">Username</label>
//                             <input
//                                 type="text"
//                                 value={loginData.username}
//                                 onChange={(e) => setLoginData({...loginData, username: e.target.value})}
//                                 className="w-full border p-2 rounded"
//                                 required
//                             />
//                         </div>
//                         <div className="mb-4">
//                             <label className="block mb-1">Password</label>
//                             <input
//                                 type="password"
//                                 value={loginData.password}
//                                 onChange={(e) => setLoginData({...loginData, password: e.target.value})}
//                                 className="w-full border p-2 rounded"
//                                 required
//                             />
//                         </div>
//                         <button 
//                             type="submit"
//                             className="bg-blue-600 text-white px-6 py-2 rounded"
//                         >
//                             Login Test
//                         </button>
//                     </form>
//                 </div>
//             </div>

//             <div className="mt-8 p-4 bg-gray-100 rounded">
//                 <h3 className="font-bold mb-2">Debug Info:</h3>
//                 <p>Token in localStorage: {localStorage.getItem('token') ? 'Present' : 'None'}</p>
//                 <p>User ID: {localStorage.getItem('user_id') || 'None'}</p>
//                 <p>Username: {localStorage.getItem('username') || 'None'}</p>
//                 <p>Is Logged In: {localStorage.getItem('isLoggedIn') || 'false'}</p>
//             </div>
//         </div>
//     );
// };

// export default TestApi;