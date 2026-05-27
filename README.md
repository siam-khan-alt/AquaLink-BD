# মৎস্য বন্ধু - আধুনিক মাছ চাষের ডিজিটাল প্ল্যাটফর্ম

## Project Links

- Live Client Vercel Deployment: [View Live](#)
- Server Endpoint API: [API Documentation](#)
- Client Repository: [GitHub](#)
- Server Repository: [GitHub](#)

---

## Core Business Logic & Monetization Architecture

### Platform Workflows: Two-Role System

**Farmer Ecosystem**

The farmer role operates as the primary production unit within the AquaLink BD platform. Farmers register through secure authentication mechanisms including phone-based OTP verification and Google OAuth integration. Upon successful onboarding, farmers gain access to a comprehensive dashboard that enables:

- Pond Management: Digital registration and monitoring of multiple pond units with real-time water quality metrics including pH levels, dissolved oxygen readings, and temperature tracking
- Expense Tracking: Granular financial logging system categorizing feed purchases, seed investments, fertilizer applications, medicine costs, and miscellaneous operational expenses
- Learning Hub: Access to premium educational content including video tutorials, bootcamp courses, and expert-led training sessions
- AI Disease Diagnosis: Multi-modal image analysis capabilities for early detection of fish diseases using Google Generative AI Vision SDK
- Real-Time Communication: Instant messaging system with admin support channels and peer-to-peer farmer networking via Pusher Channels

**Doctor Consultation Ecosystem**

The doctor role provides expert consultation services to farmers, enabling:

- Schedule Management: Configure weekly availability with time slots for consultation bookings
- Real-Time Availability: Toggle availability status to control when farmers can book consultations
- Consultation Chat: Secure messaging with farmers for diagnosis and treatment recommendations
- Earnings Tracking: Monitor consultation revenue and payment history
- Profile Management: Update professional credentials and consultation rates

**Admin Regulatory Panel**

The admin role serves as the platform governance and quality control authority. Admins possess elevated privileges enabling:

- System Overview: Comprehensive analytics dashboard displaying total registered farmers, active pond counts, verified user statistics, doctor applications, and chat channel activity metrics
- User Management: Verification workflows for farmer accounts, doctor application approvals, role assignment capabilities, and user activity monitoring
- Market Rate Control: Centralized management of fish market pricing data with immediate ISR (Incremental Static Regeneration) propagation across public-facing pages
- Course Administration: Creation, pricing, and management of premium training content and bootcamp programs
- Notification Dispatch: Platform-wide announcement system for critical updates, policy changes, and educational content distribution
- Doctor Applications: Review and approve expert applications for doctor role with credential verification

### Revenue Generation Mechanics

**Premium Up-Skilling Models**

The platform monetizes educational content through a tiered pricing structure. Farmers can purchase access to premium bootcamp courses and training modules via SSLCommerz payment gateway integration. The system supports multiple payment methods including bKash, Nagad, and Rocket, ensuring broad accessibility across Bangladesh's digital payment ecosystem. The payment flow operates through a secure server-side validation process:

1. Course selection and enrollment initiation
2. SSLCommerz payment gateway redirection
3. Transaction completion and callback verification
4. Enrollment status update and course access grant
5. Payment record storage for audit and reconciliation

**SaaS Pond Resource Analytics**

The subscription-based pond monitoring architecture provides scalable analytics capabilities for advanced users. The system tracks:

- Feed expense formulas with historical trend analysis
- Loss diagnostics through comparative yield metrics
- Water quality optimization recommendations
- Seasonal performance benchmarking
- Predictive analytics for harvest timing optimization

This data-driven approach enables farmers to make informed decisions about resource allocation and operational efficiency, with premium tiers offering advanced reporting and AI-powered insights.

**AI Multi-Modal Diagnosis Tiers**

The disease detection module utilizes Google Generative AI Vision SDK to analyze uploaded fish images for disease identification. The current implementation operates under a quota-managed system designed for future subscription gating. The architecture supports:

- Image preprocessing and enhancement
- Multi-class disease classification
- Treatment recommendation generation
- Historical disease pattern tracking
- Regional outbreak monitoring
- Integration with doctor consultation services for expert verification

Future subscription tiers will provide enhanced diagnostic accuracy, unlimited analysis quotas, and priority consultation access.

---

## Complete Feature Breakdown

### Performance Optimization

The platform implements advanced performance optimizations for enhanced user experience:

- Parallel Query Execution: Utilizes TanStack Query's `useQueries` for concurrent data fetching, reducing load times across dashboards
- Skeleton Loading States: Replaced traditional spinners with modern skeleton components for improved perceived performance
- Centralized Configuration: Shared constants for React Query settings (staleTime, refetchInterval) ensure consistent caching behavior
- Type-Safe Architecture: Strict TypeScript typing with zero `any` types ensures compile-time error detection and better IDE support
- Code Quality: Removed debug statements and implemented standardized error handling for production readiness

### Role-Based Access Control

The platform implements a robust authentication and authorization system using NextAuth.js with multiple provider support. Role-based access control ensures that farmers, doctors, and admins have appropriate permissions for their respective functions. The system includes:

- Secure session management with JWT tokens
- Multi-factor authentication support
- Role-based route protection
- Granular permission assignments
- Audit logging for sensitive operations

### Real-Time Chat Sync via Pusher

The messaging infrastructure leverages Pusher Channels for instant communication capabilities. Features include:

- One-to-one direct messaging between farmers and admins
- Group chat functionality for farmer communities
- Admin support channels with priority routing
- Message delivery status tracking
- Typing indicators and read receipts
- Message history with search functionality

### Dynamic Notifications with TanStack Query

The notification system utilizes TanStack Query for efficient data fetching and state management. Key capabilities:

- Real-time notification delivery
- User-specific notification filtering
- Read/unread status tracking
- Notification categorization (system updates, payment confirmations, course announcements, consultation bookings)
- Batch notification processing
- Notification persistence across sessions

### ISR-Backed Admin Market Controls

The market pricing system employs Incremental Static Regeneration for optimal performance. When admins update market rates:

- Static pages regenerate automatically
- Public-facing data updates without full rebuild
- Cache invalidation occurs on-demand
- SEO benefits from static content delivery
- Reduced server load during high traffic periods

### Interactive Financial Expenses Dashboard with Recharts

The expense tracking dashboard provides visual analytics through Recharts integration:

- Monthly expense trend analysis
- Category-wise expense breakdown
- Comparative period reporting
- Export functionality for accounting purposes
- Custom date range filtering
- Multi-currency support with BDT formatting

### Multi-Modal AI Image Disease Detector

The disease diagnosis system combines multiple AI capabilities:

- Image upload and preprocessing
- Google Generative AI Vision analysis
- Disease classification with confidence scores
- Treatment recommendation generation
- Historical disease database for pattern recognition
- Integration with veterinary consultation network

---

## Technology Matrix

### Frontend Stack

- **Framework**: Next.js 15+ with App Router architecture
- **Language**: TypeScript for type safety and enhanced developer experience
- **Styling**: Tailwind CSS for utility-first responsive design
- **State Management**: TanStack Query for server state, React Context for client state
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Icons**: Lucide Icons for consistent iconography
- **Forms**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js with multiple provider support
- **Charts**: Recharts for data visualization
- **Image Optimization**: Next.js Image component for performance

### Backend Stack

- **Runtime**: Node.js with Next.js Serverless Routes
- **Database**: MongoDB with native driver for flexible schema design
- **Real-Time**: Pusher Channels for WebSocket-based communication
- **Payment**: SSLCommerz SDK for secure payment processing
- **AI Integration**: Google Generative AI Vision SDK for disease detection
- **Authentication**: NextAuth.js with session management
- **API**: RESTful API design with Next.js API Routes
- **Validation**: Zod schema validation for data integrity
- **File Upload**: Native Next.js file handling with cloud storage integration

---

## Local Installation Steps

### Prerequisites

Ensure the following are installed on your system:
- Node.js 18+ 
- npm or yarn package manager
- MongoDB instance (local or cloud-hosted)
- Git for version control

### Repository Setup

Clone the repository to your local machine:

```bash
git clone [repository-url]
cd aqualink-bd
```

### Dependency Installation

Install all required dependencies:

```bash
npm install
# or
yarn install
```

### Environment Configuration

Create a `.env.local` file in the root directory and configure the following environment variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/aqualink-bd
# or use MongoDB Atlas connection string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Firebase Configuration (for phone authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id

# Pusher Channels Configuration
NEXT_PUBLIC_PUSHER_APP_ID=your-pusher-app-id
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_CLUSTER=your-pusher-cluster
NEXT_PUBLIC_PUSHER_HOST=your-pusher-host

# SSLCommerz Payment Gateway
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_IS_SANDBOX=true

# Google Generative AI
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Initialization

Ensure your MongoDB instance is running. The application will automatically create necessary collections on first run.

### Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Build

For production deployment:

```bash
npm run build
npm start
```

### Additional Scripts

- `npm run lint` - Run ESLint for code quality checks
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Troubleshooting

If you encounter issues during setup:

1. Ensure all environment variables are properly configured
2. Verify MongoDB connection string is correct and database is accessible
3. Check that all API keys and secrets are valid
4. Clear node_modules and reinstall dependencies if necessary
5. Review browser console for runtime errors

---

## Support and Documentation

For additional support, refer to the project documentation or contact the development team through the provided communication channels.

---

## License

This project is proprietary software. All rights reserved.
