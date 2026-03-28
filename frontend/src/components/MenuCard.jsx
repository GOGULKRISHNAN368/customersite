import React from 'react';

const MenuCard = ({ item, index, onAdd }) => {
  const { name, price, offer, offerPercent, imageUrl } = item;

  const discountPrice = offerPercent > 0 
    ? price - (price * offerPercent / 100) 
    : price;

  return (
    <div className="menu-card rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group transform hover:-translate-y-1">
      {/* Image container */}
      <div 
        className="relative h-48 w-full overflow-hidden cursor-pointer"
        onClick={() => onAdd(item)}
      >
        <img 
          src={imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Item Number Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm shadow-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800">
          #{index + 1}
        </div>

        {/* Offer Badge (if any) */}
        {offer && (
          <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            {offer}
          </div>
        )}
        
        {/* Dish Name */}
        <h3 className="absolute bottom-4 left-4 text-white text-lg font-bold tracking-tight z-10 w-3/4 truncate">
          {name}
        </h3>
      </div>

      {/* Content container */}
      <div className="p-4 flex justify-between items-center bg-white">
        <div className="flex flex-col">
          {offerPercent > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-accent">
                ₹{discountPrice.toFixed(0)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ₹{price}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-gray-800">
              ₹{price}
            </span>
          )}
        </div>
        
        {/* Add Button */}
        <button 
          onClick={() => onAdd(item)}
          className="h-8 w-8 rounded-full bg-gray-50 border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MenuCard;
