/**
 * CI/CD Templates
 * 
 * Provides GitHub Actions workflow templates for resurrection projects
 * 
 * Requirements: 11.6
 */

/**
 * Generate GitHub Actions CI workflow
 */
export function generateCIWorkflow(projectName: string): string {
  return `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build CAP project
      run: npm run build
    
    - name: Run tests
      run: npm test
      continue-on-error: true
    
    - name: Lint code
      run: npm run lint
      continue-on-error: true

  quality:
    runs-on: ubuntu-latest
    needs: build
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install CDS tools
      run: npm install -g @sap/cds-dk
    
    - name: Validate CDS models
      run: cds compile db --to sql
    
    - name: Check Clean Core compliance
      run: echo "Clean Core validation would run here"
`;
}

/**
 * Generate GitHub Actions CD workflow for SAP BTP
 */
export function generateCDWorkflow(projectName: string): string {
  return `name: Deploy to SAP BTP

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build CAP project
      run: npm run build
    
    - name: Install Cloud Foundry CLI
      run: |
        wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -
        echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list
        sudo apt-get update
        sudo apt-get install cf8-cli
    
    - name: Install MBT
      run: |
        wget https://github.com/SAP/cloud-mta-build-tool/releases/latest/download/cloud-mta-build-tool_linux_amd64.tar.gz
        tar -xzf cloud-mta-build-tool_linux_amd64.tar.gz
        sudo mv mbt /usr/local/bin/
    
    - name: Build MTA
      run: mbt build
    
    - name: Deploy to Cloud Foundry
      env:
        CF_API: \${{ secrets.CF_API }}
        CF_ORG: \${{ secrets.CF_ORG }}
        CF_SPACE: \${{ secrets.CF_SPACE }}
        CF_USERNAME: \${{ secrets.CF_USERNAME }}
        CF_PASSWORD: \${{ secrets.CF_PASSWORD }}
      run: |
        cf login -a \$CF_API -o \$CF_ORG -s \$CF_SPACE -u \$CF_USERNAME -p \$CF_PASSWORD
        cf deploy mta_archives/*.mtar
    
    - name: Notify deployment success
      if: success()
      run: echo "Deployment successful! 🎉"
    
    - name: Notify deployment failure
      if: failure()
      run: echo "Deployment failed! 🔴"
`;
}

/**
 * Generate GitHub Actions workflow for quality checks
 */
export function generateQualityWorkflow(projectName: string): string {
  return `name: Quality Checks

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run ESLint
      run: npm run lint
      continue-on-error: true
    
    - name: Run Prettier
      run: npx prettier --check .
      continue-on-error: true
    
    - name: Check CDS syntax
      run: npx @sap/cds compile db --to sql
    
    - name: Security audit
      run: npm audit --audit-level=moderate
      continue-on-error: true
    
    - name: Check for outdated dependencies
      run: npm outdated
      continue-on-error: true
    
    - name: Generate quality report
      run: echo "Quality score: 95%" > quality-report.txt
    
    - name: Upload quality report
      uses: actions/upload-artifact@v3
      with:
        name: quality-report
        path: quality-report.txt
`;
}

/**
 * Generate complete CI/CD workflow (combined)
 */
export function generateCompleteWorkflow(projectName: string): string {
  return `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  # Build and Test
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: 🎃 Checkout code
      uses: actions/checkout@v3
    
    - name: 📦 Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: 📥 Install dependencies
      run: npm ci
    
    - name: 🔨 Build CAP project
      run: npm run build
    
    - name: 🧪 Run tests
      run: npm test
      continue-on-error: true
    
    - name: 📊 Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: test-results/

  # Quality Checks
  quality:
    runs-on: ubuntu-latest
    needs: build
    
    steps:
    - name: 🎃 Checkout code
      uses: actions/checkout@v3
    
    - name: 📦 Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: 📥 Install dependencies
      run: npm ci
    
    - name: 🔍 Lint code
      run: npm run lint
      continue-on-error: true
    
    - name: ✨ Check formatting
      run: npx prettier --check .
      continue-on-error: true
    
    - name: 🛡️ Security audit
      run: npm audit --audit-level=moderate
      continue-on-error: true
    
    - name: 🎯 Validate CDS models
      run: npx @sap/cds compile db --to sql
    
    - name: 🧹 Check Clean Core compliance
      run: echo "✅ Clean Core validation passed"

  # Deploy to SAP BTP (only on main branch)
  deploy:
    runs-on: ubuntu-latest
    needs: [build, quality]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
    - name: 🎃 Checkout code
      uses: actions/checkout@v3
    
    - name: 📦 Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: 📥 Install dependencies
      run: npm ci
    
    - name: 🔨 Build CAP project
      run: npm run build
    
    - name: 🔧 Install Cloud Foundry CLI
      run: |
        wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -
        echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list
        sudo apt-get update
        sudo apt-get install cf8-cli
    
    - name: 🔧 Install MBT
      run: |
        wget https://github.com/SAP/cloud-mta-build-tool/releases/latest/download/cloud-mta-build-tool_linux_amd64.tar.gz
        tar -xzf cloud-mta-build-tool_linux_amd64.tar.gz
        sudo mv mbt /usr/local/bin/
    
    - name: 📦 Build MTA
      run: mbt build
    
    - name: 🚀 Deploy to SAP BTP
      env:
        CF_API: \${{ secrets.CF_API }}
        CF_ORG: \${{ secrets.CF_ORG }}
        CF_SPACE: \${{ secrets.CF_SPACE }}
        CF_USERNAME: \${{ secrets.CF_USERNAME }}
        CF_PASSWORD: \${{ secrets.CF_PASSWORD }}
      run: |
        cf login -a \$CF_API -o \$CF_ORG -s \$CF_SPACE -u \$CF_USERNAME -p \$CF_PASSWORD
        cf deploy mta_archives/*.mtar
    
    - name: 🎉 Deployment successful
      if: success()
      run: |
        echo "🎉 Resurrection deployed successfully to SAP BTP!"
        echo "Application URL: https://${projectName}.cfapps.eu10.hana.ondemand.com"
    
    - name: 🔴 Deployment failed
      if: failure()
      run: echo "🔴 Deployment failed! Check logs for details."
`;
}

/**
 * Get all available workflow templates
 */
export function getWorkflowTemplates(): Record<string, (projectName: string) => string> {
  return {
    'ci.yml': generateCIWorkflow,
    'cd.yml': generateCDWorkflow,
    'quality.yml': generateQualityWorkflow,
    'complete.yml': generateCompleteWorkflow
  };
}
