# EventCulture Tiered User System

## Overview

The EventCulture Multi-AI-Agent System now includes a comprehensive tiered user model with **Free** and **Pro** versions. This system provides different levels of access and features based on the user's subscription tier.

## 🎯 Key Features

### Free Tier
- ✅ View all events
- ✅ Up to 10 personalized recommendations per session
- ✅ Basic location features (Google Maps view only)
- ✅ Event browsing and discovery
- ✅ Basic analytics for user interactions
- ❌ Cannot register for virtual events
- ❌ Cannot book events directly
- ❌ No advanced location features (directions)
- ❌ No priority customer support

### Pro Tier ($9.99/month)
- ✅ Everything in Free tier
- ✅ Unlimited personalized recommendations
- ✅ Direct event booking
- ✅ Enhanced location features with directions
- ✅ Virtual event registration
- ✅ Priority customer support
- ✅ Advanced analytics and insights
- ✅ Early access to new features

## 🏗️ Architecture

### Database Changes

#### User Model Updates
```python
class User(Base):
    # ... existing fields ...
    tier = Column(String, default="free")  # "free" or "pro"
    subscription_status = Column(String, default="active")
    subscription_start_date = Column(DateTime, nullable=True)
    subscription_end_date = Column(DateTime, nullable=True)
    recommendation_count = Column(Integer, default=0)
```

#### New Subscription Model
```python
class UserSubscription(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    tier = Column(String)  # "free" or "pro"
    status = Column(String)  # "active", "expired", "cancelled"
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    upgrade_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### Authentication Flow

1. **Tier Selection**: Users select their preferred tier before logging in
2. **Google OAuth**: Standard Google authentication with tier information
3. **Session Management**: Tier information stored in user session
4. **Upgrade Path**: Free users can upgrade to Pro at any time

### API Endpoints

#### New Endpoints
- `POST /select-tier` - Store selected tier before login
- `POST /user/upgrade` - Upgrade user from Free to Pro
- `GET /directions` - Get directions (Pro only)

#### Modified Endpoints
- All recommendation endpoints now respect tier limits
- Event booking endpoints check for Pro tier
- Location endpoints provide enhanced features for Pro users

## 🎨 Frontend Components

### New Components
- **TierSelection**: Beautiful tier selection interface before login
- **UpgradePrompt**: Modal for Free users to upgrade to Pro
- **TierBadge**: Visual indicator of user's current tier

### Updated Components
- **UserDashboard**: Shows tier-specific features and limitations
- **EventCard**: Displays tier-based restrictions and upgrade prompts
- **HomePage**: Includes tier selection in login flow

## 🔒 Access Control Implementation

### Recommendation Limits
```python
def get_personalized_recommendations(user_id, interests, sentiment, user_tier="free"):
    # ... logic ...
    if user_tier == "free":
        return recommended_events[:10]  # Max 10 for free users
    else:
        return recommended_events[:50]  # More for pro users
```

### Virtual Event Restrictions
```python
# Check virtual event restrictions for free users
is_virtual = (event.location and 'virtual' in event.location.lower())
if is_virtual and user_tier == "free":
    continue  # Skip virtual events for free users
```

### Booking Restrictions
```python
@router.post("/events/{event_id}/book")
def book_event(event_id: int, current_user: dict = Depends(get_current_user)):
    user_tier = current_user.get("tier", "free")
    if user_tier == "free":
        raise HTTPException(status_code=403, detail="Pro tier required for direct event booking")
```

## 🎨 UI/UX Features

### Tier Selection Interface
- Beautiful gradient design with clear feature comparison
- Popular tier highlighting
- Responsive design for all devices
- Clear pricing and feature lists

### Upgrade Prompts
- Contextual upgrade suggestions
- Feature limitation indicators
- One-click upgrade process
- Success feedback and tier updates

### Visual Indicators
- Tier badges throughout the interface
- Feature availability indicators
- Upgrade buttons in relevant contexts
- Clear limitation messaging

## 🚀 Getting Started

### 1. Database Migration
```bash
# The new models will be created automatically when the server starts
# No manual migration needed for development
```

### 2. Environment Variables
```bash
# Add to your .env file
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

### 3. Start the Application
```bash
# Backend
cd backend
python -m uvicorn main:app --reload

# Frontend
cd frontend
npm start
```

## 🧪 Testing

Run the tiered user flow test:
```bash
python test_tiered_user_flow.py
```

## 📊 Analytics & Tracking

### User Engagement Metrics
- Tier distribution analytics
- Upgrade conversion rates
- Feature usage by tier
- User retention by subscription level

### Business Intelligence
- Revenue tracking per tier
- Feature adoption rates
- User satisfaction metrics
- Churn analysis

## 🔮 Future Enhancements

### Planned Features
- **Annual Subscription Discounts**: 20% off for yearly Pro subscriptions
- **Family Plans**: Multi-user Pro accounts
- **Enterprise Tier**: Custom features for organizations
- **Referral Program**: Credits for referring new users
- **Loyalty Rewards**: Benefits for long-term subscribers

### Technical Improvements
- **Payment Integration**: Stripe/PayPal integration for real payments
- **Subscription Management**: Self-service subscription changes
- **Usage Analytics**: Detailed feature usage tracking
- **A/B Testing**: Tier feature experimentation

## 🛠️ Development Notes

### Code Organization
- Tier logic is centralized in authentication and recommendation modules
- Frontend components are modular and reusable
- Database models follow clear naming conventions
- API endpoints maintain RESTful principles

### Performance Considerations
- Recommendation limits reduce database load for free users
- Caching strategies for tier-based feature checks
- Efficient querying for subscription status
- Optimized frontend rendering for tier-specific UI

### Security
- Tier information is validated on both frontend and backend
- Subscription status is checked for all premium features
- User data is properly isolated by tier
- Payment information is handled securely (when implemented)

## 📞 Support

For questions about the tiered user system:
- Check the test file for usage examples
- Review the API documentation for endpoint details
- Examine the frontend components for UI patterns
- Consult the database models for data structure

---

**Built with ❤️ for EventCulture Multi-AI-Agent System**
