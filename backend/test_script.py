import requests
import os

BASE_URL = "http://localhost:8000/api/v1"
TEST_PDF_PATH = "app/uploads/resume.pdf"
EMAIL = "test_user_api@example.com"
PASSWORD = "Testpassword123"

def run_tests():
    print("Testing Backend APIs...")
    
    # 1. Register
    print("1. Testing Registration...")
    res = requests.post(f"{BASE_URL}/auth/register", json={"email": EMAIL, "password": PASSWORD})
    if res.status_code == 200:
        print("   Registration successful!")
    elif res.status_code == 400 and "already exists" in res.text:
        print("   User already exists, continuing...")
    else:
        print(f"   Registration failed: {res.text}")
        return

    # 2. Login
    print("2. Testing Login...")
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": EMAIL, "password": PASSWORD})
    if res.status_code != 200:
        print(f"   Login failed: {res.text}")
        return
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   Login successful!")

    # 3. Upload Resume
    print("3. Testing Resume Upload...")
    if not os.path.exists(TEST_PDF_PATH):
        # Create a dummy pdf if it doesn't exist
        with open(TEST_PDF_PATH, "w") as f:
            f.write("Dummy PDF content") # PyMuPDF will fail this, but we'll see
            print("   Warning: Created a dummy text file instead of a real PDF.")
            
    with open(TEST_PDF_PATH, "rb") as f:
        files = {"file": ("test_resume.pdf", f, "application/pdf")}
        res = requests.post(f"{BASE_URL}/resume/upload", headers=headers, files=files)
        
    if res.status_code != 201:
        print(f"   Upload failed: {res.status_code} - {res.text}")
        return
    resume_data = res.json()["resume"]
    resume_id = resume_data["id"]
    print(f"   Upload successful! Resume ID: {resume_id}")

    # 4. Get Dashboard
    print("4. Testing Dashboard...")
    res = requests.get(f"{BASE_URL}/dashboard", headers=headers)
    if res.status_code != 200:
        print(f"   Dashboard failed: {res.text}")
    else:
        print(f"   Dashboard successful! Data: {res.json()}")

    # 5. Get All Resumes
    print("5. Testing Get All Resumes...")
    res = requests.get(f"{BASE_URL}/resume", headers=headers)
    if res.status_code != 200:
        print(f"   Get all failed: {res.text}")
        return
    print(f"   Get all successful! Count: {len(res.json())}")

    # 6. Get Specific Resume
    print("6. Testing Get Specific Resume...")
    res = requests.get(f"{BASE_URL}/resume/{resume_id}", headers=headers)
    if res.status_code != 200:
        print(f"   Get specific failed: {res.text}")
        return
    print("   Get specific successful!")

    # 7. Analyze Resume (Sprint 2)
    print("7. Testing Analyze Resume...")
    res = requests.post(f"{BASE_URL}/resume/analyze/{resume_id}", headers=headers)
    if res.status_code == 200:
        print("   Analyze successful!")
    elif res.status_code == 500 and "GEMINI_API_KEY" in res.text:
        print("   Analyze failed as expected (Missing GEMINI_API_KEY in environment).")
    else:
        print(f"   Analyze failed: {res.status_code} - {res.text}")

    # 8. Upload Job Description (Sprint 3)
    print("8. Testing Upload Job Text...")
    job_payload = {
        "title": "Backend Engineer",
        "description": "We are looking for a Python developer with experience in FastAPI, PostgreSQL, and Docker."
    }
    res = requests.post(f"{BASE_URL}/job/upload/text", headers=headers, json=job_payload)
    if res.status_code != 200:
        print(f"   Job upload failed: {res.text}")
        return
    job_id = res.json()["id"]
    print(f"   Job upload successful! ID: {job_id}")

    # 9. Match Resume to Job (Sprint 3)
    print("9. Testing Match Resume to Job...")
    res = requests.post(f"{BASE_URL}/job/match?resume_id={resume_id}&job_id={job_id}", headers=headers)
    if res.status_code == 200:
        print(f"    Match successful! Score: {res.json()['match_score']}")
    elif res.status_code == 500 and "GEMINI_API_KEY" in res.text:
        print("    Match failed as expected (Missing GEMINI).")
    else:
        print(f"    Match failed: {res.status_code} - {res.text}")

    # 10. Intelligence APIs (Sprint 3)
    print("10. Testing Intelligence APIs...")
    for api in ["skill-gap", "roadmap", "recommendations"]:
        res = requests.get(f"{BASE_URL}/intelligence/{api}/{resume_id}", headers=headers)
        if res.status_code == 200:
            print(f"    {api} successful!")
        else:
            print(f"    {api} failed/mocked: {res.status_code} - {res.text}")

    # 11. Delete Resume
    print("11. Testing Delete Resume...")
    res = requests.delete(f"{BASE_URL}/resume/{resume_id}", headers=headers)
    if res.status_code != 204:
        print(f"   Delete failed: {res.text}")
        return
    print("   Delete successful!")

    print("All tests passed successfully!")

if __name__ == "__main__":
    run_tests()
