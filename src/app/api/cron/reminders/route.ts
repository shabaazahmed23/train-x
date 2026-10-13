import { NextRequest, NextResponse } from 'next/server';
import { runMembershipReminderEngine } from '@/lib/reminders';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secretQuery = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET;

    // Check if called by authorized admin session or valid CRON secret
    const isSecretValid =
      expectedSecret &&
      (authHeader === `Bearer ${expectedSecret}` || secretQuery === expectedSecret);

    if (!isSecretValid) {
      // Check if logged in admin
      const session = await getSession();
      if (!session || session.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid cron secret or admin credentials' },
          { status: 401 }
        );
      }
    }

    const summary = await runMembershipReminderEngine();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error in reminder engine';
    console.error('Cron reminder job error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
