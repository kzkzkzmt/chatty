const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 セットアップを開始しています...')

  try {
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

    console.log('👤 テストユーザーを作成中...')
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
        createdUsers.push(user)
        console.log(`  ✅ ${user.name} (${user.email})`)
      } else {
        console.log(`  ⏭️  ${userData.name} (${userData.email}) - 既に存在`)
        createdUsers.push(existingUser)
      }
    }

    // サンプルルームの作成
    console.log('🏢 サンプルプロジェクトルームを作成中...')
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
              create: createdUsers.map((user, index) => ({
                userId: user.id,
                role: index === 0 ? 'admin' : 'member'
              }))
            }
          }
        })
        console.log(`  ✅ ${room.name}`)

        // サンプルメッセージの追加
        await prisma.message.create({
          data: {
            content: 'プロジェクトルームが作成されました。ファイル共有とバージョン管理にご活用ください。',
            userId: createdUsers[0].id,
            roomId: room.id
          }
        })
      } else {
        console.log(`  ⏭️  ${roomData.name} - 既に存在`)
      }
    }

    // uploadsディレクトリの作成
    const fs = require('fs')
    const path = require('path')
    const uploadsDir = path.join(__dirname, 'uploads')
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log('📁 uploadsディレクトリを作成しました')
    }

    console.log('✨ セットアップが完了しました！')
    console.log('')
    console.log('🚀 アプリケーションを起動するには:')
    console.log('   npm run dev')
    console.log('')
    console.log('👤 テストアカウント:')
    console.log('   Email: admin@construction.com')
    console.log('   Password: admin123')
    console.log('')
    console.log('   Email: yamada@contractor.com')
    console.log('   Password: password123')

  } catch (error) {
    console.error('❌ セットアップ中にエラーが発生しました:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })