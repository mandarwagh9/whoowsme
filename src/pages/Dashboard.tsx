import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserLoans } from '@/services/loanService';
import { Loan } from '@/types';
import LoanCard from '@/components/Loans/LoanCard';
import AddLoanForm from '@/components/Loans/AddLoanForm';
import ReminderModal from '@/components/Reminders/ReminderModal';
import { LogOut, Plus, TrendingUp, DollarSign, Users, Moon, Sun } from 'lucide-react';

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

  const handleReminderSent = () => {
    loadLoans();
  };

  const handleLoanAdded = () => {
    loadLoans();
  };

  const activeLoans = loans.filter(l => !l.isPaid);
  const paidLoans = loans.filter(l => l.isPaid);
  const totalOwed = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };
    return symbols[currency] || currency;
  };

  const primaryCurrency = activeLoans.length > 0 ? activeLoans[0].currency : 'INR';

  return (
    <div className="min-h-screen pb-12">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Who Owes Me? 😊</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Hi, {user?.displayName || user?.email || 'there'}!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 border border-primary-200 dark:border-primary-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-500 rounded-full">
                <DollarSign size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Owed</p>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                  {getCurrencySymbol(primaryCurrency)}{totalOwed.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-soft-green to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-full">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Loans</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{activeLoans.length}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-soft-blue to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-full">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Friends</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {new Set(loans.map(l => l.friendName)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus size={20} />
            Add New Loan
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your loans...</p>
          </div>
        )}

        {!loading && loans.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Loans Yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start tracking money you've lent to friends!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Your First Loan
            </button>
          </div>
        )}

        {!loading && activeLoans.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
              Active Loans ({activeLoans.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onSendReminder={handleSendReminder}
                  onUpdate={loadLoans}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && paidLoans.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
              Paid Back ({paidLoans.length}) ✅
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paidLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onSendReminder={handleSendReminder}
                  onUpdate={loadLoans}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AddLoanForm
        userId={user?.uid || ''}
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onLoanAdded={handleLoanAdded}
      />

      {selectedLoan && (
        <ReminderModal
          loan={selectedLoan}
          isOpen={showReminderModal}
          onClose={() => {
            setShowReminderModal(false);
            setSelectedLoan(null);
          }}
          onReminderSent={handleReminderSent}
        />
      )}
    </div>
  );
};

export default Dashboard;
