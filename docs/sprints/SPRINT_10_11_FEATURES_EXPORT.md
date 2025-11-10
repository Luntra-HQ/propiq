# Sprint 10-11: Features & Export

**Version:** 3.10.0
**Sprint:** 10-11 (Combined 2-week sprint)
**Date Started:** 2025-11-07
**Status:** 🔄 IN PROGRESS

---

## Executive Summary

Sprint 10-11 focuses on building advanced features and export capabilities to increase user value and engagement. These sprints add key functionality that transforms PropIQ from a basic analysis tool into a professional-grade investment platform.

**Team Composition:**
- Backend Developer: 1 FTE
- Frontend Developer: 1 FTE
- Designer: 0.5 FTE

**Duration:** 2 weeks (combined sprint)

---

## Sprint Goals

### Primary Objectives
1. ✅ PDF Export - Professional analysis reports
2. 📋 Excel/CSV Export - Data portability
3. 📋 Property Comparison - Side-by-side analysis (up to 5 properties)
4. 📋 Saved Properties - Favorites & collections
5. 📋 Analysis History - Search, filter, sort
6. 📋 Share Analysis - Public links with expiration
7. 📋 Advanced Filters - Market, price range, deal score
8. 📋 Batch Analysis - Multiple addresses at once

### Secondary Objectives
9. 📋 Property Notes - User annotations
10. 📋 Analysis Templates - Custom criteria
11. 📋 Market Insights - Neighborhood trends
12. 📋 Email Reports - Scheduled digest

---

## Task Breakdown

### Task 1: PDF Export System (High Priority) ✅

**Why Important:**
- Professional investors need printable reports
- Portfolio presentations require polished documents
- Offline analysis review
- Client sharing without PropIQ access

**Requirements:**
- Generate professional PDF from analysis data
- Include PropIQ branding (header, footer, watermark)
- Charts & graphs visualization
- Multi-page layout (executive summary + details)
- Download button in analysis view
- Email delivery option

**Technical Approach:**
- **Backend:** WeasyPrint or ReportLab (Python PDF libraries)
- **Frontend:** Download trigger with loading state
- **Storage:** Temporary S3/Azure Blob for large PDFs
- **Format:** Letter size (8.5"x11"), portrait

**API Endpoints:**
- `POST /api/v1/propiq/analyses/{id}/export/pdf` - Generate PDF
- `GET /api/v1/propiq/exports/{export_id}/download` - Download PDF

**PDF Structure:**
```
Page 1: Executive Summary
- Property photo/map
- Address & basic info
- Deal score (large, prominent)
- Key metrics (cash flow, ROI, cap rate)
- Investment recommendation

Page 2: Financial Analysis
- Income analysis (rent, other income)
- Expense breakdown (mortgage, taxes, insurance, maintenance)
- Cash flow projection (5 years)
- Return metrics table

Page 3: Market Analysis
- Neighborhood overview
- Comparable properties
- Market trends
- Risk assessment

Page 4: Detailed Assumptions
- Purchase details
- Financing terms
- Operating assumptions
- Exit strategy

Footer: PropIQ branding, disclaimer, timestamp
```

---

### Task 2: Excel/CSV Export (High Priority)

**Why Important:**
- Users want data in their own tools (Excel, Google Sheets)
- Financial modeling in Excel
- Portfolio tracking spreadsheets
- Integration with other software

**Requirements:**
- Export analysis to Excel (.xlsx)
- Export analysis to CSV
- Multiple export formats:
  - Single analysis
  - Multiple analyses (bulk)
  - Comparison table
- Include all raw data and calculated metrics
- Formatted Excel with sheets (Summary, Details, Assumptions)

**Technical Approach:**
- **Backend:** openpyxl (Excel) or pandas (CSV)
- **Frontend:** Download buttons with format selection
- **Files:** Temporary storage, auto-delete after 24 hours

**API Endpoints:**
- `POST /api/v1/propiq/analyses/{id}/export/excel` - Excel export
- `POST /api/v1/propiq/analyses/{id}/export/csv` - CSV export
- `POST /api/v1/propiq/analyses/export/batch` - Bulk export

**Excel Structure:**
```
Sheet 1: Summary
- Property info
- Key metrics
- Deal score
- Recommendation

Sheet 2: Cash Flow
- Monthly income/expenses
- 5-year projection
- Charts (if possible)

Sheet 3: Assumptions
- All input parameters
- Market assumptions
- Financing details

Sheet 4: Comparables
- Comparable properties data
```

