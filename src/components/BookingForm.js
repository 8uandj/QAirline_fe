import { useForm, Controller } from 'react-hook-form';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function BookingForm({ flight, locations, onSubmit }) {
    const { register, handleSubmit, control, formState: { errors } } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
            <div>
                <label className="block text-sm font-medium">Họ tên</label>
                <input
                    {...register('name', { required: 'Họ tên là bắt buộc' })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium">Điểm đi</label>
                <select
                    {...register('departure', { required: 'Điểm đi là bắt buộc' })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    defaultValue={flight.departure}
                >
                    <option value="">Chọn điểm đi</option>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                </select>
                {errors.departure && <p className="text-red-500 text-sm">{errors.departure.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium">Điểm đến</label>
                <select
                    {...register('destination', { required: 'Điểm đến là bắt buộc' })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    defaultValue={flight.destination}
                >
                    <option value="">Chọn điểm đến</option>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                </select>
                {errors.destination && <p className="text-red-500 text-sm">{errors.destination.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium">Ngày đi</label>
                <Controller
                    control={control}
                    name="travelDate"
                    rules={{ required: 'Ngày đi là bắt buộc' }}
                    render={({ field }) => (
                        <Flatpickr
                            value={field.value}
                            onChange={(date) => field.onChange(date[0])}
                            options={{ dateFormat: 'Y-m-d' }}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    )}
                />
                {errors.travelDate && <p className="text-red-500 text-sm">{errors.travelDate.message}</p>}
            </div>
            <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition w-full">
                Xác nhận đặt vé
            </button>
        </form>
    );
}

export default BookingForm;