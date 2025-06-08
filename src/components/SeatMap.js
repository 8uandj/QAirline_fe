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

  const getCabinStyles = (ticketClass) => {
    switch (ticketClass) {
      case 'first':
        return {
          background: 'linear-gradient(135deg, #fefcbf, #f6e05e)',
          seatSize: 'min(18vw, 10rem)', // Thu nhỏ trên mobile, giữ lớn trên desktop
          seatSpacing: 'clamp(0.5rem, 2vw, 1.5rem)', // Responsive spacing
          containerWidth: '70%',
        };
      case 'business':
        return {
          background: 'linear-gradient(135deg, #bee3f8, #4299e1)',
          seatSize: 'min(14vw, 8rem)',
          seatSpacing: 'clamp(0.5rem, 1.5vw, 1rem)',
          containerWidth: '90%',
        };
      case 'economy':
        return {
          background: 'linear-gradient(135deg, #c6f6d5, #48bb78)',
          seatSize: 'min(8vw, 5rem)',
          seatSpacing: 'clamp(0.25rem, 1vw, 0.75rem)',
          containerWidth: '90%',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #c6f6d5, #48bb78)',
          seatSize: 'min(6vw, 4rem)',
          seatSpacing: 'clamp(0.25rem, 0.75vw, 0.5rem)',
          containerWidth: '80%',
        };
    }
  };

  const cabinStyles = getCabinStyles(ticketClass);

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Tabs khoang */}
      <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 flex-wrap">
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
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition-colors shadow-md ${
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
            className="relative p-4 sm:p-6 rounded-[20px] sm:rounded-[40px] shadow-2xl mx-auto min-h-[250px] sm:min-h-[350px] border-2 sm:border-4 border-white w-full"
            style={{
              background: cabinStyles.background,
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)',
            }}
          >
            {/* Cửa sổ và chi tiết khoang */}
            <div className="absolute top-4 sm:top-6 left-2 sm:left-3 flex flex-col space-y-3 sm:space-y-6">
              <div className="w-5 h-2 sm:w-6 sm:h-3 bg-gray-300 rounded-full shadow-inner"></div>
              <div className="w-5 h-2 sm:w-6 sm:h-3 bg-gray-300 rounded-full shadow-inner"></div>
            </div>
            <div className="absolute top-4 sm:top-6 right-2 sm:right-3 flex flex-col space-y-3 sm:space-y-6">
              <div className="w-5 h-2 sm:w-6 sm:h-3 bg-gray-300 rounded-full shadow-inner"></div>
              <div className="w-5 h-2 sm:w-6 sm:h-3 bg-gray-300 rounded-full shadow-inner"></div>
            </div>
            <div className="absolute bottom-4 sm:bottom-6 left-2 sm:left-3 flex flex-col space-y-3 sm:space-y-6">
              <div className="w-5 h-2 sm:w-6 sm:h-3 bg-gray-300 rounded-full shadow-inner"></div>
              <div className="w-5 h-2 sm:w-6 sm:h-3 bg-gray-300 rounded-full shadow-inner"></div>
            </div>
            <div className="absolute bottom-4 sm:bottom-6 right-2 sm:right-3 flex flex-col space-y-3 sm:space-y-6">
              <div className="w-5 h-2 sm:w-6 sm:h-3 bg-gray-300 rounded-full shadow-inner"></div>
              <div className="w-5 h-2 sm:w-6 sm:h-3 bg-gray-300 rounded-full shadow-inner"></div>
            </div>

            <h3 className="text-base sm:text-2xl font-semibold mb-3 sm:mb-4 text-white text-center">{cabin.name}</h3>

            <div className="flex flex-col items-center justify-center py-3 sm:py-4">
              {cabin.seats.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-center space-x-8 sm:space-x-20 mb-3 sm:mb-4 flex-wrap gap-2 sm:gap-4">
                  {ticketClass === 'first' ? (
                    <>
                      {rowIndex === 0 || rowIndex === 2 || rowIndex === 4 ? (
                        <div className="w-12 sm:w-24 h-12 sm:h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
                          <span className="text-black text-sm sm:text-base font-semibold" style={{ transform: 'rotate(-90deg)', display: 'inline-block', padding: '2px' }}>LOBBY</span>
                        </div>
                      ) : (
                        <span className="w-12 sm:w-24" style={{ display: 'inline-block', padding: '2px' }}></span>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center justify-center rounded-lg text-lg sm:text-xl font-bold cursor-pointer transition-colors shadow-md ${
                          row[0].is_booked
                            ? 'bg-red-600 text-white cursor-not-allowed opacity-90'
                            : selectedSeats.includes(row[0].seat_number)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        onClick={() => !row[0].is_booked && onSeatClick({ type: 'seat', seat: row[0] })}
                        style={{
                          width: cabinStyles.seatSize,
                          height: cabinStyles.seatSize,
                        }}
                      >
                        {row[0].seat_number}
                      </motion.div>
                      {rowIndex === 0 || rowIndex === 2 || rowIndex === 4 ? (
                        <div className="w-12 sm:w-24 h-12 sm:h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
                          <span className="text-black text-sm sm:text-base font-semibold" style={{ transform: 'rotate(-90deg)', display: 'inline-block', padding: '2px' }}>LOBBY</span>
                        </div>
                      ) : (
                        <span className="w-12 sm:w-24" style={{ display: 'inline-block', padding: '2px' }}></span>
                      )}
                    </>
                  ) : ticketClass === 'business' ? (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center justify-center rounded-lg text-base sm:text-lg font-bold cursor-pointer transition-colors shadow-md ${
                          row[0].is_booked
                            ? 'bg-red-600 text-white cursor-not-allowed opacity-90'
                            : selectedSeats.includes(row[0].seat_number)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        onClick={() => !row[0].is_booked && onSeatClick({ type: 'seat', seat: row[0] })}
                        style={{
                          width: cabinStyles.seatSize,
                          height: cabinStyles.seatSize,
                        }}
                      >
                        {row[0].seat_number}
                      </motion.div>
                      {rowIndex === 0 || rowIndex === 2 || rowIndex === 4 ? (
                        <div className="w-12 sm:w-24 h-12 sm:h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
                          <span className="text-white text-sm sm:text-base font-semibold" style={{ transform: 'rotate(-90deg)', display: 'inline-block', padding: '2px' }}>LOBBY</span>
                        </div>
                      ) : (
                        <span className="w-12 sm:w-24" style={{ display: 'inline-block', padding: '2px' }}></span>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center justify-center rounded-lg text-base sm:text-lg font-bold cursor-pointer transition-colors shadow-md ${
                          row[1].is_booked
                            ? 'bg-red-600 text-white cursor-not-allowed opacity-90'
                            : selectedSeats.includes(row[1].seat_number)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        onClick={() => !row[1].is_booked && onSeatClick({ type: 'seat', seat: row[1] })}
                        style={{
                          width: cabinStyles.seatSize,
                          height: cabinStyles.seatSize,
                        }}
                      >
                        {row[1].seat_number}
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors shadow-md ${
                          row[0].is_booked
                            ? 'bg-red-600 text-white cursor-not-allowed opacity-90'
                            : selectedSeats.includes(row[0].seat_number)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        onClick={() => !row[0].is_booked && onSeatClick({ type: 'seat', seat: row[0] })}
                        style={{
                          width: cabinStyles.seatSize,
                          height: cabinStyles.seatSize,
                        }}
                      >
                        {row[0].seat_number}
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors shadow-md ${
                          row[1].is_booked
                            ? 'bg-red-600 text-white cursor-not-allowed opacity-90'
                            : selectedSeats.includes(row[1].seat_number)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        onClick={() => !row[1].is_booked && onSeatClick({ type: 'seat', seat: row[1] })}
                        style={{
                          width: cabinStyles.seatSize,
                          height: cabinStyles.seatSize,
                        }}
                      >
                        {row[1].seat_number}
                      </motion.div>
                      {rowIndex === 0 || rowIndex === 2 || rowIndex === 4 || rowIndex === 6 || rowIndex === 8 ? (
                        <div className="w-12 sm:w-24 h-12 sm:h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md">
                          <span className="text-white text-sm sm:text-base font-semibold" style={{ transform: 'rotate(-90deg)', display: 'inline-block', padding: '2px' }}>LOBBY</span>
                        </div>
                      ) : (
                        <span className="w-12 sm:w-24" style={{ display: 'inline-block', padding: '2px' }}></span>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors shadow-md ${
                          row[2].is_booked
                            ? 'bg-red-600 text-white cursor-not-allowed opacity-90'
                            : selectedSeats.includes(row[2].seat_number)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        onClick={() => !row[2].is_booked && onSeatClick({ type: 'seat', seat: row[2] })}
                        style={{
                          width: cabinStyles.seatSize,
                          height: cabinStyles.seatSize,
                        }}
                      >
                        {row[2].seat_number}
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors shadow-md ${
                          row[3].is_booked
                            ? 'bg-red-600 text-white cursor-not-allowed opacity-90'
                            : selectedSeats.includes(row[3].seat_number)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        onClick={() => !row[3].is_booked && onSeatClick({ type: 'seat', seat: row[3] })}
                        style={{
                          width: cabinStyles.seatSize,
                          height: cabinStyles.seatSize,
                        }}
                      >
                        {row[3].seat_number}
                      </motion.div>
                    </>
                  )}
                </div>
              ))}

              {/* WC và EXIT */}
              <div className="flex justify-between mt-3 sm:mt-4 w-full max-w-[90%] mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-800 text-xs font-semibold"
                >
                  WC
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-800 text-xs font-semibold"
                >
                  EXIT
                </motion.div>
              </div>
            </div>
          </motion.div>
        )
      ))}
    </div>
  );
}

export default SeatMap;