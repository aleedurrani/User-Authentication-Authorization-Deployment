import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [returnedPin, setReturnedPin] = useState("")
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (step === 1) {
      try {
        setSuccess('Wait for a few seconds...');
        const response = await fetch('http://localhost:3001/auth/verifyUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Email: email }),
        });
        if (response.ok) {
          setSuccess('A PIN has been sent to your email. Please check and enter it below.');
          const data = await response.json();
          setReturnedPin(data.pin)
          setStep(2);
        } else {

          if (response.status === 400) {
            setSuccess("")
            setError('Verification failed. Please SignUp');
          } else if (response.status === 401) {
            setSuccess("")
            setError('Error sending email. Please try again later.');
          }
        }
      } catch (err) {
        setSuccess("")
        setError('An error occurred. Please try again.');
      }
    } else if (step === 2) {
      
        const pinString = pin.join('');
        if (pinString === String(returnedPin)) {
            setStep(3)
        } else {
          setSuccess("")
          setError('PIN verification failed. Please try again.');
        }
      
    } else if (step === 3) {
      if (newPassword !== confirmPassword) {
        setSuccess("")
        setError('Passwords do not match.');
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/auth/updatePassword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Email: email, NewPassword: newPassword }),
        });
        if (response.ok) {
          setError("")
          setSuccess('Password updated successfully.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          const data = await response.json();
          setSuccess("")
          setError(data.message || 'Password update failed. Please try again.');
        }
      } catch (err) {
        setSuccess("")
        setError('An error occurred. Please try again.');
      }
    }
  };

  const handlePinChange = (index, value) => {
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 4) {
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex p-4 border-b justify-between items-center px-16">
        <a href="/login" className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100">Log in</a>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-center mb-6">
            {step === 1 ? 'Reset your password' : step === 2 ? 'Enter PIN' : 'Enter new password'}
          </h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div>
                <input
                  type="email"
                  placeholder="E-mail address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            )}

            {step === 2 && (
              <div className="flex justify-between">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    className="w-12 h-12 text-center border rounded"
                    required
                  />
                ))}
              </div>
            )}

            {step === 3 && (
              <>
                <div>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-500 text-white p-2 rounded font-semibold"
            >
              {step === 1 ? 'Send PIN' : step === 2 ? 'Verify PIN' : 'Reset password'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            If you have any trouble resetting your password,<br />
            contact us at <a href="mailto:hlthcrsystem@gmail.com" className="text-blue-600">hlthcrsystem@gmail.com</a>.
          </p>
        </div>
      </main>

   
    </div>
  );
};

export default PasswordReset;