Write-Host "Starting project cleanup..." -ForegroundColor Green

# Create essential directories
Write-Host "Creating directories..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path client/src/components
New-Item -ItemType Directory -Force -Path client/src/types
New-Item -ItemType Directory -Force -Path client/src/utils
New-Item -ItemType Directory -Force -Path server/src/controllers
New-Item -ItemType Directory -Force -Path server/src/routes
New-Item -ItemType Directory -Force -Path server/src/types
New-Item -ItemType Directory -Force -Path server/src/utils
New-Item -ItemType Directory -Force -Path server/prisma

# Remove redundant files
Write-Host "Removing redundant files..." -ForegroundColor Green
Remove-Item -Force -ErrorAction SilentlyContinue `
    client/README.md, `
    server/README.md, `
    client/.gitignore, `
    server/.gitignore, `
    client/src/App.test.tsx, `
    client/src/setupTests.ts, `
    client/src/reportWebVitals.ts, `
    client/src/logo.svg, `
    client/public/logo*.png, `
    client/public/manifest.json, `
    client/public/robots.txt

# Create client types
$typesContent = @"
export type Account = {
  id: string;
  accountName: string;
  businessUnit: 'NEW_NORTH' | 'IDEOMETRY' | 'MOTION' | 'SPOKE';
  engagementType: 'STRATEGIC' | 'TACTICAL';
  priority: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
  accountManager: string;
  teamManager: string;
  relationshipStartDate: Date;
  contractStartDate: Date;
  contractRenewalEnd: Date;
  services: ('ABM' | 'PAID' | 'CONTENT' | 'SEO' | 'REPORTING' | 'SOCIAL' | 'WEBSITE')[];
  pointsPurchased: number;
  pointsDelivered: number;
  delivery: string;
  recurringPointsAllotment: number;
  mrr: number;
  growthInMrr: number;
  potentialMrr: number;
  website: string | null;
  linkedinProfile: string | null;
  industry: string;
  annualRevenue: number;
  employees: number;
};

export interface AccountResponse extends Account {
  clientTenure: number;
  pointsBalance: number;
  pointsStrikingDistance: number;
}
"@

Set-Content -Path "client/src/types/index.ts" -Value $typesContent

# Create AccountDetails component
$accountDetailsContent = @"
import React from 'react';
import { AccountResponse } from '../types';

interface Props {
  account: AccountResponse;
}

export const AccountDetails: React.FC<Props> = ({ account }) => {
  return (
    <div className="account-card">
      <h2>{account.accountName}</h2>
      <div className="account-info">
        <p>Business Unit: {account.businessUnit}</p>
        <p>Engagement Type: {account.engagementType}</p>
        <p>Priority: {account.priority}</p>
        <p>Client Tenure: {account.clientTenure} months</p>
        <p>Points Balance: {account.pointsBalance}</p>
      </div>
    </div>
  );
};
"@

Set-Content -Path "client/src/components/AccountDetails.tsx" -Value $accountDetailsContent

# Create index.tsx
$indexContent = @"
import React from "react";
import ReactDOM from "react-dom/client";

const App = () => <div>Hello World</div>;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@

Set-Content -Path "client/src/index.tsx" -Value $indexContent -Encoding UTF8

# Create App.tsx
$appContent = @"
import React, { useEffect, useState } from 'react';
import { AccountDetails } from './components/AccountDetails';
import { AccountResponse } from './types';

function App() {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);

  useEffect(() => {
    fetch('http://localhost:3002/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.data));
  }, []);

  return (
    <div className="App">
      <h1>Growth Manager</h1>
      <div className="accounts-list">
        {accounts.map(account => (
          <AccountDetails key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
}

export default App;
"@

Set-Content -Path "client/src/App.tsx" -Value $appContent

# List of essential files to keep/create
$ESSENTIAL_FILES = @(
    "server/package.json",
    "client/package.json",
    "server/src/controllers/accountController.ts",
    "server/.env",
    "server/src/types/index.ts",
    "client/src/components/AccountDetails.tsx",
    "server/src/utils/calculations.ts",
    "server/src/routes/accountRoutes.ts",
    "client/src/utils/calculations.ts",
    "server/prisma/schema.prisma"
)

# Create/verify essential files
Write-Host "Verifying essential files..." -ForegroundColor Green
foreach ($file in $ESSENTIAL_FILES) {
    if (-not (Test-Path $file)) {
        Write-Host "Missing: $file" -ForegroundColor Red
        New-Item -ItemType File -Force -Path $file
        Write-Host "Created: $file" -ForegroundColor Green
    } else {
        Write-Host "Exists: $file" -ForegroundColor Green
    }
}

Write-Host "Cleanup complete!" -ForegroundColor Green 