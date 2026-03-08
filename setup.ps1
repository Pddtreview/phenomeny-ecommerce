$folders = @(
    "app\(store)\products\[slug]",
    "app\(store)\category\[slug]",
    "app\(store)\bundles\[slug]",
    "app\(store)\cart",
    "app\(store)\checkout",
    "app\(store)\order-success\[id]",
    "app\(store)\track\[order-number]",
    "app\(store)\blog\[slug]",
    "app\(store)\account",
    "app\admin\orders\[id]",
    "app\admin\products",
    "app\admin\inventory",
    "app\admin\customers",
    "app\admin\reports",
    "app\api\products",
    "app\api\cart",
    "app\api\checkout",
    "app\api\orders",
    "app\api\payments\razorpay",
    "app\api\payments\webhook",
    "app\api\shipping",
    "app\api\otp",
    "app\api\chat",
    "app\api\cron",
    "components\store",
    "components\admin",
    "components\email",
    "hooks",
    "configs",
    "public\images"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
    Write-Host "Created: $folder"
}

New-Item -ItemType File -Force -Path "configs\nauvarah.config.ts" | Out-Null
New-Item -ItemType File -Force -Path "lib\supabase.ts" | Out-Null
New-Item -ItemType File -Force -Path "lib\supabase-server.ts" | Out-Null
New-Item -ItemType File -Force -Path ".env.local" | Out-Null

Write-Host "Done. All folders and files created."