import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserLoans } from '@/services/loanService';
import { Loan } from '@/types';
import LoanCard from '@/components/Loans/LoanCard';
import AddLoanForm from '@/components/Loans/AddLoanForm';
import ReminderModal from '@/components/Reminders/ReminderModal';
import { LogOut, Plus, TrendingUp, Wallet, Users, Moon, Sun, Sparkles, Crown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const loadLoans = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userLoans = await getUserLoans(user.uid);
      setLoans(userLoans);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [user]);

  const handleSendReminder = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowReminderModal(true);
  };

  const activeLoans = loans.filter(l => !l.isPaid);
  const paidLoans = loans.filter(l => l.isPaid);
  const totalOwed = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return symbols[currency] || currency;
  };

  const primaryCurrency = activeLoans.length > 0 ? activeLoans[0].currency : 'INR';

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40">
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/50"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-blue rounded-lg shadow-sm">
                <Wallet size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Who Owes Me?
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Hi, {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}! 👋
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-gray-600" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Owed */}
          <div className="stat-card bg-gradient-to-br from-primary-500 via-primary-600 to-accent-purple text-white">
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Wallet size={28} />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Total Owed</p>
                <p className="text-3xl font-display font-bold">
                  {getCurrencySymbol(primaryCurrency)}{totalOwed.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>

          {/* Active */}
          <div className="stat-card bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 text-white">
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Active</p>
                <p className="text-3xl font-display font-bold">{activeLoans.length}</p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>

          {/* Friends */}
          <div className="stat-card bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white">
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Users size={28} />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Friends</p>
                <p className="text-3xl font-display font-bold">
                  {new Set(loans.map(l => l.friendName)).size}
                </p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-gradient flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Plus size={20} />
            Add New Entry
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple animate-pulse">
              <Sparkles size={32} className="text-white animate-float" />
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading your entries...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && loans.length === 0 && (
          <div className="card-gradient text-center py-16 px-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-purple/20 dark:from-primary-900/30 dark:to-purple-900/30 mb-6">
              <span className="text-5xl">💸</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-800 dark:text-white mb-3">
              No Entries Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start tracking money you've lent to friends and never forget who owes you!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-gradient inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Your First Entry
            </button>
          </div>
        )}

        {/* Premium Banner */}
        {!loading && loans.length > 0 && (
          <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/10 dark:via-orange-900/10 dark:to-yellow-900/10 rounded-3xl p-6 border border-amber-200/50 dark:border-amber-700/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
                <Crown size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-gray-800 dark:text-white">Upgrade to Premium</h3>
                  <span className="badge-premium">
                    <Sparkles size={10} />
                    Soon
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Auto-send reminders via WhatsApp, SMS & Email on schedule. Never miss a follow-up!
                </p>
              </div>
              <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 text-sm">
                Join Waitlist
              </button>
            </div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl"></div>
          </div>
        )}

        {/* Active Loans */}
        {!loading && activeLoans.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-purple rounded-xl">
                <TrendingUp size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-800 dark:text-white">
                Active <span className="text-gray-400 font-normal">({activeLoans.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onSendReminder={handleSendReminder}
                  onUpdate={loadLoans}
                />
              ))}
            </div>
          </section>
        )}

        {/* Paid Loans */}
        {!loading && paidLoans.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <span className="text-white text-lg">✓</span>
              </div>
              <h2 className="text-xl font-display font-bold text-gray-800 dark:text-white">
                Paid Back <span className="text-gray-400 font-normal">({paidLoans.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paidLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onSendReminder={handleSendReminder}
                  onUpdate={loadLoans}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <AddLoanForm
        userId={user?.uid || ''}
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onLoanAdded={loadLoans}
      />

      {selectedLoan && (
        <ReminderModal
          loan={selectedLoan}
          isOpen={showReminderModal}
          onClose={() => {
            setShowReminderModal(false);
            setSelectedLoan(null);
          }}
          onReminderSent={loadLoans}
        />
      )}
    </div>
  );
};

export default Dashboard;
