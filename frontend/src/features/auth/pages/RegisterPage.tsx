import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, UserPlus, Shield } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { USER_ROLES } from '../../../types';
import { registerSchema, type RegisterFormData } from '../auth.validation';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../../../store/authStore';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: USER_ROLES.SALES,
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);
      const response = await authApi.register(data);
      setAuth(response.user, response.accessToken);
      navigate('/');
    } catch (error: any) {
      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start managing your leads today
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{serverError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                label="First Name"
                placeholder="John"
                leftIcon={<UserIcon size={18} />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                id="lastName"
                label="Last Name"
                placeholder="Doe"
                leftIcon={<UserIcon size={18} />}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              leftIcon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Select
              id="role"
              label="Account Role (For Testing)"
              error={errors.role?.message}
              {...register('role')}
              options={[
                { value: USER_ROLES.SALES, label: 'Sales Representative' },
                { value: USER_ROLES.ADMIN, label: 'Administrator' },
              ]}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            size="lg"
          >
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
