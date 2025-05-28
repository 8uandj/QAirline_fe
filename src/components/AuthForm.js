import { useForm } from 'react-hook-form';

function AuthForm({ type, onSubmit }) {
    const { register, handleSubmit, formState: { errors } } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
            <div>
                <label className="block text-sm font-medium">Tên đăng nhập</label>
                <input
                    {...register('username', { required: 'Tên đăng nhập là bắt buộc' })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>
            {type === 'register' && (
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        {...register('email', { required: 'Email là bắt buộc', pattern: { value: /^\S+@\S+$/i, message: 'Email không hợp lệ' } })}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium">Mật khẩu</label>
                <input
                    type="password"
                    {...register('password', { required: 'Mật khẩu là bắt buộc', minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' } })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition w-full">
                {type === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
        </form>
    );
}

export default AuthForm;