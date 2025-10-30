# =============================================================================
# FINARVA - AZURE INFRASTRUCTURE AS CODE (TERRAFORM)
# =============================================================================
# This configuration creates a complete Azure infrastructure for Finarva API

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  
  backend "azurerm" {
    # Configure backend for remote state storage
    # Uncomment and configure after creating storage account:
    # resource_group_name  = "rg-terraform-state"
    # storage_account_name = "stfinarvatfstate"
    # container_name       = "tfstate"
    # key                  = "finarva.terraform.tfstate"
  }
}

provider "azurerm" {
  features {
    virtual_machine {
      delete_os_disk_on_deletion     = true
      graceful_shutdown              = true
      skip_shutdown_and_force_delete = false
    }
  }
}

# =============================================================================
# RESOURCE GROUP
# =============================================================================
resource "azurerm_resource_group" "finarva" {
  name     = "rg-finarva-${var.environment}"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = "Finarva Financial Platform"
    ManagedBy   = "Terraform"
    CostCenter  = "Engineering"
  }
}

# =============================================================================
# NETWORKING
# =============================================================================
resource "azurerm_virtual_network" "main" {
  name                = "vnet-finarva-${var.environment}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.finarva.location
  resource_group_name = azurerm_resource_group.finarva.name
  tags                = azurerm_resource_group.finarva.tags
}

resource "azurerm_subnet" "app" {
  name                 = "snet-app"
  resource_group_name  = azurerm_resource_group.finarva.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "database" {
  name                 = "snet-database"
  resource_group_name  = azurerm_resource_group.finarva.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
  
  service_endpoints = ["Microsoft.Sql"]
}

# Public IP for VM
resource "azurerm_public_ip" "vm" {
  name                = "pip-finarva-vm-${var.environment}"
  location            = azurerm_resource_group.finarva.location
  resource_group_name = azurerm_resource_group.finarva.name
  allocation_method   = "Static"
  sku                 = "Standard"
  
  tags = azurerm_resource_group.finarva.tags
}

# Network Security Group
resource "azurerm_network_security_group" "app" {
  name                = "nsg-finarva-app-${var.environment}"
  location            = azurerm_resource_group.finarva.location
  resource_group_name = azurerm_resource_group.finarva.name

  security_rule {
    name                       = "AllowHTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowHTTPS"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowSSH"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefixes    = var.allowed_ssh_ips
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowNodeAPI"
    priority                   = 130
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3000"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  tags = azurerm_resource_group.finarva.tags
}

# Network Interface
resource "azurerm_network_interface" "vm" {
  name                = "nic-finarva-vm-${var.environment}"
  location            = azurerm_resource_group.finarva.location
  resource_group_name = azurerm_resource_group.finarva.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.app.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.vm.id
  }

  tags = azurerm_resource_group.finarva.tags
}

resource "azurerm_network_interface_security_group_association" "vm" {
  network_interface_id      = azurerm_network_interface.vm.id
  network_security_group_id = azurerm_network_security_group.app.id
}

# =============================================================================
# VIRTUAL MACHINE
# =============================================================================
resource "azurerm_linux_virtual_machine" "main" {
  name                = "vm-finarva-${var.environment}"
  location            = azurerm_resource_group.finarva.location
  resource_group_name = azurerm_resource_group.finarva.name
  size                = var.vm_size
  admin_username      = var.admin_username

  network_interface_ids = [
    azurerm_network_interface.vm.id,
  ]

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    name                 = "osdisk-finarva-${var.environment}"
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
    disk_size_gb         = 128
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  custom_data = base64encode(file("${path.module}/cloud-init.yaml"))

  tags = merge(
    azurerm_resource_group.finarva.tags,
    {
      Role = "Application Server"
    }
  )
}

# =============================================================================
# AZURE DATABASE FOR POSTGRESQL (Optional - if not using external MongoDB)
# =============================================================================
resource "azurerm_postgresql_flexible_server" "main" {
  count               = var.enable_postgresql ? 1 : 0
  name                = "psql-finarva-${var.environment}"
  resource_group_name = azurerm_resource_group.finarva.name
  location            = azurerm_resource_group.finarva.location
  
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password
  
  storage_mb   = 32768
  sku_name     = "B_Standard_B1ms"
  version      = "15"
  
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  
  tags = azurerm_resource_group.finarva.tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  count     = var.enable_postgresql ? 1 : 0
  name      = "finarva"
  server_id = azurerm_postgresql_flexible_server.main[0].id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# =============================================================================
# AZURE REDIS CACHE
# =============================================================================
resource "azurerm_redis_cache" "main" {
  name                = "redis-finarva-${var.environment}"
  location            = azurerm_resource_group.finarva.location
  resource_group_name = azurerm_resource_group.finarva.name
  capacity            = var.redis_capacity
  family              = var.redis_family
  sku_name            = var.redis_sku
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_policy = "allkeys-lru"
    maxmemory_reserved = 50
    maxfragmentationmemory_reserved = 50
  }

  tags = azurerm_resource_group.finarva.tags
}

# =============================================================================
# STORAGE ACCOUNT (For backups and logs)
# =============================================================================
resource "azurerm_storage_account" "main" {
  name                     = "stfinarva${var.environment}${random_string.storage_suffix.result}"
  resource_group_name      = azurerm_resource_group.finarva.name
  location                 = azurerm_resource_group.finarva.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  
  blob_properties {
    delete_retention_policy {
      days = 7
    }
  }

  tags = azurerm_resource_group.finarva.tags
}

resource "random_string" "storage_suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_storage_container" "backups" {
  name                  = "backups"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "logs" {
  name                  = "logs"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# =============================================================================
# APPLICATION INSIGHTS (Monitoring)
# =============================================================================
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-finarva-${var.environment}"
  location            = azurerm_resource_group.finarva.location
  resource_group_name = azurerm_resource_group.finarva.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = azurerm_resource_group.finarva.tags
}

resource "azurerm_application_insights" "main" {
  name                = "appi-finarva-${var.environment}"
  location            = azurerm_resource_group.finarva.location
  resource_group_name = azurerm_resource_group.finarva.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "Node.JS"

  tags = azurerm_resource_group.finarva.tags
}

# =============================================================================
# OUTPUTS
# =============================================================================
output "vm_public_ip" {
  description = "Public IP address of the VM"
  value       = azurerm_public_ip.vm.ip_address
}

output "vm_id" {
  description = "ID of the virtual machine"
  value       = azurerm_linux_virtual_machine.main.id
}

output "redis_hostname" {
  description = "Redis cache hostname"
  value       = azurerm_redis_cache.main.hostname
}

output "redis_ssl_port" {
  description = "Redis cache SSL port"
  value       = azurerm_redis_cache.main.ssl_port
}

output "redis_primary_key" {
  description = "Redis primary access key"
  value       = azurerm_redis_cache.main.primary_access_key
  sensitive   = true
}

output "postgresql_fqdn" {
  description = "PostgreSQL server FQDN"
  value       = var.enable_postgresql ? azurerm_postgresql_flexible_server.main[0].fqdn : null
}

output "storage_account_name" {
  description = "Storage account name"
  value       = azurerm_storage_account.main.name
}

output "application_insights_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "resource_group_name" {
  description = "Resource group name"
  value       = azurerm_resource_group.finarva.name
}
