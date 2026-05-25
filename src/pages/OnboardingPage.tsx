import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Users, Car, User, CheckCircle, ChevronRight } from 'lucide-react';

const DRIVERS = [
  'Max Verstappen', 'Lewis Hamilton', 'Charles Leclerc', 'Lando Norris',
  'Carlos Sainz', 'Fernando Alonso', 'George Russell', 'Oscar Piastri',
  'Sergio Perez', 'Valtteri Bottas',
];

const CAR_NUMBERS = ['1', '4', '11', '14', '16', '44', '55', '63', '81', 'Custom'];

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [teamName, setTeamName] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [customCar, setCustomCar] = useState('');
  const [favoriteDriver, setFavoriteDriver] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const finalCar = carNumber === 'Custom' ? customCar : carNumber;

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    await supabase
      .from('profiles')
      .update({
        team_name: teamName,
        car_number: finalCar,
        favorite_driver: favoriteDriver,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    await refreshProfile();
    setLoading(false);
    navigate('/dashboard');
  };

  const stepTitles = ['Name your team', 'Pick your number', 'Choose your hero'];
  const stepIcons = [Users, Car, User];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-60 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">ApexVector</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {([1, 2, 3] as Step[]).map((s, i) => {
            const Icon = stepIcons[i];
            const done = step > s;
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  done ? 'bg-green-500' : active ? 'bg-red-600' : 'bg-slate-800 border border-slate-700'
                }`}>
                  {done ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5 text-white" />}
                </div>
                {i < 2 && (
                  <div className={`w-12 h-0.5 ${step > s ? 'bg-green-500' : 'bg-slate-700'} transition-all`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-1">{stepTitles[step - 1]}</h2>
          <p className="text-slate-400 mb-8">Step {step} of 3</p>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g. Apex Racing Team"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>
              <button
                disabled={!teamName.trim()}
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {CAR_NUMBERS.map(n => (
                  <button
                    key={n}
                    onClick={() => setCarNumber(n)}
                    className={`py-3 rounded-xl text-sm font-bold transition border ${
                      carNumber === n
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {carNumber === 'Custom' && (
                <input
                  type="text"
                  value={customCar}
                  onChange={e => setCustomCar(e.target.value)}
                  placeholder="Enter car number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
                />
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition font-medium"
                >
                  Back
                </button>
                <button
                  disabled={!carNumber || (carNumber === 'Custom' && !customCar.trim())}
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                {DRIVERS.map(driver => (
                  <button
                    key={driver}
                    onClick={() => setFavoriteDriver(driver)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition text-sm font-medium ${
                      favoriteDriver === driver
                        ? 'bg-red-600/20 border-red-500/60 text-red-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {driver}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition font-medium"
                >
                  Back
                </button>
                <button
                  disabled={!favoriteDriver || loading}
                  onClick={handleFinish}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition"
                >
                  {loading ? 'Saving...' : <>Launch <Zap className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
