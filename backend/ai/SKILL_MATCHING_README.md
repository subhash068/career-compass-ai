# Skill Matching System

This document describes how skill matching works in the Career Compass AI system.

## Overview

The skill matching system is a multi-factor AI-driven approach that matches users' skills to career roles. It uses semantic embeddings, skill inference, and weighted scoring to provide accurate career recommendations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Career Service                                │
│                   (backend/services/career_service.py)              │
│  - Orchestrates career recommendations                              │
│  - Calculates match percentages                                     │
│  - Provides detailed breakdowns                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Career Scoring                                    │
│                  (backend/ai/career_scoring.py)                     │
│  - Multi-factor scoring engine                                      │
│  - Skill match + inferred skills + trends                           │
└─────────────────────────────────────────────────────────────────────┘
           │                    │                      │
           ▼                    ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐
│ Skill Similarity │  │  Skill Inference │  │ Conversation Memory │
│ (skill_similarity│  │ (skill_inference)│  │ (conversation_memory│
│      .py)        │  │      .py)        │  │       .py)          │
└──────────────────┘  └──────────────────┘  └─────────────────────┘
```

## Components

### 1. Skill Similarity (`skill_similarity.py`)

Computes semantic similarity between skills using embeddings.

**Methods:**
- `compute_similarity()` - Main entry point for similarity computation
- `_compute_embedding_similarity()` - Uses sentence embeddings (primary method)
- `_compute_tfidf_similarity()` - Fallback using TF-IDF

**Configuration:**
- Uses `AISettings.ENABLE_RAG` to toggle embedding usage
- Applies `RAG_SIMILARITY_THRESHOLD` for filtering results
- Falls back to TF-IDF if embeddings are disabled

**Output:**
```
python
{
    "index": int,
    "similarity": float,  # 0-1 score
    "skill_description": str,
    "method": "embeddings" | "tfidf",
    "confidence": float
}
```

### 2. Career Scoring (`career_scoring.py`)

Calculates multi-factor career match scores.

**Scoring Weights:**
| Factor | Weight | Description |
|--------|--------|-------------|
| Skill Match | 50% | Direct comparison of user scores vs required levels |
| Inferred Skills Bonus | 15% | Hidden skills detected via similarity |
| Skill Trend | 15% | Learning progress from conversation memory |
| Growth Rate | 10% | Historical improvement data |
| Learning Speed | 10% | Skill acquisition rate estimation |

**Skill Level to Score Mapping:**
| Level | Score |
|-------|-------|
| beginner | 25 |
| intermediate | 50 |
| advanced | 75 |
| expert | 100 |

**Matching Logic:**
1. **Full Match**: User score >= required score → 100% weight credit
2. **Partial Match**: User score >= 80% of required → 50% weight credit
3. **Similarity Bonus**: Similar skills can provide compensation (up to 10% bonus)

**Output:**
```
python
{
    "final_score": float,           # 0-100
    "skill_match": float,           # Base skill match percentage
    "inferred_bonus": float,       # Bonus from inferred skills
    "skill_trend": float,          # Learning trend (0-1)
    "growth_rate": float,           # Growth rate (0-1)
    "learning_speed": float,       # Learning speed (0-1)
    "missing_severity": List,      # Missing skills with severity
    "explanation": str,            # Human-readable explanation
    "key_skills": List,            # Top 3 important skills
    "confidence_level": float      # Confidence in the assessment
}
```

### 3. Skill Inference (`skill_inference.py`)

Detects hidden skills user might have based on existing skills.

**Process:**
1. Get user's current skills from database
2. Compare with all available skills using `SkillSimilarity`
3. Filter by confidence threshold (default: `SKILL_INFERENCE_THRESHOLD`)
4. Apply quality checks using `AIQualityMetrics`
5. Return inferred skills with confidence scores

**Confidence Calculation:**
```
python
confidence = (top_similarity * 0.7 + avg_similarity * 0.3)
```

**Output:**
```
python
{
    "inferred_skills": [
        {
            "skill_id": int,
            "name": str,
            "confidence": float,
            "inferred_from": [{"skill_id": int, "similarity": float}],
            "quality_score": float
        }
    ],
    "evaluation_metrics": {
        "total_candidates": int,
        "passed_threshold": int,
        "high_confidence": int
    }
}
```

### 4. Career Service (`career_service.py`)

High-level service that orchestrates the entire matching process.

**Key Methods:**
- `recommend_careers()` - Get top N career recommendations
- `_calculate_match_score()` - Calculate weighted match percentage
- `_get_user_skills_map()` - Get user's skills from assessments
- `get_details()` - Get detailed breakdown for a specific role

**Match Percentage Calculation:**
```
python
match_percentage = (matched_weight / total_weight) * 100
# Capped at 100%
```

**Additional Features:**
- Domain match bonus (+10% for roles in user's domain)
- Market outlook calculation based on growth rate and demand score
- Time to qualify estimation based on missing skills

## Data Flow

### 1. User Assessment → Skill Scores
```
SkillAssessment → SkillAssessmentSkill → user_skill_map
```
- Uses latest assessment scores for each skill
- Falls back to UserSkill table if no assessments exist

### 2. Role Requirements → Weighted Skills
```
JobRole → RoleSkillRequirement → skill_requirements
```
- Each role has multiple skill requirements
- Each requirement has: skill_id, required_level, weight

### 3. Scoring Process
```
user_skill_map + role_requirements
        │
        ▼
