
# read resume
import os
import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

job_description = input("Enter job description: ")

folder = "resumes"

scores = {}

for file in os.listdir(folder):
    path = os.path.join(folder, file)

    pdf = open(path, "rb")
    reader = PyPDF2.PdfReader(pdf)

    text = ""
    for page in reader.pages:
        text += page.extract_text()

    vector = TfidfVectorizer()
    matrix = vector.fit_transform([text, job_description])

    similarity = cosine_similarity(matrix[0:1], matrix[1:2])

    scores[file] = similarity[0][0]

# sort results
ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)

print("Ranking Results:\n")
for file, score in ranked:
    print(file, ":", score)