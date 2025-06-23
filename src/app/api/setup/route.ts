import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // セキュリティチェック - 本番環境では特定のキーが必要
    const { searchParams } = new URL(request.url)
    const setupKey = searchParams.get('key')
    
    // 簡易的なセキュリティ - 本番環境では環境変数から読み込む
    const expectedKey = process.env.SETUP_KEY || 'setup-construction-chat-2024'
    
    if (setupKey !== expectedKey) {
      return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 })
    }

    console.log('🚀 セットアップAPIを開始...')
    
    // データベース接続確認
    await prisma.$connect()
    console.log('✅ データベース接続成功')
    
    // テーブルの存在確認
    try {
      const userCount = await prisma.user.count()
      console.log(`現在のユーザー数: ${userCount}`)
    } catch (error) {
      console.log('⚠️ テーブルが存在しません。スキーマを適用します...')
      // テーブルが存在しない場合は、エラーとして返す
      return NextResponse.json({
        error: 'Database tables not found. Please run migrations first.',
        instructions: [
          '1. Add this to your render.yaml buildCommand:',
          '   "npx prisma db push --skip-generate"',
          '2. Redeploy the application',
          '3. Visit this URL again'
        ]
      }, { status: 500 })
    }
    
    // テストユーザーの作成
    const testUsers = [
      {
        email: 'admin@construction.com',
        name: '管理者',
        password: 'admin123'
      },
      {
        email: 'yamada@contractor.com',
        name: '山田太郎',
        password: 'password123'
      },
      {
        email: 'sato@architect.com',
        name: '佐藤花子',
        password: 'password123'
      }
    ]
    
    const createdUsers = []
    
    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            password: hashedPassword
          }
        })
        createdUsers.push({
          email: user.email,
          name: user.name
        })
        console.log(`✅ ユーザー作成: ${user.name} (${user.email})`)
      } else {
        console.log(`⏭️ 既存ユーザー: ${userData.name} (${userData.email})`)
      }
    }
    
    // サンプルルームの作成
    const sampleRooms = [
      {
        name: '新宿オフィス建設プロジェクト',
        description: '新宿区の新オフィスビル建設プロジェクト'
      },
      {
        name: '渋谷マンション改修工事',
        description: '築20年マンションの大規模改修工事'
      }
    ]
    
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@construction.com' }
    })
    
    if (adminUser) {
      for (const roomData of sampleRooms) {
        const existingRoom = await prisma.room.findFirst({
          where: { name: roomData.name }
        })
        
        if (!existingRoom) {
          const room = await prisma.room.create({
            data: {
              name: roomData.name,
              description: roomData.description,
              members: {
                create: {
                  userId: adminUser.id,
                  role: 'admin'
                }
              }
            }
          })
          console.log(`✅ ルーム作成: ${room.name}`)
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'セットアップ完了',
      createdUsers: createdUsers.length,
      testAccount: {
        email: 'admin@construction.com',
        password: 'admin123'
      }
    })
    
  } catch (error) {
    console.error('セットアップエラー:', error)
    return NextResponse.json({
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}