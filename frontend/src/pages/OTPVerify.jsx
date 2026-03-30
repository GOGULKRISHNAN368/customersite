import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, Loader2 } from 'lucide-react';

const OTPVerify = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("No email provided. Redirecting to login.");
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter a 6-digit OTP");
    
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });
      toast.success("OTP Verified Successfully!");
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.customer));
      
      // Redirect to dashboard with a full reload to update App state
      window.location.href = '/dashboard'; 
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResending(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="text-blue-600 size-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">OTP Verification</h1>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit code sent to <br />
            <span className="font-semibold text-gray-800">{email}</span>
          </p>

          {location.state?.devOtp && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-orange-700 text-sm font-bold flex items-center justify-center gap-2">
                <span role="img" aria-label="dev">🛠️</span> Dev Hint: Your OTP is {location.state.devOtp}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-3xl tracking-[1rem] font-bold py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-300 placeholder:tracking-normal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin size-5" /> : "Verify OTP"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={resendOTP}
              disabled={resending}
              className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;
