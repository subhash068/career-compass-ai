# Settings Implementation TODO
## Approved Plan Steps
### 1. Backend Database & Model Updates (DB Schema)
- [ ] Generate Alembic migration for new User profile fields
- [ ] Implement migration changes
- [ ] Update backend/models/user.py (add fields + to_dict)
### 2. Backend Services
- [ ] Create backend/services/profile_service.py
### 3. Backend API Updates
- [ ] Update backend/routes/profile.py (add PUT /profile, extend GET)
- [ ] Create backend/schemas/profile.py (ProfileUpdate schema)
### 4. Frontend Updates
- [ ] Update frontend/src/pages/Settings.tsx (add tabs + Profile form)
- [ ] Extend frontend/src/api/profile.api.ts (PUT update)
- [ ] Add types to frontend/src/types/index.ts
### 5. Migration & Testing
- [ ] Run Alembic migration
- [ ] Test backend APIs
- [ ] Test frontend form integration
- [ ] attempt_completion
**Next: Step 1 - Generate Alembic migration**