┌───────────────────┐
│ Calculate Match   │ ──→ skill_match (50%)
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Infer Hidden      │ ──→ inferred_bonus (15%)
│     Skills         │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Get Skill Trends  │ ──→ skill_trend (15%)
│ from Memory       │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Calculate Growth  │ ──→ growth_rate (10%)
│      Rate          │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Estimate Learning │ ──→ learning_speed (10%)
│      Speed         │
└───────────────────┘
        │
        ▼
    Final Score
```

## Configuration

### AI Settings (`config/ai_settings.py`)

| Setting | Description | Default |
|---------|-------------|---------|
| `ENABLE_RAG` | Enable embedding-based features | True |
| `RAG_SIMILARITY_THRESHOLD` | Minimum similarity for matching | 0.7 |
| `SKILL_INFERENCE_THRESHOLD` | Minimum confidence for inferred skills | 0.6 |
| `ENABLE_MEMORY` | Enable conversation memory features | True |

## Example Usage

```
python
from services.career_service import CareerService
from models.role_skill_requirement import RoleSkillRequirement

# Get career recommendations
recommendations = CareerService.recommend_careers(
    db=db,
    user_id=1,
    top_n=5,
    domain_id=1
)

# Each recommendation contains:
# - match_percentage: Overall match score
# - skill_match: Base skill match
# - inferred_bonus: Bonus from hidden skills
# - matched_skills: List of matched skill names
# - missing_skills: List of missing skill names
# - missing_severity: Detailed gap analysis
# - explanation: Human-readable assessment
```

## Quality Metrics

The system evaluates scoring quality through:

- **Score Consistency**: How well final score aligns with base skill match
- **Factors Used**: Number of scoring components applied
- **Confidence Level**: Overall confidence in the assessment (0-1)

```
python
{
    "factors_used": int,
    "overall_confidence": float,
    "score_consistency": float,
    "method_used": "phase_3a_enhanced" | "basic"
}
```

## Error Handling

The system includes fallback mechanisms:
- No assessments → Use UserSkill table
- Embeddings disabled → Use TF-IDF
- Inference fails → Return 0% bonus
- Any error → Return default response with 0 scores

## Related Files

- `backend/models/skill.py` - Skill model
- `backend/models/user_skill.py` - User skill mapping
- `backend/models/role_skill_requirement.py` - Role requirements
- `backend/models/job_role.py` - Job role definitions
- `backend/models/skill_assessment.py` - Assessment results
- `backend/routes/career.py` - API endpoints

## Testing Guide

### API Endpoints to Test

| Endpoint | Method | Description | Test Status |
|----------|--------|-------------|-------------|
| `/status` | GET | Health check | ✅ Verified |
| `/skills/` | GET | Get all skills | ✅ Documented |
| `/skills/{domain_id}` | GET | Get skills by domain | ✅ Documented |
| `/career/roles` | GET | Get all job roles | ✅ Documented |
| `/career/matches` | GET | Get career matches | ✅ Documented |
| `/career/details/{job_role_id}` | GET | Get career details | ✅ Documented |
| `/career/compare` | POST | Compare careers | ✅ Documented |
| `/career/trending` | GET | Get trending careers | ✅ Documented |

### Functions to Test

#### 1. Skill Similarity (`skill_similarity.py`)

| Function | Status | Test Method |
|----------|--------|-------------|
| `compute_similarity()` | ✅ Implemented | Unit test with sample skills |
| `_compute_embedding_similarity()` | ✅ Implemented | Test with embeddings enabled |
| `_compute_tfidf_similarity()` | ✅ Implemented | Test with embeddings disabled |
| `find_similar_skills_batch()` | ✅ Implemented | Test with multiple targets |
| `get_similarity_stats()` | ✅ Implemented | Test statistics calculation |

**Test Command:**
```
bash
# Test skill similarity
python -c "
from backend.ai.skill_similarity import SkillSimilarity
result = SkillSimilarity.compute_similarity(
    ['Python programming', 'JavaScript', 'SQL'],
    'Python data analysis',
    top_n=3
)
print(result)
"
```

#### 2. Career Scoring (`career_scoring.py`)

| Function | Status | Test Method |
|----------|--------|-------------|
| `calculate_multi_factor_score()` | ✅ Implemented | Integration test with user data |
| `_calculate_skill_match()` | ✅ Implemented | Unit test with known scores |
| `_calculate_inferred_skills_bonus()` | ✅ Implemented | Test with user skills |
| `_calculate_skill_trend()` | ✅ Implemented | Test with memory data |
| `_calculate_growth_rate()` | ✅ Implemented | Test with history |
| `_estimate_learning_speed()` | ✅ Implemented | Test with skill data |
| `_classify_missing_skills()` | ✅ Implemented | Test with gaps |
| `_generate_explanation()` | ✅ Implemented | Test explanation format |
| `_get_key_skills()` | ✅ Implemented | Test priority |
| `_level_to_score()` | ✅ Implemented | Test mapping |

**Test Command:**
```
bash
# Test career scoring (requires database)
python -c "
from backend.models.database import get_db
from backend.ai.career_scoring import CareerScoring
from backend.models.role_skill_requirement import RoleSkillRequirement

