// File: frontend/src/components/Auth/AuthComponents.js
import React, { useState, useEffect } from 'react';
import { AuthService } from '../../services/auth';
import firebase from 'firebase/app';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [authMethod, setAuthMethod] = useState('email'); // email, phone
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'normal',
      'callback': (response) => {
        // reCAPTCHA solved
      }
    });
  }, []);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      await AuthService.signInWithEmail(email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await AuthService.signInWithGoogle();
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePhoneSignIn = async () => {
    try {
      const id = await AuthService.signInWithPhone(phoneNumber);
      setVerificationId(id);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await AuthService.verifyPhoneCode(verificationId, verificationCode);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white border border-gray-300 py-2 px-4 rounded flex items-center justify-center hover:bg-gray-50"
        >
          <img src="/google-icon.png" alt="Google" className="w-6 h-6 mr-2" />
          Sign in with Google
        </button>
      </div>

      <div className="mb-4 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="px-3 text-gray-500">or</div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="mb-4">
        <select
          value={authMethod}
          onChange={(e) => setAuthMethod(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
        </select>
      </div>

      {authMethod === 'email' ? (
        <form onSubmit={handleEmailSignIn}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>
      ) : (
        <div>
          {!verificationId ? (
            <>
              <div className="mb-4">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div id="recaptcha-container" className="mb-4"></div>
              <button
                onClick={handlePhoneSignIn}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Send Code
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                onClick={handleVerifyCode}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Verify Code
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function UserProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await AuthService.getUserProfile(userId);
        const userActivities = await AuthService.getUserActivity(userId);
        setProfile(userProfile);
        setActivities(userActivities);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
      setLoading(false);
    };

    loadProfile();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center mb-6">
          <img
            src={profile.photoURL || '/default-avatar.png'}
            alt="Profile"
            className="w-20 h-20 rounded-full mr-4"
          />
          <div>
            <h2 className="text-2xl font-bold">{profile.displayName}</h2>
            <p className="text-gray-600">{profile.role}</p>
            {profile.isVerified && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{profile.nftsCreated}</div>
            <div className="text-gray-600">NFTs Created</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{profile.nftsPurchased}</div>
            <div className="text-gray-600">NFTs Purchased</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold">{profile.totalSales}</div>
            <div className="text-gray-600">Total Sales</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Activity History</h3>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="border-b pb-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{activity.type}</p>
                  <p className="text-gray-600">{activity.description}</p>
                </div>
                <div className="text-gray-500">
                  {new Date(activity.timestamp?.toDate()).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
