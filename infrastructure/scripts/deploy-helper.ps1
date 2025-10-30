# Finarva Deployment Helper for Windows
# This script helps Windows users deploy to Azure

Write-Host "🚀 Finarva Azure Deployment Helper" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Azure CLI
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✅ Azure CLI installed: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    exit 1
}

# Check Terraform
try {
    $tfVersion = terraform version -json | ConvertFrom-Json
    Write-Host "✅ Terraform installed: $($tfVersion.terraform_version)" -ForegroundColor Green
} catch {
    Write-Host "❌ Terraform not found. Please install from: https://www.terraform.io/downloads" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All prerequisites met! ✅" -ForegroundColor Green
Write-Host ""

# Menu
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Deploy Azure Infrastructure (Terraform)" -ForegroundColor White
Write-Host "2. Deploy Application to Azure VM" -ForegroundColor White
Write-Host "3. Setup SSL Certificate" -ForegroundColor White
Write-Host "4. Check Deployment Status" -ForegroundColor White
Write-Host "5. View Terraform Outputs" -ForegroundColor White
Write-Host "6. Destroy Infrastructure" -ForegroundColor White
Write-Host "0. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (0-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🏗️ Deploying Azure Infrastructure..." -ForegroundColor Cyan
        Write-Host ""
        
        # Check if terraform.tfvars exists
        if (-not (Test-Path "infrastructure\azure\terraform.tfvars")) {
            Write-Host "⚠️ terraform.tfvars not found. Creating from example..." -ForegroundColor Yellow
            Copy-Item "infrastructure\azure\terraform.tfvars.example" "infrastructure\azure\terraform.tfvars"
            Write-Host "✅ Created terraform.tfvars" -ForegroundColor Green
            Write-Host "📝 Please edit infrastructure\azure\terraform.tfvars with your values" -ForegroundColor Yellow
            Write-Host "Press Enter when ready to continue..."
            Read-Host
        }
        
        # Login to Azure
        Write-Host "Logging in to Azure..." -ForegroundColor Yellow
        az login
        
        # Navigate to infrastructure directory
        Push-Location "infrastructure\azure"
        
        # Initialize Terraform
        Write-Host "Initializing Terraform..." -ForegroundColor Yellow
        terraform init
        
        # Plan
        Write-Host ""
        Write-Host "Planning infrastructure changes..." -ForegroundColor Yellow
        terraform plan -out=tfplan
        
        # Confirm
        Write-Host ""
        $confirm = Read-Host "Apply these changes? (yes/no)"
        if ($confirm -eq "yes") {
            terraform apply tfplan
            terraform output > ..\..\azure-outputs.txt
            Write-Host ""
            Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green
            Write-Host "📄 Outputs saved to azure-outputs.txt" -ForegroundColor Green
        } else {
            Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        }
        
        Pop-Location
    }
    
    "2" {
        Write-Host ""
        Write-Host "🚀 Deploying Application to Azure VM..." -ForegroundColor Cyan
        Write-Host ""
        
        $vmIp = Read-Host "Enter VM IP address"
        $sshUser = Read-Host "Enter SSH username (default: azureuser)"
        if ([string]::IsNullOrWhiteSpace($sshUser)) {
            $sshUser = "azureuser"
        }
        
        Write-Host ""
        Write-Host "Testing SSH connection..." -ForegroundColor Yellow
        ssh -o ConnectTimeout=5 "$sshUser@$vmIp" "echo 'Connected successfully!'"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SSH connection successful" -ForegroundColor Green
            Write-Host ""
            Write-Host "Building and deploying application..." -ForegroundColor Yellow
            
            # Build Docker image
            docker build -t finarva-api:latest .
            
            # Save and compress image
            Write-Host "Compressing Docker image..." -ForegroundColor Yellow
            docker save finarva-api:latest | gzip > finarva-api.tar.gz
            
            # Upload to VM
            Write-Host "Uploading to VM..." -ForegroundColor Yellow
            scp finarva-api.tar.gz "$sshUser@$vmIp:/tmp/"
            
            # Deploy on VM
            Write-Host "Deploying on VM..." -ForegroundColor Yellow
            ssh "$sshUser@$vmIp" @"
cd /opt/finarva
docker load < /tmp/finarva-api.tar.gz
docker-compose up -d
rm /tmp/finarva-api.tar.gz
"@
            
            # Clean up
            Remove-Item finarva-api.tar.gz
            
            Write-Host ""
            Write-Host "✅ Application deployed successfully!" -ForegroundColor Green
            Write-Host "🔍 Checking health..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
            
            try {
                $health = Invoke-WebRequest -Uri "http://$vmIp:3000/health" -UseBasicParsing
                Write-Host "✅ Application is healthy!" -ForegroundColor Green
            } catch {
                Write-Host "⚠️ Health check failed. Application may still be starting..." -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ SSH connection failed. Please check your VM IP and credentials." -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🔒 Setting up SSL Certificate..." -ForegroundColor Cyan
        Write-Host ""
        
        $domain = Read-Host "Enter your domain name (e.g., api.yourdomain.com)"
        $email = Read-Host "Enter your email for Let's Encrypt"
        $vmIp = Read-Host "Enter VM IP address"
        $sshUser = Read-Host "Enter SSH username (default: azureuser)"
        if ([string]::IsNullOrWhiteSpace($sshUser)) {
            $sshUser = "azureuser"
        }
        
        Write-Host ""
        Write-Host "Checking DNS resolution..." -ForegroundColor Yellow
        try {
            $resolvedIp = (Resolve-DnsName $domain -Type A).IPAddress
            if ($resolvedIp -eq $vmIp) {
                Write-Host "✅ DNS correctly configured" -ForegroundColor Green
                
                Write-Host ""
                Write-Host "Setting up SSL certificate..." -ForegroundColor Yellow
                ssh "$sshUser@$vmIp" @"
sudo certbot --nginx -d $domain --non-interactive --agree-tos -m $email
sudo systemctl reload nginx
"@
                
                Write-Host ""
                Write-Host "✅ SSL certificate installed successfully!" -ForegroundColor Green
                Write-Host "🔒 Your site is now available at: https://$domain" -ForegroundColor Green
            } else {
                Write-Host "⚠️ DNS points to $resolvedIp but VM IP is $vmIp" -ForegroundColor Yellow
                Write-Host "Please update your DNS A record to point to $vmIp" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ Could not resolve domain $domain" -ForegroundColor Red
            Write-Host "Please ensure your DNS A record is configured and propagated" -ForegroundColor Yellow
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "📊 Checking Deployment Status..." -ForegroundColor Cyan
        Write-Host ""
        
        $vmIp = Read-Host "Enter VM IP address"
        
        Write-Host ""
        Write-Host "Testing health endpoint..." -ForegroundColor Yellow
        try {
            $health = Invoke-RestMethod -Uri "http://$vmIp:3000/health" -Method Get
            Write-Host "✅ Application Status:" -ForegroundColor Green
            $health | ConvertTo-Json -Depth 3 | Write-Host
        } catch {
            Write-Host "❌ Health check failed. Application may be down." -ForegroundColor Red
        }
        
        Write-Host ""
        $sshUser = Read-Host "Enter SSH username to check VM status (default: azureuser, press Enter to skip)"
        if (-not [string]::IsNullOrWhiteSpace($sshUser)) {
            Write-Host ""
            Write-Host "Container status:" -ForegroundColor Yellow
            ssh "$sshUser@$vmIp" "cd /opt/finarva && docker-compose ps"
            
            Write-Host ""
            Write-Host "Recent logs:" -ForegroundColor Yellow
            ssh "$sshUser@$vmIp" "cd /opt/finarva && docker-compose logs --tail=20 app"
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "📄 Terraform Outputs..." -ForegroundColor Cyan
        Write-Host ""
        
        if (Test-Path "azure-outputs.txt") {
            Get-Content "azure-outputs.txt"
        } else {
            Write-Host "Fetching current outputs..." -ForegroundColor Yellow
            Push-Location "infrastructure\azure"
            terraform output
            Pop-Location
        }
    }
    
    "6" {
        Write-Host ""
        Write-Host "⚠️ DESTROY INFRASTRUCTURE" -ForegroundColor Red
        Write-Host "This will delete all Azure resources created by Terraform!" -ForegroundColor Red
        Write-Host ""
        
        $confirm = Read-Host "Are you sure? Type 'destroy' to confirm"
        if ($confirm -eq "destroy") {
            Push-Location "infrastructure\azure"
            terraform destroy
            Pop-Location
            Write-Host ""
            Write-Host "✅ Infrastructure destroyed" -ForegroundColor Green
        } else {
            Write-Host "❌ Cancelled" -ForegroundColor Yellow
        }
    }
    
    "0" {
        Write-Host ""
        Write-Host "Goodbye! 👋" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
