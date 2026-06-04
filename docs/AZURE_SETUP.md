# ☁️ Guía de Configuración Azure

Instrucciones completas para desplegar el Sistema Administrativo Escolar en Microsoft Azure con GitHub Actions.

---

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Configurar Recursos en Azure](#configurar-recursos-en-azure)
3. [Configurar GitHub Secrets](#configurar-github-secrets)
4. [Configurar GitHub Actions](#configurar-github-actions)
5. [Desplegar por Primera Vez](#desplegar-por-primera-vez)
6. [Monitoreo y Troubleshooting](#monitoreo-y-troubleshooting)

---

## 📦 Prerequisitos

### En tu máquina local:
- Git instalado
- Node.js 18+ 
- Azure CLI instalado: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
- Cuenta de Azure con suscripción activa

### Instalación de Azure CLI:

```bash
# Windows (PowerShell)
choco install azure-cli

# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

Verificar instalación:
```bash
az --version
```

---

## ☁️ Configurar Recursos en Azure

### Paso 1: Login en Azure

```bash
# Abrir navegador y autenticar
az login

# Verificar suscripción activa
az account show
```

### Paso 2: Crear Resource Group

```bash
# Variables
$RESOURCE_GROUP = "admin-escolar-rg"
$LOCATION = "eastus"  # o la región que prefieras

# Crear grupo de recursos
az group create `
  --name $RESOURCE_GROUP `
  --location $LOCATION

# Verificar creación
az group show --name $RESOURCE_GROUP
```

### Paso 3: Crear Azure Database for PostgreSQL

```bash
$DB_SERVER = "admin-escolar-db"
$DB_ADMIN = "adminuser"
$DB_PASSWORD = "TuPasswordSeguro123!@#"  # Cambiar
$DB_NAME = "admin_escolar"

# Crear servidor PostgreSQL
az postgres server create `
  --resource-group $RESOURCE_GROUP `
  --name $DB_SERVER `
  --location $LOCATION `
  --admin-user $DB_ADMIN `
  --admin-password $DB_PASSWORD `
  --sku-name B_Gen5_1 `
  --storage-size 51200 `
  --backup-retention 7 `
  --geo-redundant-backup Disabled `
  --ssl-enforcement Enabled

# Crear base de datos
az postgres db create `
  --resource-group $RESOURCE_GROUP `
  --server-name $DB_SERVER `
  --name $DB_NAME

# Permitir tráfico desde Azure
az postgres server firewall-rule create `
  --resource-group $RESOURCE_GROUP `
  --server-name $DB_SERVER `
  --name allow-azure-services `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0

# Permitir tu IP local (para desarrollo)
# Reemplaza XXX.XXX.XXX.XXX con tu IP pública
$YOUR_IP = "XXX.XXX.XXX.XXX"

az postgres server firewall-rule create `
  --resource-group $RESOURCE_GROUP `
  --server-name $DB_SERVER `
  --name allow-local-machine `
  --start-ip-address $YOUR_IP `
  --end-ip-address $YOUR_IP
```

### Paso 4: Construir CONNECTION STRING

```bash
# El CONNECTION STRING tendrá este formato:
# postgresql://username@servername:password@servername.postgres.database.azure.com:5432/database?schema=public&sslmode=require

# En PowerShell
$DB_SERVER_FQDN = "$DB_SERVER.postgres.database.azure.com"
$CONNECTION_STRING = "postgresql://${DB_ADMIN}@${DB_SERVER}:${DB_PASSWORD}@${DB_SERVER_FQDN}:5432/${DB_NAME}?schema=public&sslmode=require"

Write-Host $CONNECTION_STRING
```

Guardar el CONNECTION_STRING, lo necesitarás en GitHub Secrets.

### Paso 5: Crear Azure App Service

```bash
$APP_SERVICE_PLAN = "admin-escolar-plan"
$APP_SERVICE_NAME = "admin-escolar-app"

# Crear plan de App Service (B1 = básico, $10-15/mes)
az appservice plan create `
  --name $APP_SERVICE_PLAN `
  --resource-group $RESOURCE_GROUP `
  --sku B1 `
  --is-linux

# Crear App Service
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name $APP_SERVICE_NAME `
  --runtime "NODE|18-lts" `
  --deployment-container-image-name node:18-lts

# Obtener Publish Profile (lo necesitarás en GitHub)
az webapp deployment list-publishing-profiles `
  --name $APP_SERVICE_NAME `
  --resource-group $RESOURCE_GROUP `
  --output json > publishProfile.json

# Copiar contenido de publishProfile.json - lo usaremos como GitHub Secret
cat publishProfile.json
```

### Paso 6: Configurar Variables de Entorno en App Service

```bash
# Obtener CONNECTION_STRING de Azure Database
$DB_CONNECTION = "postgresql://${DB_ADMIN}@${DB_SERVER}:${DB_PASSWORD}@${DB_SERVER_FQDN}:5432/${DB_NAME}?schema=public&sslmode=require"

# Generar JWT_SECRET
# En PowerShell:
$JWT_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Minimum 0 -Maximum 256)}))

# Configurar App Settings
az webapp config appsettings set `
  --name $APP_SERVICE_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings `
    "DATABASE_URL=$DB_CONNECTION" `
    "JWT_SECRET=$JWT_SECRET" `
    "NODE_ENV=production" `
    "NEXT_PUBLIC_API_URL=https://${APP_SERVICE_NAME}.azurewebsites.net" `
    "ENABLE_EMAIL_NOTIFICATIONS=true"

# Verificar configuración
az webapp config appsettings list `
  --name $APP_SERVICE_NAME `
  --resource-group $RESOURCE_GROUP
```

---

## 🔐 Configurar GitHub Secrets

### Paso 1: Obtener Azure Credentials

```bash
# En PowerShell, obtener subscription ID
$SUBSCRIPTION_ID = az account show --query id -o tsv

# Crear Service Principal
$SP_JSON = az ad sp create-for-rbac `
  --name "admin-escolar-ci" `
  --role Contributor `
  --scope "/subscriptions/$SUBSCRIPTION_ID" `
  --json

# Copiar la salida JSON completa
$SP_JSON | ConvertTo-Json
```

### Paso 2: Añadir Secrets a GitHub

1. Ir a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Añadir los siguientes secrets:

| Secret | Valor |
|--------|-------|
| `AZURE_CREDENTIALS` | El JSON del Service Principal (paso anterior) |
| `AZURE_DATABASE_URL` | El CONNECTION_STRING de PostgreSQL |
| `AZURE_PUBLISH_PROFILE` | Contenido del `publishProfile.json` |

**Ejemplo de cómo copiar a GitHub:**

```bash
# 1. Obtener Publish Profile
az webapp deployment list-publishing-profiles `
  --name admin-escolar-app `
  --resource-group admin-escolar-rg `
  --output json | ConvertTo-Json > profile.json

# 2. Copiar contenido a GitHub Secrets como AZURE_PUBLISH_PROFILE
```

---

## ⚙️ Configurar GitHub Actions

El archivo `.github/workflows/azure-deploy.yml` ya está configurado.

### Actualizar variables según tu infraestructura:

```yaml
env:
  AZURE_RESOURCE_GROUP: admin-escolar-rg      # Tu grupo
  AZURE_APP_SERVICE_NAME: admin-escolar-app   # Tu App Service
  NODE_VERSION: '18.x'
```

---

## 🚀 Desplegar por Primera Vez

### Opción 1: Despliegue Manual (Recomendado para primera vez)

```bash
# 1. Clonar repo
git clone <tu-repo>
cd proyecto-administrativo-escolar/backend

# 2. Instalar dependencias
npm install

# 3. Crear .env.local con tu DATABASE_URL de Azure
cp .env.example .env.local

# Editar .env.local:
# DATABASE_URL=postgresql://...

# 4. Ejecutar migraciones localmente
npx prisma migrate deploy

# 5. Seed datos (opcional)
npm run db:seed

# 6. Build
npm run build

# 7. Push a GitHub (activará GitHub Actions)
git add .
git commit -m "Initial setup for Azure deployment"
git push origin main
```

### Opción 2: Monitorear GitHub Actions

1. Ir a GitHub → Actions
2. Ver workflow `🚀 Deploy to Azure`
3. Esperado: ✅ Build → ✅ Migrate → ✅ Deploy → ✅ Health Check

---

## 🩺 Monitoreo y Troubleshooting

### Ver logs de App Service

```bash
$APP_SERVICE_NAME = "admin-escolar-app"
$RESOURCE_GROUP = "admin-escolar-rg"

# Ver logs en tiempo real
az webapp log tail `
  --name $APP_SERVICE_NAME `
  --resource-group $RESOURCE_GROUP

# Ver logs del deployment
az webapp log show `
  --name $APP_SERVICE_NAME `
  --resource-group $RESOURCE_GROUP
```

### Problema: Deployment fallido

```bash
# Revisar logs
az webapp deployment logs `
  --name $APP_SERVICE_NAME `
  --resource-group $RESOURCE_GROUP

# Reiniciar App Service
az webapp restart `
  --name $APP_SERVICE_NAME `
  --resource-group $RESOURCE_GROUP
```

### Problema: Base de datos no conecta

```bash
# Verificar conexión
$CONNECTION_STRING = "postgresql://..."

# Usar psql para probar (instalar si no tienes)
# En Windows: choco install postgresql
# En Mac: brew install postgresql
# En Linux: sudo apt install postgresql-client

psql $CONNECTION_STRING

# Si conecta, verás el prompt de PostgreSQL
```

### Problema: Variables de entorno no se cargan

```bash
# Verificar App Settings
az webapp config appsettings list `
  --name $APP_SERVICE_NAME `
  --resource-group $RESOURCE_GROUP

# Restart para aplicar cambios
az webapp restart `
  --name $APP_SERVICE_NAME `
  --resource-group $RESOURCE_GROUP
```

---

## 📊 Monitoreo en Producción

### Habilitar Application Insights (Opcional pero recomendado)

```bash
$INSIGHTS_NAME = "admin-escolar-insights"

# Crear Application Insights
az monitor app-insights component create `
  --app $INSIGHTS_NAME `
  --location $LOCATION `
  --resource-group $RESOURCE_GROUP

# Obtener Instrumentation Key
az monitor app-insights component show `
  --app $INSIGHTS_NAME `
  --resource-group $RESOURCE_GROUP `
  --query instrumentationKey
```

### Ver métricas en Azure Portal

1. Azure Portal → admin-escolar-rg
2. admin-escolar-app → Monitoring
3. Ver:
   - CPU, memoria, solicitudes HTTP
   - Errores
   - Response time

---

## 💰 Costos Estimados (por mes)

| Recurso | Plan | Costo |
|---------|------|-------|
| App Service | B1 (básico) | ~$10-15 |
| PostgreSQL | B_Gen5_1 (básico) | ~$30-50 |
| Storage | 50GB | ~$1 |
| **Total** | | **~$50-75/mes** |

**Notas:**
- Los primeros 12 meses: algunos servicios tienen descuento
- Para mayor tráfico, escalar a S1/S2 en App Service
- Monitoreo con Application Insights: ~$2.50/GB ingeridos

---

## 🔄 Despliegues Posteriores

Después de la configuración inicial, simplemente:

```bash
# Hacer cambios localmente
git add .
git commit -m "Feature: nuevo módulo de maestros"
git push origin main

# GitHub Actions se activa automáticamente:
# 1. Build & Test
# 2. Database Migration  
# 3. Deploy to Azure
# 4. Health Check
```

---

## 🎯 Checklist Final

- [ ] Azure CLI instalado y autenticado
- [ ] Resource Group creado en Azure
- [ ] Base de datos PostgreSQL creada
- [ ] App Service creado
- [ ] Variables de entorno configuradas en App Service
- [ ] GitHub Secrets configurados (AZURE_CREDENTIALS, AZURE_DATABASE_URL, AZURE_PUBLISH_PROFILE)
- [ ] `.github/workflows/azure-deploy.yml` revisado
- [ ] Primera migración ejecutada
- [ ] Primer push a `main` completado exitosamente
- [ ] Health check verde en GitHub Actions

---

## 📞 Recursos Útiles

- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)
- [GitHub Actions - Azure Login](https://github.com/azure/login)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

**¡Listo para desplegar en Azure!** 🚀
