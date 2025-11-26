import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/resurrections - Create new resurrection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, module, abapObjectIds, userId } = body;

    // Validation
    if (!name || !module || !abapObjectIds || !Array.isArray(abapObjectIds) || abapObjectIds.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          message: 'name, module, and abapObjectIds (array) are required'
        },
        { status: 400 }
      );
    }

    // Verify ABAP objects exist
    const abapObjects = await prisma.aBAPObject.findMany({
      where: {
        id: { in: abapObjectIds }
      }
    });

    if (abapObjects.length !== abapObjectIds.length) {
      return NextResponse.json(
        { 
          error: 'Invalid ABAP objects',
          message: 'One or more ABAP object IDs not found'
        },
        { status: 404 }
      );
    }

    // Calculate total LOC
    const totalLOC = abapObjects.reduce((sum, obj) => sum + obj.linesOfCode, 0);

    // Get or create default user
    let defaultUserId = userId;
    if (!defaultUserId) {
      const defaultUser = await prisma.user.findUnique({
        where: { email: 'default@resurrection.local' }
      });
      
      if (!defaultUser) {
        // Create default user if it doesn't exist
        const newUser = await prisma.user.create({
          data: {
            email: 'default@resurrection.local',
            name: 'Default User'
          }
        });
        defaultUserId = newUser.id;
      } else {
        defaultUserId = defaultUser.id;
      }
    }

    // Create resurrection
    const resurrection = await prisma.resurrection.create({
      data: {
        name,
        description: description || null,
        status: 'UPLOADED',
        module,
        originalLOC: totalLOC,
        userId: defaultUserId,
        abapObjects: {
          connect: abapObjectIds.map(id => ({ id }))
        }
      },
      include: {
        abapObjects: {
          select: {
            id: true,
            name: true,
            type: true,
            linesOfCode: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Resurrection created successfully',
      resurrection: {
        id: resurrection.id,
        name: resurrection.name,
        description: resurrection.description,
        status: resurrection.status,
        module: resurrection.module,
        originalLOC: resurrection.originalLOC,
        abapObjects: resurrection.abapObjects,
        createdAt: resurrection.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating resurrection:', error);
    return NextResponse.json(
      { 
        error: 'Creation failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// GET /api/resurrections - List all resurrections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const module = searchParams.get('module');

    // Get default user
    const defaultUser = await prisma.user.findUnique({
      where: { email: 'default@resurrection.local' }
    });

    const where: any = {};
    if (defaultUser) {
      where.userId = defaultUser.id;
    }
    if (status) where.status = status;
    if (module) where.module = module;

    const resurrections = await prisma.resurrection.findMany({
      where,
      include: {
        abapObjects: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        _count: {
          select: {
            transformationLogs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      count: resurrections.length,
      resurrections: resurrections.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        status: r.status,
        module: r.module,
        githubUrl: r.githubUrl,
        basUrl: r.basUrl,
        originalLOC: r.originalLOC,
        locSaved: r.locSaved,
        qualityScore: r.qualityScore,
        abapObjectCount: r.abapObjects.length,
        transformationLogCount: r._count.transformationLogs,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching resurrections:', error);
    return NextResponse.json(
      { 
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
