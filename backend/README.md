# PropIQ Backend

FastAPI-based backend for PropIQ real estate investment analysis platform.

## Features

- **Authentication:** JWT-based user authentication with MongoDB persistence
- **Property Analysis:** AI-powered investment analysis using OpenAI GPT-4o
- **Payment Processing:** Stripe subscription management
- **Email Marketing:** SendGrid integration for email campaigns
- **RESTful API:** Well-documented FastAPI endpoints

## Tech Stack

- Python 3.11
- FastAPI 0.115.0
- MongoDB (via PyMongo)
- OpenAI GPT-4o-mini
- Stripe
- SendGrid
- JWT authentication

## Setup

### Local Development

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
uvicorn api:app --reload --port 8000
```

The API will be available at:
- http://localhost:8000
- API docs: http://localhost:8000/docs
- OpenAPI schema: http://localhost:8000/openapi.json

### Environment Variables

Create a `.env` file with:

```bash
# Environment
ENVIRONMENT=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your-secret-key-change-in-production

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Stripe
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG....
FROM_EMAIL=your-email@domain.com

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

## API Structure

```
routers/
├── propiq.py       # Property analysis endpoints
├── payment.py      # Stripe payment integration
├── marketing.py    # Email marketing (SendGrid)
├── email.py        # Email utilities
├── templates.py    # Email templates
└── send_test.py    # Testing utilities

api.py              # Main FastAPI application
auth.py             # Authentication routes & logic
config.py           # Configuration management
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/users/{user_id}` - Get user profile (requires auth)

### PropIQ (Property Analysis)
- `POST /propiq/analyze` - Analyze property investment
  - Requires JWT authentication
  - Returns AI-generated analysis with ROI, risks, recommendations
- `GET /propiq/health` - Health check

### Stripe Payments
- `POST /stripe/create-checkout-session` - Create Stripe checkout
- `GET /stripe/subscription` - Check subscription status
- `GET /stripe/health` - Health check

### Marketing
- `POST /marketing/subscribe` - Subscribe to email list
- `GET /marketing/health` - Health check

### General
- `GET /health` - Main health check with build info
- `GET /` - Root endpoint

## Testing

```bash
# Run tests (when implemented)
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=. --cov-report=html
```

## Deployment

### Azure (Current)

Deploy to Azure Container Registry + Azure Web App:

```bash
./deploy-azure.sh
```

See `../docs/DEPLOY_NOW.md` for detailed instructions.

### Docker

Build and run locally:

```bash
# Build image
docker build -t propiq-backend .

# Run container
docker run -p 8000:8000 --env-file .env propiq-backend
```

### Other Platforms

See `../../PLATFORM_COMPARISON_PROPIQ.md` for deployment options on:
- Supabase (recommended for cost savings)
- Render
- Railway
- Fly.io

## Security Notes

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use bcrypt for password hashing (currently SHA-256)
- [ ] Enable HTTPS only
- [ ] Restrict `ALLOWED_ORIGINS` to production domains
- [ ] Use environment variables for all secrets (never commit)
- [ ] Enable Stripe webhook signature verification
- [ ] Set up proper logging and monitoring
- [ ] Configure rate limiting
- [ ] Review CORS settings

### Current Limitations

1. **Password Hashing:** Uses SHA-256, should upgrade to bcrypt
2. **Rate Limiting:** Not implemented
3. **Input Validation:** Basic validation, could be more robust
4. **Trial Tracking:** Usage limits not enforced yet

## Code Style

- Follow PEP 8
- Use type hints
- Document all endpoints with docstrings
- Keep routers in `api/` directory
- Use Pydantic models for request/response validation

## Dependencies

Core dependencies (see `requirements.txt` for full list):

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic[email]==2.10.0
pymongo==4.10.1
PyJWT==2.10.1
openai==1.47.1
stripe==12.4.0
sendgrid==6.11.0
python-dotenv==1.1.1
```

## Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
# Check MONGODB_URI format
# mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**CORS Errors:**
```bash
# Add frontend URL to ALLOWED_ORIGINS
ALLOWED_ORIGINS=http://localhost:5173
```

**OpenAI API Errors:**
```bash
# Verify API key is valid
# Check OpenAI account has credits
```

**Import Errors:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

## Performance

- FastAPI async support for concurrent requests
- MongoDB connection pooling
- Efficient OpenAI API usage (GPT-4o-mini for cost)
- Caching can be added for frequently accessed data

## Monitoring

Health check endpoint returns:
- Build hash (git commit)
- Build timestamp
- Environment
- Python version

Use for:
- Deployment verification
- Uptime monitoring
- Version tracking

## Contributing

When adding new features:

1. Create new router in `api/` directory
2. Import and register in `api.py`
3. Add tests
4. Update API documentation
5. Update this README

## License

Proprietary - LUNTRA
