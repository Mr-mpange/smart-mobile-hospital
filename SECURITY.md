# 🔒 Security Guidelines

## Important: Protecting Your Credentials

### ⚠️ NEVER Commit These Files

The following files contain sensitive information and should **NEVER** be committed to Git:

- `.env` - Your actual environment variables
- `.env.local` - Local environment overrides
- `.env.production` - Production credentials
- Any file with actual API keys or secrets

### ✅ Safe to Commit

- `.env.example` - Template with placeholder values
- Documentation files with generic examples

## Before Pushing to GitHub

### 1. Check for Secrets

```bash
# Make sure .env is not staged
git status

# If .env appears, remove it
git rm --cached .env
```

### 2. Use Placeholder Values in Documentation

**❌ DON'T:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
```

**✅ DO:**
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
AT_API_KEY=your_africas_talking_api_key
```

### 3. Verify .gitignore

Make sure `.gitignore` includes:
```
.env
.env.*
*.env
```

## If You Accidentally Committed Secrets

### Option 1: Remove from Last Commit

```bash
# Remove the file
git rm --cached .env

# Amend the commit
git commit --amend

# Force push (if already pushed)
git push --force
```

### Option 2: Use GitHub's Secret Scanning

1. Go to your repository on GitHub
2. Navigate to Settings → Security → Secret scanning
3. Follow the prompts to allow or revoke the secret
4. **Immediately rotate the exposed credentials**

### Option 3: Rewrite History (Advanced)

```bash
# Use BFG Repo-Cleaner
java -jar bfg.jar --delete-files .env

# Or use git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

## Rotating Compromised Credentials

If you accidentally exposed credentials:

### 1. Africa's Talking

1. Login to dashboard
2. Go to Settings → API Key
3. Click "Regenerate API Key"
4. Update your `.env` file
5. Restart your application

### 2. Zenopay

1. Login to merchant dashboard
2. Go to API Settings
3. Generate new API key
4. Update your `.env` file

### 3. Twilio (if using)

1. Login to Twilio Console
2. Go to Settings → API Keys
3. Delete compromised key
4. Create new API key
5. Update your `.env` file

### 4. Database

```sql
-- Change MySQL password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_secure_password';
FLUSH PRIVILEGES;
```

Update `.env`:
```env
DB_PASSWORD=new_secure_password
```

## Best Practices

### 1. Use Strong Secrets

```bash
# Generate strong JWT secret
openssl rand -base64 32

# Generate random password
openssl rand -base64 24
```

### 2. Different Credentials per Environment

```
Development: .env.development
Staging: .env.staging
Production: .env.production
```

### 3. Use Environment Variables in Production

**Don't store secrets in files on production servers.**

Instead, use:
- Environment variables set by hosting platform
- Secret management services (AWS Secrets Manager, Azure Key Vault)
- Docker secrets
- Kubernetes secrets

### 4. Regular Rotation

Rotate credentials every:
- 90 days (recommended)
- Immediately if compromised
- When team members leave

### 5. Limit Access

- Only give credentials to those who need them
- Use separate credentials for different services
- Implement least privilege principle

## Secure Deployment

### Using Environment Variables

**Heroku:**
```bash
heroku config:set AT_API_KEY=your_key
heroku config:set DB_PASSWORD=your_password
```

**DigitalOcean:**
```bash
# Use App Platform environment variables
# Set in dashboard under Settings → Environment Variables
```

**Docker:**
```bash
docker run -e AT_API_KEY=your_key \
           -e DB_PASSWORD=your_password \
           your-image
```

**Docker Compose:**
```yaml
services:
  app:
    environment:
      - AT_API_KEY=${AT_API_KEY}
      - DB_PASSWORD=${DB_PASSWORD}
```

### Using Secret Files (Production)

```bash
# Create secrets directory (not in git)
mkdir -p /etc/smarthealth/secrets

# Store secrets
echo "your_api_key" > /etc/smarthealth/secrets/at_api_key
chmod 600 /etc/smarthealth/secrets/*

# Read in application
const apiKey = fs.readFileSync('/etc/smarthealth/secrets/at_api_key', 'utf8').trim();
```

## Security Checklist

Before deploying:

- [ ] `.env` is in `.gitignore`
- [ ] No secrets in documentation
- [ ] Strong JWT secret generated
- [ ] Database password is strong
- [ ] API keys are valid
- [ ] Production uses environment variables
- [ ] HTTPS/SSL enabled
- [ ] Firewall configured
- [ ] Regular backups enabled
- [ ] Monitoring setup

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email: security@your-domain.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12 Factor App - Config](https://12factor.net/config)
- [Secrets Management Best Practices](https://www.vaultproject.io/docs/secrets)

---

**Remember:** Security is everyone's responsibility! 🔒

**When in doubt, don't commit it!** ✅
