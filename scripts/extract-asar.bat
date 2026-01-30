@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 解压 app.asar 文件的批处理脚本
:: 用法: extract-asar.bat [app.asar路径] [输出目录]

set "ASAR_FILE=%~1"
set "OUTPUT_DIR=%~2"

:: 如果没有提供参数，使用默认路径
if "%ASAR_FILE%"=="" (
    set "ASAR_FILE=%~dp0..\release\1.0.0\win-unpacked\resources\app.asar"
)

if "%OUTPUT_DIR%"=="" (
    set "OUTPUT_DIR=%~dp0..\release\1.0.0\win-unpacked\resources\app-extracted"
)

:: 检查 asar 文件是否存在
if not exist "%ASAR_FILE%" (
    echo [错误] 找不到 app.asar 文件: %ASAR_FILE%
    echo.
    echo 用法:
    echo   extract-asar.bat [app.asar路径] [输出目录]
    echo.
    echo 示例:
    echo   extract-asar.bat
    echo   extract-asar.bat "C:\path\to\app.asar" "C:\path\to\output"
    exit /b 1
)

:: 检查输出目录是否存在，如果存在则询问是否删除
if exist "%OUTPUT_DIR%" (
    echo [警告] 输出目录已存在: %OUTPUT_DIR%
    set /p "confirm=是否删除并重新解压? (Y/N): "
    if /i "!confirm!"=="Y" (
        echo 正在删除旧目录...
        rmdir /s /q "%OUTPUT_DIR%"
    ) else (
        echo 操作已取消
        exit /b 0
    )
)

:: 创建输出目录
mkdir "%OUTPUT_DIR%" 2>nul

echo ========================================
echo 解压 app.asar 文件
echo ========================================
echo 源文件: %ASAR_FILE%
echo 输出目录: %OUTPUT_DIR%
echo ========================================
echo.

:: 使用 npx asar extract 解压
echo 正在解压...
npx --yes asar extract "%ASAR_FILE%" "%OUTPUT_DIR%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo [成功] 解压完成！
    echo ========================================
    echo 输出目录: %OUTPUT_DIR%
    echo.
) else (
    echo.
    echo ========================================
    echo [错误] 解压失败！
    echo ========================================
    echo 请确保已安装 Node.js 和 npm
    echo 如果 asar 工具未安装，脚本会自动安装
    echo.
    exit /b 1
)

pause

