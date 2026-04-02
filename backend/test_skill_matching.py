"""
Test script to verify skill matching functions
"""
import sys
import os

# Add backend to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

def test_skill_similarity():
    """Test skill similarity module"""
    print("\n=== Testing Skill Similarity ===")
    try:
        from ai.skill_similarity import SkillSimilarity
        
        # Test compute_similarity
        result = SkillSimilarity.compute_similarity(
            ['Python programming', 'JavaScript', 'SQL', 'Machine Learning'],
            'Python data analysis',
            top_n=3
        )
        
        print(f"✅ compute_similarity works: {len(result)} results")
        if result:
            print(f"   Top match: {result[0].get('skill_description', 'N/A')}")
            print(f"   Similarity: {result[0].get('similarity', 0):.2f}")
            print(f"   Method: {result[0].get('method', 'N/A')}")
        
        # Test find_similar_skills_batch
        batch_result = SkillSimilarity.find_similar_skills_batch(
            ['Python programming', 'JavaScript', 'SQL'],
            ['Data Analysis', 'Web Development'],
            top_n=2
        )
        print(f"✅ find_similar_skills_batch works: {len(batch_result)} targets")
        
        # Test get_similarity_stats
        stats = SkillSimilarity.get_similarity_stats(
            ['Python programming', 'JavaScript', 'SQL'],
            'Python data analysis'
        )
        print(f"✅ get_similarity_stats works: {stats.get('method_used', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"❌ Skill Similarity test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_career_scoring():
    """Test career scoring module"""
    print("\n=== Testing Career Scoring ===")
    try:
        from ai.career_scoring import CareerScoring
        
        # Test _level_to_score
        levels = CareerScoring._level_to_score("beginner")
        print(f"✅ _level_to_score: beginner = {levels}")
        
        levels = CareerScoring._level_to_score("intermediate")
        print(f"✅ _level_to_score: intermediate = {levels}")
        
        levels = CareerScoring._level_to_score("advanced")
        print(f"✅ _level_to_score: advanced = {levels}")
        
        levels = CareerScoring._level_to_score("expert")
        print(f"✅ _level_to_score: expert = {levels}")
        
        # Test _get_key_skills (mock requirements)
        class MockSkill:
            def __init__(self, name):
                self.name = name
        
        class MockRequirement:
            def __init__(self, skill, weight):
                self.skill = skill
                self.weight = weight
        
        mock_reqs = [
            MockRequirement(MockSkill("Python"), 0.4),
            MockRequirement(MockSkill("JavaScript"), 0.3),
            MockRequirement(MockSkill("SQL"), 0.2),
            MockRequirement(MockSkill("Git"), 0.1),
        ]
        
        key_skills = CareerScoring._get_key_skills(mock_reqs)
        print(f"✅ _get_key_skills: {key_skills}")
        
        return True
    except Exception as e:
        print(f"❌ Career Scoring test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_skill_inference():
    """Test skill inference module"""
    print("\n=== Testing Skill Inference ===")
    try:
        from ai.skill_inference import SkillInference
        
        # Test calibrate_confidence
        result = SkillInference.calibrate_confidence(
            base_score=75.0,
            user_confidence=80
        )
        print(f"✅ calibrate_confidence: {result.get('calibrated_score', 0):.1f}")
        
        # Test apply_similarity_bonus (mock user skill)
        class MockSkill:
            def __init__(self):
                self.name = "Python"
                self.description = "Programming language"
        
        class MockUserSkill:
            def __init__(self):
                self.skill = MockSkill()
                self.score = 70
        
        user_skill = MockUserSkill()
        similar_skills = [
            {"similarity": 0.9},
            {"similarity": 0.8},
            {"similarity": 0.7}
        ]
        
        bonus_result = SkillInference.apply_similarity_bonus(
            user_skill, similar_skills, 0.1
        )
        print(f"✅ apply_similarity_bonus: {bonus_result.get('new_score', 0):.1f}")
        
        return True
    except Exception as e:
        print(f"❌ Skill Inference test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_career_service():
    """Test career service module"""
    print("\n=== Testing Career Service ===")
    try:
        from services.career_service import CareerService
        
        # Test _level_to_score
        levels = CareerService._level_to_score("beginner")
        print(f"✅ _level_to_score: beginner = {levels}")
        
        levels = CareerService._level_to_score("intermediate")
        print(f"✅ _level_to_score: intermediate = {levels}")
        
        # Test _calculate_market_outlook
        class MockRole:
            growth_rate = 10.0
            demand_score = 80
        
        role = MockRole()
        outlook = CareerService._calculate_market_outlook(role)
        print(f"✅ _calculate_market_outlook: {outlook}")
        
        # Test _estimate_time_to_qualify
        missing_severity = [
            {"severity": "high"},
            {"severity": "high"},
            {"severity": "medium"}
        ]
        time_est = CareerService._estimate_time_to_qualify(missing_severity)
        print(f"✅ _estimate_time_to_qualify: {time_est}")
        
        return True
    except Exception as e:
        print(f"❌ Career Service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("Skill Matching Functions Test")
    print("=" * 60)
    
    results = {
        "Skill Similarity": test_skill_similarity(),
        "Career Scoring": test_career_scoring(),
        "Skill Inference": test_skill_inference(),
        "Career Service": test_career_service(),
    }
    
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for module, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{module}: {status}")
        if not passed:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("All tests PASSED!")
    else:
        print("Some tests FAILED!")
    
    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
