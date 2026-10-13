import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 401 });
    }

    const members = await prisma.memberProfile.findMany({
      include: {
        user: true,
        memberships: {
          orderBy: { endDate: 'desc' },
          take: 1,
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Membership ID',
      'Full Name',
      'Email',
      'Phone',
      'Plan Name',
      'Status',
      'Start Date',
      'Expiry Date',
      'Emergency Contact',
      'Created At',
    ];

    const rows = members.map((m) => {
      const current = m.memberships[0];
      return [
        m.membershipNumber,
        `"${m.user.name.replace(/"/g, '""')}"`,
        m.user.email,
        m.user.phone || 'N/A',
        current?.plan?.name || 'No Plan',
        current?.status || 'INACTIVE',
        current?.startDate ? new Date(current.startDate).toISOString().split('T')[0] : 'N/A',
        current?.endDate ? new Date(current.endDate).toISOString().split('T')[0] : 'N/A',
        `"${(m.emergencyContact || 'N/A').replace(/"/g, '""')}"`,
        new Date(m.createdAt).toISOString().split('T')[0],
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="fitlife-members-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
