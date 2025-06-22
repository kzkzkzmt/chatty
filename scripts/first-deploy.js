const { execSync } = require('child_process');

console.log('🚀 初回デプロイセットアップを開始...');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Prisma Clientを生成中...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Step 2: Deploy migrations
  console.log('🗄️ データベースマイグレーションを適用中...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ マイグレーションエラー。データベースをリセットします...');
    // If migration fails, try to push the schema directly
    execSync('npx prisma db push', { stdio: 'inherit' });
  }
  
  // Step 3: Build the app
  console.log('🔨 アプリケーションをビルド中...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ 初回デプロイセットアップ完了！');
  console.log('');
  console.log('📝 次のステップ:');
  console.log('1. アプリケーションが起動したら、Render Shellで以下を実行:');
  console.log('   node setup.js');
  console.log('2. テストアカウントでログイン:');
  console.log('   Email: admin@construction.com');
  console.log('   Password: admin123');
  
} catch (error) {
  console.error('❌ セットアップエラー:', error.message);
  process.exit(1);
}