---

### Task 3: Property Comparison (High Priority)

**Why Important:**
- Investors compare multiple properties before deciding
- Side-by-side view makes differences clear
- Faster decision-making

**Requirements:**
- Compare up to 5 properties side-by-side
- Side-by-side metrics table
- Highlight best/worst performers
- Visual indicators (green/red)
- Export comparison as PDF/Excel
- Save comparison for later review

**Technical Approach:**
- **Frontend:** Comparison grid/table component
- **Backend:** Bulk analysis fetch endpoint
- **State:** Selected properties stored in localStorage
- **UI:** Sticky header, horizontal scroll on mobile

**API Endpoints:**
- `POST /api/v1/propiq/analyses/compare` - Get multiple analyses
- `POST /api/v1/propiq/comparisons` - Save comparison
- `GET /api/v1/propiq/comparisons` - List saved comparisons

**UI Layout:**
```
+----------+----------+----------+----------+
| Metric   | Prop A   | Prop B   | Prop C   |
+----------+----------+----------+----------+
| Address  | 123 Main | 456 Oak  | 789 Elm  |
| Price    | $200k    | $250k    | $180k    |
| Deal     | 85 🟢    | 72 🟡    | 45 🔴    |
| Cash     | +$500    | +$320    | -$50     |
| ROI      | 12%      | 8%       | 4%       |
+----------+----------+----------+----------+
```

---

### Task 4: Saved Properties & Favorites

**Why Important:**
- Track promising properties
- Organize by investment strategy
- Return to analysis without re-analyzing
- Collections (e.g., "Austin Multifamily", "Fix & Flip")

**Requirements:**
- Star/favorite button on analysis cards
- Collections/folders for organization
- Quick filters (favorites, recent, archived)
- Drag-and-drop collection management
- Collection sharing (optional)

**Technical Approach:**
- **Backend:** New `favorites` and `collections` tables
- **Frontend:** Heart icon toggle, collection manager
- **Database:** Many-to-many relationship (analyses ↔ collections)

**API Endpoints:**
- `POST /api/v1/propiq/favorites` - Add to favorites
- `DELETE /api/v1/propiq/favorites/{analysis_id}` - Remove favorite
- `POST /api/v1/propiq/collections` - Create collection
- `POST /api/v1/propiq/collections/{id}/analyses` - Add to collection
- `GET /api/v1/propiq/collections` - List collections

**Database Schema:**
```sql
CREATE TABLE favorites (
  user_id UUID,
  analysis_id UUID,
  created_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, analysis_id)
);

CREATE TABLE collections (
  id UUID PRIMARY KEY,
  user_id UUID,
  name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ
);

CREATE TABLE collection_analyses (
  collection_id UUID,
  analysis_id UUID,
  added_at TIMESTAMPTZ,
  PRIMARY KEY (collection_id, analysis_id)
);
```

---

### Task 5: Enhanced Analysis History

**Why Important:**
- Users perform dozens of analyses
- Finding past analysis is hard without search
- Bulk actions save time

**Requirements:**
- Search by address, city, zip code
- Filter by:
  - Deal score range
  - Date range
  - Property type
  - Favorites
  - Collections
- Sort by:
  - Date (newest/oldest)
  - Deal score (high/low)
  - Address (A-Z)
  - Cash flow (high/low)
- Bulk actions:
  - Delete multiple
  - Add to collection
  - Export selected
- Pagination (20 per page)
- View modes: List, Grid, Map (bonus)

**Technical Approach:**
- **Backend:** PostgreSQL full-text search, complex queries
- **Frontend:** SearchBar, FilterPanel, SortDropdown
- **Performance:** Database indexes on search fields

**API Endpoints:**
- `GET /api/v1/propiq/analyses?search=austin&score_min=70&sort=score_desc&page=1`
- `DELETE /api/v1/propiq/analyses/batch` - Bulk delete
- `POST /api/v1/propiq/analyses/batch/export` - Bulk export

---

### Task 6: Share Analysis Feature

**Why Important:**
- Share with partners, lenders, clients
- Collaboration without account
- Marketing (public portfolio)

**Requirements:**
- Generate shareable link
- Public view (no login required)
- Expiration options (7 days, 30 days, never)
- Password protection (optional)
- Revoke access anytime
- Track views (analytics)
- PropIQ branding with "Create your own" CTA

