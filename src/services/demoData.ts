export const DEMO_LOANS = [
  {
    friendName: 'Alex Chen',
    amount: 50,
    currency: 'USD',
    dateLoaned: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    reason: 'Concert tickets',
  },
  {
    friendName: 'Sarah Miller',
    amount: 125,
    currency: 'USD',
    dateLoaned: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    reason: 'Dinner and drinks',
  },
  {
    friendName: 'Mike Johnson',
    amount: 200,
    currency: 'USD',
    dateLoaned: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    reason: 'Emergency car repair',
  },
  {
    friendName: 'Emily Davis',
    amount: 75,
    currency: 'USD',
    dateLoaned: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    reason: 'Birthday gift for mutual friend',
  },
  {
    friendName: 'Chris Lee',
    amount: 300,
    currency: 'USD',
    dateLoaned: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    reason: 'First month rent',
  },
];

/**
 * Seeds demo loans for a user (for demo purposes only)
 * Usage: Import and call with user ID during development
 */
export const seedDemoLoans = async (userId: string) => {
  const { createLoan } = await import('./loanService');
  
  console.log('🌱 Seeding demo loans...');
  
  for (const loan of DEMO_LOANS) {
    try {
      await createLoan(userId, loan);
      console.log(`✅ Added loan: ${loan.friendName}`);
    } catch (error) {
      console.error(`❌ Failed to add loan for ${loan.friendName}:`, error);
    }
  }
  
  console.log('✨ Demo data seeded successfully!');
};
