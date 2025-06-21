import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  console.log('API /user - Request received')
  
  try {
    const user = getUserFromRequest(request)
    console.log('API /user - User from token:', user)
    
    if (!user) {
      console.log('API /user - No user found in token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API /user - Fetching user data for ID:', user.userId)
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    if (!userData) {
      console.log('API /user - User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('API /user - User data found:', userData.email)
    return NextResponse.json(userData)
  } catch (error) {
    console.error('API /user - Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}