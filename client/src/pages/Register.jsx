import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../layouts/AuthShell';
import Button from '../components/Button';
import Input from '../components/Input';
import { usePageTitle } from '../hooks/usePageTitle';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

// Registration page featuring store/supplier role toggle and verification notice
export default function Register() {
  usePageTitle('Register Account');
  const [role, setRole] = useState('store');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    licenseNumber: '',
    phone: '',
    city: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await register({
        ...formData,
        role,
      });
      setSubmittedSuccess(true);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell isSticky={true} formMaxWidth="max-w-[520px]" rightPadding="px-6 sm:px-10 py-12">
      {submittedSuccess ? (
        // Confirmation Screen on Successful Application
        <div className="text-center animate-fade-in py-4">
          <div className="w-12 h-12 rounded-full bg-status-safe-bg border border-[#BCE1C7] text-status-safe flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <span className="block text-[13px] font-sans font-medium text-ink-soft mb-1">Application received</span>
          <h2 className="font-display text-[32px] text-ink font-medium leading-tight mb-3">
            Request sent.
          </h2>

          <p className="text-[14px] text-ink-soft leading-relaxed mb-6 font-sans">
            An admin will verify your drug license (
            <span className="font-mono text-xs text-ink font-medium">
              {formData.licenseNumber}
            </span>
            ) before you can sign in to MediLink.
          </p>

          <div className="panel p-4 bg-paper/60 border border-line text-xs text-ink-soft mb-8 text-left space-y-1">
            <div className="flex items-center gap-2 text-ink font-medium">
              <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
              <span className="font-sans text-[13px]">Drug license compliance check</span>
            </div>
            <p className="text-[12px] text-ink-soft pl-6 leading-relaxed">
              As per Indian pharmacy regulations, wholesale trade and store accounts require valid 20B/20C/21B drug license credentials.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Back to sign in
          </Button>
        </div>
      ) : (
        // Registration Form
        <div>
          <h2 className="font-display text-[36px] leading-tight text-ink font-medium mb-2">
            Register account
          </h2>
          <p className="text-[15px] font-sans text-ink-soft mb-6">
            Apply for pharmacy store or wholesale supplier access.
          </p>

          {/* Segmented Control Role Selector */}
          <div className="border border-line rounded-[8px] p-1 bg-surface flex mb-6">
            <button
              type="button"
              onClick={() => setRole('store')}
              className={`flex-1 py-2 text-xs font-sans font-medium rounded-[6px] transition-colors select-none ${
                role === 'store'
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              I run a medical store
            </button>
            <button
              type="button"
              onClick={() => setRole('supplier')}
              className={`flex-1 py-2 text-xs font-sans font-medium rounded-[6px] transition-colors select-none ${
                role === 'supplier'
                  ? 'bg-ink text-paper shadow-sm'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              I am a supplier
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-[6px] border border-[#F5C2BC] bg-status-expired-bg text-status-expired text-xs mb-6 leading-relaxed font-sans">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Contact person name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Patel"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="email"
                label="Email address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="store@domain.in"
                required
              />
              <Input
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
              />
            </div>

            <Input
              id="businessName"
              label={role === 'store' ? 'Medical store name' : 'Pharma distributor name'}
              value={formData.businessName}
              onChange={handleChange}
              placeholder={role === 'store' ? 'e.g. Shreeji Chemist' : 'e.g. Sun Medico Agencies'}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="licenseNumber"
                label="Drug license number"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="e.g. GJ-AHM-20C-12345"
                required
              />
              <Input
                id="phone"
                label="Phone number"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98250 12345"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Ahmedabad"
                required
              />
              <Input
                id="address"
                label="Premise address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Shop no, street, area"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Submit registration
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-ink-soft">
            Already registered?{' '}
            <Link
              to="/login"
              className="text-ink font-medium underline underline-offset-4 hover:text-brand"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