**Technical Approach:**
- **Backend:** Generate unique share tokens
- **Frontend:** Share modal with link copy
- **Security:** Rate limiting on public endpoints
- **Storage:** Shared links in database

**API Endpoints:**
- `POST /api/v1/propiq/analyses/{id}/share` - Create share link
- `GET /api/v1/shared/{token}` - Public analysis view
- `DELETE /api/v1/propiq/analyses/{id}/share` - Revoke link
- `GET /api/v1/propiq/analyses/{id}/share/analytics` - View stats

**Database Schema:**
```sql
CREATE TABLE shared_analyses (
  id UUID PRIMARY KEY,
  analysis_id UUID,
  token VARCHAR(32) UNIQUE,
  password_hash VARCHAR(255),
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ
);
```

**Public Page Features:**
- Read-only analysis view
- PropIQ branding header
- "Powered by PropIQ" footer
- "Sign up to analyze your properties" CTA
- No export buttons (encourages signup)

---

### Task 7: Advanced Filters & Search

**Why Important:**
- Find investment opportunities faster
- Custom investment criteria
- Market-specific searches

**Requirements:**
- Filter panel with collapsible sections
- Multiple filter categories:
  - **Location:** City, state, zip, radius
  - **Price:** Min/max purchase price
  - **Deal Quality:** Score range (0-100)
  - **Returns:** Cash flow, ROI, cap rate ranges
  - **Property Type:** SFH, multifamily, condo, etc.
  - **Date:** Analyzed in last week/month/year
  - **Status:** Favorites, shared, archived
- Filter combinations (AND logic)
- Save filter presets
- Clear all filters button
- Show result count in real-time

**Technical Approach:**
- **Backend:** Dynamic SQL query builder
- **Frontend:** FilterPanel component with chips
- **Performance:** Database indexes on all filter fields
- **UX:** Instant feedback, no page reload

**API Query Format:**
```
GET /api/v1/propiq/analyses?
  city=Austin&
  price_min=150000&
  price_max=300000&
  score_min=70&
  cash_flow_min=200&
  property_type=multifamily&
  date_from=2024-01-01&
  favorites=true&
  page=1&
  page_size=20
```

---

### Task 8: Batch Analysis (Power Feature)

**Why Important:**
- Analyze entire market at once
- Compare neighborhoods quickly
- Save time for power users

**Requirements:**
- Upload CSV with addresses
- Analyze up to 50 properties at once
- Background processing (job queue)
- Progress indicator
- Email notification when complete
- Bulk results view
- Export all to Excel
- Rate limiting (Pro/Elite tiers only)

**Technical Approach:**
- **Backend:** Celery or RQ for job queue
- **Frontend:** Upload modal, progress bar
- **Storage:** Job status in database or Redis
- **Processing:** Async analysis with retry logic

**API Endpoints:**
- `POST /api/v1/propiq/batch-analysis` - Upload CSV
- `GET /api/v1/propiq/batch-analysis/{job_id}` - Job status
- `GET /api/v1/propiq/batch-analysis/{job_id}/results` - Download results

**CSV Format:**
```csv
address,city,state,zip,purchase_price,down_payment_percent
123 Main St,Austin,TX,78701,250000,20
456 Oak Ave,Austin,TX,78702,280000,25
```

---

## Design Requirements

