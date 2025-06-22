import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/prisma'

export async function GET() {
  try {
    const dbConnected = await testDatabaseConnection()
    
    return NextResponse.json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}