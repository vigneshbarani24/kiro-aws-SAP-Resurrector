import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/resurrections/:id - Get resurrection details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resurrection = await prisma.resurrection.findUnique({
      where: { id },
      include: {
        abapObjects: {
          select: {
            id: true,
            name: true,
            type: true,
            module: true,
            linesOfCode: true,
            complexity: true
          }
        },
        transformationLogs: {
          orderBy: {
            createdAt: 'asc'
          },
          select: {
            id: true,
            step: true,
            status: true,
            duration: true,
            errorMessage: true,
            createdAt: true
          }
        },
        qualityReports: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        githubActivities: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    if (!resurrection) {
      return NextResponse.json(
        { error: 'Resurrection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      resurrection: {
        id: resurrection.id,
        name: resurrection.name,
        description: resurrection.description,
        status: resurrection.status,
        module: resurrection.module,
        githubRepo: resurrection.githubRepo,
        githubUrl: resurrection.githubUrl,
        githubMethod: resurrection.githubMethod,
        basUrl: resurrection.basUrl,
        deploymentUrl: resurrection.deploymentUrl,
        deploymentStatus: resurrection.deploymentStatus,
        originalLOC: resurrection.originalLOC,
        transformedLOC: resurrection.transformedLOC,
        locSaved: resurrection.locSaved,
        complexityScore: resurrection.complexityScore,
        qualityScore: resurrection.qualityScore,
        abapObjects: resurrection.abapObjects,
        transformationLogs: resurrection.transformationLogs,
        latestQualityReport: resurrection.qualityReports[0] || null,
        recentGithubActivities: resurrection.githubActivities,
        createdAt: resurrection.createdAt,
        updatedAt: resurrection.updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching resurrection:', error);
    return NextResponse.json(
      { 
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/resurrections/:id - Delete resurrection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if resurrection exists
    const resurrection = await prisma.resurrection.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            abapObjects: true,
            transformationLogs: true,
            qualityReports: true,
            hookExecutions: true,
            slackNotifications: true,
            githubActivities: true
          }
        }
      }
    });

    if (!resurrection) {
      return NextResponse.json(
        { error: 'Resurrection not found' },
        { status: 404 }
      );
    }

    // Delete all related records (cascade delete)
    // Note: Prisma will handle cascade deletes based on schema relationships
    await prisma.resurrection.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: `Resurrection "${resurrection.name}" deleted successfully`,
      deletedCounts: {
        abapObjects: resurrection._count.abapObjects,
        transformationLogs: resurrection._count.transformationLogs,
        qualityReports: resurrection._count.qualityReports,
        hookExecutions: resurrection._count.hookExecutions,
        slackNotifications: resurrection._count.slackNotifications,
        githubActivities: resurrection._count.githubActivities
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting resurrection:', error);
    return NextResponse.json(
      { 
        error: 'Delete failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
