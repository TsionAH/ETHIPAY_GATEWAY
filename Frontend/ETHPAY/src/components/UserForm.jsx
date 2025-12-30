import React, { useState } from 'react';
// This component is kept for backward compatibility but not actively used
// Registration is handled in RegisterPage.jsx

const UserForm = ({ user }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    companyName: user?.companyName || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) await updateUser(user.userId, formData);
    else await registerUser(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required />
      <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" />
      <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone" />
      <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      {!user && <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />}
      <button type="submit">{user ? 'Update' : 'Register'}</button>
    </form>
  );
};

export default UserForm;
