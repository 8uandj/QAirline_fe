import React from 'react';
import { motion } from 'framer-motion';

function SeatMap({ cabins, activeCabin, selectedSeats, onSeatClick, ticketClass, quantity }) {
  if (!cabins || cabins.length === 0) {
    return <p className="text-center text-gray-600">Không có ghế nào phù hợp.</p>;
  }

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const cabinVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className="space-y-6">
      {/* Tabs khoang */}
      <div className="flex justify-center gap-2 mb-6 overflow-x-auto px-4">
        {cabins.map((cabin, index) => (
          <motion.button
            key={cabin.id}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => activeCabin !== cabin.id && onSeatClick({ type: 'setActiveCabin', cabinId: cabin.id })}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors shadow-md ${
              activeCabin === cabin.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cabin.name}
          </motion.button>
        ))}
      </div>

      {/* Sơ đồ khoang */}
      {cabins.map((cabin) => (
        activeCabin === cabin.id && (
          <motion.div
            key={cabin.id}
            variants={cabinVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-r from-green-600 to-green-400 p-8 rounded-[300px] shadow-2xl border-6 border-gradient-to-r from-green-400 to-teal-400 overflow-x-auto mx-auto min-h-[400px]"
          >
            {/* Trang trí: Cửa sổ máy bay */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2">
              <div className="w-6 h-4 bg-white-400 rounded-full shadow-inner"></div>
              <div className="w-6 h-4 bg-white-400 rounded-full shadow-inner"></div>
            </div>
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <div className="w-6 h-4 bg-teal-400 rounded-full shadow-inner"></div>
              <div className="w-6 h-4 bg-teal-400 rounded-full shadow-inner"></div>
            </div>
            <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
              <div className="w-6 h-4 bg-teal-400 rounded-full shadow-inner"></div>
              <div className="w-6 h-4 bg-teal-400 rounded-full shadow-inner"></div>
            </div>
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              <div className="w-6 h-4 bg-teal-400 rounded-full shadow-inner"></div>
              <div className="w-6 h-4 bg-teal-400 rounded-full shadow-inner"></div>
            </div>
            {/* Logo placeholder */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <img src="/path/to/logo.png" alt="QAirline" className="h-6 opacity-50" />
            </div>

            <h3 className="text-xl font-semibold mb-6 text-white text-center">{cabin.name}</h3>
            <div className="flex items-stretch justify-center space-y-4 flex-col py-4">
              {ticketClass === 'first' ? (
                <div className="flex items-stretch space-y-8 flex-col">
                  <div className="flex flex-row items-center space-x-2">
                    {cabin.seats[0].map((_, colIndex) => (
                      <div key={colIndex} className="w-14 h-20 text-center text-white text-sm transform rotate-90">
                        {colIndex === 0 || colIndex === Math.floor(cabin.seats[0].length / 2) ? 'Hành lang' : ''}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-row items-center space-x-2">
                    {cabin.seats.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-14 h-14 flex items-center justify-center rounded-md text-sm font-semibold cursor-pointer transition-colors ${
                            row[0].is_booked
                              ? 'bg-red-500 text-white cursor-not-allowed'
                              : selectedSeats.includes(row[0].seat_number)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                          onClick={() => !row[0].is_booked && onSeatClick({ type: 'seat', seat: row[0] })}
                        >
                          {row[0].seat_number}
                        </motion.div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-row items-center space-x-2">
                    {cabin.seats[0].map((_, colIndex) => (
                      <div key={colIndex} className="w-14 h-20 text-center text-white text-sm transform rotate-90">
                        {colIndex === 0 || colIndex === Math.floor(cabin.seats[0].length / 2) ? 'Hành lang' : ''}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-stretch space-y-8 flex-col">
                  <div className="flex flex-row space-x-2">
                    {cabin.seats.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex flex-col space-y-2">
                        {row.slice(0, ticketClass === 'business' ? 1 : 2).map((seat) => (
                          <motion.div
                            key={seat.seat_number}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-14 h-14 flex items-center justify-center rounded-md text-sm font-semibold cursor-pointer transition-colors ${
                              seat.is_booked
                                ? 'bg-red-500 text-white cursor-not-allowed'
                                : selectedSeats.includes(seat.seat_number)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                            onClick={() => !seat.is_booked && onSeatClick({ type: 'seat', seat })}
                          >
                            {seat.seat_number}
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-row items-center space-x-2">
                    {cabin.seats.map((_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="w-14 h-24 text-center text-white text-sm transform rotate-360"
                        style={{ visibility: rowIndex === 0 || rowIndex === Math.floor(cabin.seats.length / 2) || rowIndex === cabin.seats.length - 1 ? 'visible' : 'hidden' }}
                      >
                        Hành lang
                      </div>
                    ))}
                  </div>

{/* WC - Góc dưới cùng bên phải */}
<div className="absolute bottom-4 right-8">
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-800 text-xs font-semibold"
  >
    WC
  </motion.div>
</div>

{/* Cửa sang khoang khác - Giữa bên ngoài cùng bên phải */}
<div className="absolute top-1/2 right-4 transform -translate-y-1/2">
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="w-12 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-800 text-xs font-semibold"
  >
    NEXT
  </motion.div>
</div>

                  <div className="flex flex-row space-x-2">
                    {cabin.seats.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex flex-col space-y-2">
                        {row.slice(ticketClass === 'business' ? 1 : 2).map((seat) => (
                          <motion.div
                            key={seat.seat_number}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-14 h-14 flex items-center justify-center rounded-md text-sm font-semibold cursor-pointer transition-colors ${
                              seat.is_booked
                                ? 'bg-red-500 text-white cursor-not-allowed'
                                : selectedSeats.includes(seat.seat_number)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                            onClick={() => !seat.is_booked && onSeatClick({ type: 'seat', seat })}
                          >
                            {seat.seat_number}
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )
      ))}
    </div>
  );
}

export default SeatMap;