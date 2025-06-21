import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Check if user is a member of the room
    const roomMember = await prisma.roomMember.findFirst({
      where: {
        userId: user.userId,
        roomId,
      },
    })

    if (!roomMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const files = await prisma.file.findMany({
      where: { roomId },
      include: {
        versions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    const filesWithVersionInfo = files.map(file => ({
      id: file.id,
      name: file.name,
      originalName: file.originalName,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      totalVersions: file.versions.length,
      latestVersion: file.versions[0] ? {
        id: file.versions[0].id,
        version: file.versions[0].version,
        fileName: file.versions[0].fileName,
        fileSize: file.versions[0].size,
        comment: file.versions[0].comment,
        createdAt: file.versions[0].createdAt,
        downloadUrl: `/api/files/${file.versions[0].id}/download`,
        mimeType: file.versions[0].mimeType,
        user: file.versions[0].user,
      } : null,
      versions: file.versions.map(version => ({
        id: version.id,
        version: version.version,
        fileName: version.fileName,
        fileSize: version.size,
        comment: version.comment,
        createdAt: version.createdAt,
        downloadUrl: `/api/files/${version.id}/download`,
        mimeType: version.mimeType,
        user: version.user,
      })),
    }))

    return NextResponse.json(filesWithVersionInfo)
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}