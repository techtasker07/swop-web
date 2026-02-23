# Time Banking System Implementation

## Overview
Complete Time Banking system implementation for the Swopify web app, matching the mobile app functionality.

## Database Schema

### Tables Required

#### 1. time_banking_requests
```sql
CREATE TABLE time_banking_requests (
    id SERIAL PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    hours_requested DECIMAL(6,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    location VARCHAR(255),
    meeting_time TIMESTAMP WITH TIME ZONE,
    completion_code VARCHAR(10),
    rejection_reason TEXT,
    requester_name VARCHAR(255),
    provider_name VARCHAR(255),
    provider_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```

#### 2. time_banking_transactions
```sql
CREATE TABLE time_banking_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL,
    hours DECIMAL(6,2) NOT NULL,
    description TEXT NOT NULL,
    related_request_id INTEGER REFERENCES time_banking_requests(id),
    related_user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features

### 1. Time Balance Display
- Shows total time credits (earned - spent)
- Displays earned and spent hours separately
- Collapsible card design

### 2. Request Management
Four tabs:
- **Available**: Open requests from other users
- **My Requests**: User's own requests
- **Accepted**: Requests user has accepted to help with
- **History**: Completed requests

### 3. Create Request
- Title and description
- Hours estimation
- Category selection (General, Physical, Professional, Education, Pet Care)
- Location specification
- Form validation

### 4. Offer Help
- View request details
- Send message to requester
- Accept request

### 5. Complete Request
- Generate completion code
- Verify completion
- Automatic time credit transfer

## Components Structure

```
app/
  time-banking/
    page.tsx                    # Main Time Banking page
    
components/
  time-banking/
    time-balance-card.tsx       # Balance display
    request-card.tsx            # Request item card
    create-request-dialog.tsx   # Create request form
    offer-help-dialog.tsx       # Offer help form
    request-details-dialog.tsx  # View/complete request
    
lib/
  services/
    time-banking-service.ts     # Time Banking API service
```

## Implementation Files

### 1. Time Banking Service
Handles all API calls:
- `getRequests()` - Fetch requests with filters
- `getUserBalance()` - Get user's time balance
- `createRequest()` - Create new request
- `acceptRequest()` - Accept a request
- `completeRequest()` - Complete request with code
- `cancelRequest()` - Cancel request
- `getTransactions()` - Get transaction history

### 2. Main Page
- Tab navigation
- Request lists
- Balance card
- Create request button

### 3. Request Cards
- Display request information
- Action buttons (Offer Help, View, Complete)
- Status badges
- Category tags

### 4. Dialogs
- Create Request: Form to post new request
- Offer Help: Accept request with message
- Request Details: View details and complete

## User Flows

### Request Help Flow
1. User clicks "Create Request"
2. Fills form (title, description, hours, category, location)
3. Submits request
4. Request appears in "My Requests" tab with "open" status
5. Other users see it in "Available" tab

### Offer Help Flow
1. User browses "Available" tab
2. Clicks "Offer Help" on a request
3. Sends message to requester
4. Request moves to "Accepted" tab
5. Requester sees provider info in "My Requests"

### Complete Request Flow
1. Provider completes the help
2. Requester clicks "Complete" in "My Requests"
3. System generates completion code
4. Requester shares code with provider
5. Provider enters code in "Accepted" tab
6. System verifies code
7. Time credits transferred (provider earns, requester spends)
8. Request moves to "History" for both users

## Integration Points

### 1. Dashboard
- Display time balance in stats
- Quick action to request/offer help

### 2. Trade Proposals
- Already integrated (can propose trades with time banking hours)
- Time balance validation

### 3. Profile
- Show time banking stats
- Transaction history

## Categories

1. **General** - General help and assistance
2. **Physical** - Moving, cleaning, yard work
3. **Professional** - Skills, consulting, tutoring
4. **Education** - Teaching, mentoring, lessons
5. **Pet Care** - Pet sitting, walking, grooming

## Status Flow

```
open → accepted → completed
  ↓        ↓
cancelled  cancelled
```

- **open**: Request posted, no provider yet
- **accepted**: Provider assigned, work in progress
- **completed**: Work done, credits transferred
- **cancelled**: Request cancelled by requester or provider

## Time Credit Rules

1. **Earning**: Provider earns hours when request is completed
2. **Spending**: Requester spends hours when request is completed
3. **Balance**: Can go negative (trust-based system)
4. **1 Hour = 1 Hour**: Simple 1:1 exchange rate

## Security & Validation

1. **RLS Policies**: Users can only see relevant requests
2. **Completion Code**: 6-digit code for verification
3. **Balance Validation**: Check before proposing trades
4. **Form Validation**: Required fields, hour limits
5. **Status Checks**: Prevent invalid state transitions

## Testing Checklist

- [ ] Database migration applied
- [ ] Create request works
- [ ] View available requests
- [ ] Offer help works
- [ ] Accept request updates status
- [ ] Complete request generates code
- [ ] Code verification works
- [ ] Time credits transfer correctly
- [ ] Balance displays correctly
- [ ] Transaction history shows
- [ ] Cancel request works
- [ ] RLS policies work correctly
- [ ] Mobile responsive design
- [ ] Error handling works

## Future Enhancements

1. **Notifications**: Alert users of new requests, acceptances, completions
2. **Ratings**: Rate providers after completion
3. **Search & Filter**: Search requests by category, location, hours
4. **Recurring Requests**: Schedule regular help
5. **Group Requests**: Multiple providers for one request
6. **Time Banking Marketplace**: Browse providers offering specific skills
7. **Analytics**: Track most requested categories, average hours
8. **Badges**: Reward active community members

## Migration Steps

1. Run `time_banking_updates_migration.sql` in Supabase
2. Verify tables exist with correct columns
3. Check RLS policies are active
4. Test with sample data
5. Deploy web app components
6. Test end-to-end flows

## Notes

- Time Banking is a trust-based system
- Balances can go negative to encourage participation
- Focus on community building and mutual aid
- Simple 1:1 hour exchange keeps it fair
- Completion codes prevent fraud
