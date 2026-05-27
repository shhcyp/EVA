node 18

安装依赖
npm install --legacy-peer-deps

启动
CHOKIDAR_USEPOLLING=true npm run dev

//"type": "development",



打包
npx electron-builder

build
rm -rf dist release

npm run build

手动清理macOS旧app绑定
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister \
-kill -r -domain user
