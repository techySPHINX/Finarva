# =============================================================================
# FINARVA - TERRAFORM VARIABLES
# =============================================================================

variable "environment" {
  description = "Environment name (e.g., dev, staging, production)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "vm_size" {
  description = "Azure VM size"
  type        = string
  default     = "Standard_B2s"
  
  # Recommended sizes:
  # Standard_B1s  - 1 vCPU, 1GB RAM (dev/test)
  # Standard_B2s  - 2 vCPU, 4GB RAM (small production)
  # Standard_D2s_v3 - 2 vCPU, 8GB RAM (medium production)
  # Standard_D4s_v3 - 4 vCPU, 16GB RAM (large production)
}

variable "admin_username" {
  description = "VM administrator username"
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "allowed_ssh_ips" {
  description = "List of IP addresses allowed to SSH into the VM"
  type        = list(string)
  default     = []
  
  # Example: ["203.0.113.0/24", "198.51.100.42/32"]
  # Leave empty to allow from anywhere (not recommended for production)
}

# =============================================================================
# DATABASE VARIABLES
# =============================================================================

variable "enable_postgresql" {
  description = "Enable Azure PostgreSQL Flexible Server"
  type        = bool
  default     = false
  
  # Set to true if you want to use Azure PostgreSQL instead of external MongoDB
}

variable "db_admin_username" {
  description = "Database administrator username"
  type        = string
  default     = "finarvaadmin"
  sensitive   = true
}

variable "db_admin_password" {
  description = "Database administrator password"
  type        = string
  default     = ""
  sensitive   = true
  
  # Must be at least 8 characters with uppercase, lowercase, numbers, and special chars
}

# =============================================================================
# REDIS VARIABLES
# =============================================================================

variable "redis_capacity" {
  description = "Redis cache capacity (0-6 for Basic/Standard, 1-4 for Premium)"
  type        = number
  default     = 1
}

variable "redis_family" {
  description = "Redis cache family (C for Basic/Standard, P for Premium)"
  type        = string
  default     = "C"
  
  validation {
    condition     = contains(["C", "P"], var.redis_family)
    error_message = "Redis family must be C (Basic/Standard) or P (Premium)."
  }
}

variable "redis_sku" {
  description = "Redis cache SKU (Basic, Standard, or Premium)"
  type        = string
  default     = "Standard"
  
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.redis_sku)
    error_message = "Redis SKU must be Basic, Standard, or Premium."
  }
}

# =============================================================================
# TAGS
# =============================================================================

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}