### PDF Report Design (0.5 FTE Designer)
- Professional template design
- PropIQ branding (colors: #8b5cf6 purple)
- Chart/graph styles
- Clean typography
- Mobile-friendly preview

### Comparison UI Design
- Responsive table layout
- Visual hierarchy (best/worst highlighting)
- Mobile: Cards instead of table
- Color coding for metrics

### Filter Panel Design
- Collapsible sections
- Chip-based selected filters
- Clear visual feedback
- Mobile: Bottom sheet or drawer

---

## Technical Implementation Plan

### Backend Architecture

**New Dependencies:**
```python
# requirements.txt additions
weasyprint>=60.0  # PDF generation
openpyxl>=3.1.0   # Excel export
celery>=5.3.0     # Background jobs (batch analysis)
redis>=5.0.1      # Job queue backend
boto3>=1.29.0     # S3 storage (optional)
```

**New Files to Create:**
1. `backend/utils/pdf_generator.py` - PDF generation
2. `backend/utils/excel_exporter.py` - Excel/CSV export
3. `backend/routers/exports.py` - Export endpoints
4. `backend/routers/comparisons.py` - Comparison endpoints
5. `backend/routers/collections.py` - Collections management
6. `backend/routers/shares.py` - Sharing functionality
7. `backend/tasks/batch_analysis.py` - Background jobs
8. `backend/templates/pdf/analysis_report.html` - PDF template

**Database Migrations:**
```sql
-- Add to Supabase
CREATE TABLE favorites (...);
CREATE TABLE collections (...);
CREATE TABLE collection_analyses (...);
CREATE TABLE shared_analyses (...);
CREATE TABLE batch_jobs (...);
```

### Frontend Architecture

**New Dependencies:**
```json
{
  "jspdf": "^2.5.1",
  "file-saver": "^2.0.5",
  "papaparse": "^5.4.1"
}
```

**New Components:**
1. `frontend/src/components/PDFExportButton.tsx`
2. `frontend/src/components/ExportMenu.tsx`
3. `frontend/src/components/PropertyComparison.tsx`
4. `frontend/src/components/CollectionManager.tsx`
5. `frontend/src/components/FilterPanel.tsx`
6. `frontend/src/components/ShareModal.tsx`
7. `frontend/src/components/BatchUploadModal.tsx`
8. `frontend/src/components/AnalysisHistory.tsx`

---

## Success Metrics

### Sprint 10-11 Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| PDF Export Usage | 30% of analyses exported | Analytics event |
| Comparison Usage | 15% of users compare properties | Feature adoption |
| Favorites | 40% of users save favorites | Active feature rate |
| Share Links | 10% of analyses shared | Share creation rate |
| Batch Analysis | 5% of Pro/Elite users | Power feature adoption |
| User Satisfaction | 4.5/5 stars | Feature rating survey |

---

## Testing Plan

### Unit Tests
- [ ] PDF generation functions
- [ ] Excel export formatting
- [ ] CSV parsing and validation
- [ ] Share token generation
- [ ] Filter query builder

### Integration Tests
- [ ] PDF export endpoint (with sample analysis)
- [ ] Excel export endpoint
- [ ] Comparison API
- [ ] Share link creation and access
- [ ] Batch analysis job creation

### E2E Tests (Playwright)
- [ ] Export PDF from analysis page
- [ ] Compare 3 properties side-by-side
- [ ] Create and manage favorites
- [ ] Share analysis and access via public link
- [ ] Upload CSV for batch analysis

---

## Deployment Checklist

### Backend
- [ ] Install new dependencies
- [ ] Run database migrations
- [ ] Deploy new routers
- [ ] Configure Celery (if using batch analysis)
- [ ] Set up Redis for job queue
- [ ] Configure S3/Azure Blob for large files

### Frontend
- [ ] Install new dependencies
- [ ] Add new components
- [ ] Update routes
- [ ] Build and test
- [ ] Deploy to production

### Infrastructure
- [ ] Set up Redis instance (for jobs)
- [ ] Configure file storage (S3/Azure)
- [ ] Set up email service (for batch notifications)
- [ ] Monitor export file sizes

---

## Timeline

### Week 1 (Sprint 10)
**Backend:**
- Day 1-2: PDF export system
- Day 3: Excel/CSV export
- Day 4-5: Favorites & collections backend

**Frontend:**
- Day 1-2: PDF export UI + loading states
- Day 3: Export menu component
- Day 4-5: Favorites UI + collection manager

**Designer:**
- Day 1-3: PDF report template design
- Day 4-5: Comparison UI mockups

### Week 2 (Sprint 11)
**Backend:**
- Day 1-2: Property comparison API
- Day 3: Share analysis system
- Day 4-5: Advanced filters + batch analysis

**Frontend:**
- Day 1-2: Property comparison component
- Day 3: Share modal + public view
- Day 4-5: Advanced filter panel

**Designer:**
- Day 1-2: Filter panel design
- Day 3-5: UI polish and responsive testing

---

## Future Enhancements (Post Sprint 11)

**Sprint 12+:**
- Property alerts (email when matching properties found)
- Mobile app (React Native)
- Market heat maps
- Investment portfolio tracking
- Property timelines (price history)
- Neighborhood rankings
- Automated valuation model (AVM)
- Integration with MLS data
- API for third-party integrations

---

**Status:** 🔄 IN PROGRESS
**Last Updated:** 2025-11-07
**Next Review:** After Task 1 (PDF Export) completion
