import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';

const NavLink = ({ to, children }) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? 'text-yellow-300 font-semibold'
          : 'text-white hover:text-yellow-300 font-medium transition-colors'
      }
    >
      {children}
    </RouterNavLink>
  );
};

export default NavLink;
