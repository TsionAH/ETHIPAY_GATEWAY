import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="max-w-7xl mx-auto text-center">
        &copy; {new Date().getFullYear()} ShopIt. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
