import React from 'react';

const HomeCard = ({ title, description, image, price }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition duration-300">
      <img
        src={image || 'https://via.placeholder.com/400x300'}
        alt={title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      
      </div>
    </div>
  );
};

export default HomeCard;
