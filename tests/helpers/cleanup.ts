/**
 * Helper functions for test cleanup
 * These functions call API routes instead of directly using Prisma
 * to avoid Prisma Client initialization issues in test context
 */

export async function cleanupUserByEmail(email: string) {
  try {
    // Call a cleanup API endpoint
    const response = await fetch('http://localhost:3000/api/test/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      console.warn(`Cleanup failed for ${email}:`, await response.text());
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
