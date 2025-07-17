import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthStatus, selectAuthError } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
    const dispatch = useDispatch();
    const authStatus = useSelector(selectAuthStatus);
    const authError = useSelector(selectAuthError);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const errorRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    useEffect(() => {
        if (authStatus === 'failed' && errorRef.current) {
            errorRef.current.focus();
        }
    }, [authStatus]);

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8">
            <section
                className="w-full max-w-md p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl shadow-black/30 bg-white/5 backdrop-blur-lg glassmorphism animate-fadeUp"
                style={{ willChange: 'transform, opacity' }}
            >
                <h1 className="text-center text-3xl font-bold text-white mb-6">Cashier Login</h1>
                <form onSubmit={handleSubmit} className="space-y-5" aria-label="Login Form">
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                                aria-required="true"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition duration-200"
                                aria-required="true"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {authStatus === 'failed' && (
                        <p
                            ref={errorRef}
                            role="alert"
                            tabIndex={-1}
                            className="text-red-400 text-sm text-center"
                        >
                            {authError}
                        </p>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={authStatus === 'loading'}
                        className="w-full py-3 text-white font-semibold bg-amber-500 hover:bg-amber-600 rounded-xl transition-transform transform hover:scale-[1.02] focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        aria-label="Login"
                    >
                        {authStatus === 'loading' ? (
                            <span className="flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Logging in...
                            </span>
                        ) : (
                            'Login'
                        )}
                    </Button>
                </form>
            </section>
        </main>
    );
};

export default LoginPage;