db = next(get_db())
# Add test code here
"
```

#### 3. Skill Inference (`skill_inference.py`)

| Function | Status | Test Method |
|----------|--------|-------------|
| `calibrate_confidence()` | ✅ Implemented | Test with various inputs |
| `detect_hidden_skills()` | ✅ Implemented | Test inference |
| `apply_similarity_bonus()` | ✅ Implemented | Test bonus application |
| `get_inference_stats()` | ✅ Implemented | Test statistics |

**Test Command:**
```
bash
# Test skill inference
python -c "
from backend.ai.skill_inference import SkillInference
# Add test code here
"
```

#### 4. Career Service (`career_service.py`)

| Function | Status | Test Method |
|----------|--------|-------------|
| `get_matches()` | ✅ Implemented | API test |
| `recommend_careers()` | ✅ Implemented | API test |
| `compare_careers()` | ✅ Implemented | API test |
| `get_trending_careers()` | ✅ Implemented | API test |
| `_calculate_match_score()` | ✅ Implemented | Unit test |
| `get_details()` | ✅ Implemented | API test |

### Running API Tests

```
bash
# From the project root
python tests/api_tests.py

# Or test specific endpoints
python -c "
import requests
BASE_URL = 'http://localhost:5000'

# Test career matches endpoint
r = requests.get(f'{BASE_URL}/career/matches', 
    headers={'Authorization': 'Bearer YOUR_TOKEN'})
print(r.json())
"
```

### Expected Response Formats

#### Career Match Response
```
json
{
  "recommendations": [
    {
      "role_id": 1,
      "title": "Software Engineer",
      "match_percentage": 85.5,
      "skill_match": 80.0,
      "inferred_bonus": 5.5,
      "matched_skills": ["Python", "JavaScript"],
      "missing_skills": ["System Design"],
      "explanation": "Good match with some skills to improve."
    }
  ]
}
```

#### Skill Similarity Response
```
json
[
  {
    "index": 0,
    "similarity": 0.92,
    "skill_description": "Python programming",
    "method": "embeddings",
    "confidence": 0.95
  }
]
```

### Test Data Requirements

1. **Users**: At least one user with skills
2. **Skills**: Multiple skills in the database
3. **Domains**: At least one domain
4. **Job Roles**: At least one job role with requirements
5. **Role Skill Requirements**: Skills linked to job roles

### Verification Checklist

- [ ] Server starts without errors
- [ ] `/status` returns healthy status
- [ ] `/skills/` returns skill list
- [ ] `/career/roles` returns job roles
- [ ] `/career/matches` returns recommendations
- [ ] Career scoring calculates correct percentages
- [ ] Skill similarity finds related skills
- [ ] Skill inference detects hidden skills
- [ ] Error handling works correctly
- [ ] Fallback to TF-IDF works when embeddings disabled

---

## Implementation Status

### ✅ All Functions Implemented

All skill matching functions are implemented and code is syntactically correct:

| Module | File | Functions | Status |
|--------|------|-----------|--------|
| Skill Similarity | `skill_similarity.py` | 5 functions | ✅ Implemented |
| Career Scoring | `career_scoring.py` | 11 functions | ✅ Implemented |
| Skill Inference | `skill_inference.py` | 4 functions | ✅ Implemented |
| Career Service | `career_service.py` | 8 functions | ✅ Implemented |

### Testing Notes

**Unit tests require:**
1. MySQL database running with proper schema
2. All dependencies installed (see `requirements.txt`)
3. Environment variables configured (`.env` file)

**API tests require:**
1. FastAPI server running on `localhost:5000`
2. Database populated with test data
3. Authentication token for protected endpoints

The test script `test_skill_matching.py` has been created but requires the full environment to execute.
